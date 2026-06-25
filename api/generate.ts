import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function Configuration
export const maxDuration = 30; // seconds

// ─── LRU Cache Helper (For Preset Demonstrations Only) ────────────────────────
class LRUCache<K, V> {
  private capacity: number;
  private ttl: number;
  private cache: Map<K, { value: V; expiry: number }> = new Map();

  constructor(capacity: number, ttlMs: number) {
    this.capacity = capacity;
    this.ttl = ttlMs;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { value, expiry: Date.now() + this.ttl });
  }
}

// Global Cache for Presets only
const PRESET_CACHE = new LRUCache<string, any>(50, 10 * 60 * 1000); // 50 entries, 10 min TTL
const PENDING_API_REQUESTS = new Map<string, Promise<any>>();
let cachedIamToken: { token: string; expiresAt: number } | null = null;
let pendingTokenPromise: Promise<string | null> | null = null;

// ─── Preset Matching Helper ──────────────────────────────────────────────────
const PRESET_SUBSTRINGS = [
  'attempting to play the ball',
  'violently lunged at the attacker',
  'near his side during a sliding',
  'deliberately touched the ball with his',
  'shared a project update document',
  'leaked sensitive proprietary company',
  'ivan perišić\'s arm makes contact',
  'var intervention mechanism',
  'nigel de jong kicks',
  'kylian mbappé receives the ball',
  'luis suárez intentionally handles'
];

function isPresetIncident(text: string): boolean {
  const lower = text.toLowerCase();
  return PRESET_SUBSTRINGS.some(sub => lower.includes(sub));
}

// ─── Fetch with timeout ───────────────────────────────────────────────────────
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

// ─── Fetch with retry strategy ───────────────────────────────────────────────
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  retries = 2,
  delayMs = 1000
): Promise<Response> {
  try {
    return await fetchWithTimeout(url, options, timeoutMs);
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    console.warn(`[Retry Handler] API call failed, retrying in ${delayMs}ms. Error:`, error);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fetchWithRetry(url, options, timeoutMs, retries - 1, delayMs * 2);
  }
}

// ─── IAM Token Fetcher with deduplication and caching ───────────────────────
async function getIamToken(apiKey: string, logs: string[]): Promise<string | null> {
  if (cachedIamToken && cachedIamToken.expiresAt > Date.now()) {
    logs.push(`[${new Date().toISOString()}] [IAM Token] Using cached IAM OAuth token.`);
    return cachedIamToken.token;
  }
  if (pendingTokenPromise) {
    logs.push(`[${new Date().toISOString()}] [IAM Token] Awaiting active IAM OAuth token generation request.`);
    return pendingTokenPromise;
  }

  pendingTokenPromise = (async () => {
    try {
      logs.push(`[${new Date().toISOString()}] [IAM Token] Requesting new IAM OAuth token from IBM Cloud.`);
      const tokenResponse = await fetchWithRetry(
        'https://iam.cloud.ibm.com/identity/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
            apikey: apiKey,
          }),
        },
        8000,
        2,
        500
      );

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token ?? null;
        if (accessToken) {
          const expiresIn = tokenData.expires_in ?? 3600;
          cachedIamToken = {
            token: accessToken,
            expiresAt: Date.now() + (expiresIn - 300) * 1000,
          };
          logs.push(`[${new Date().toISOString()}] [IAM Token] IAM OAuth token successfully retrieved and cached.`);
          return accessToken;
        }
      }
      throw new Error(`IAM token endpoint returned status ${tokenResponse.status}`);
    } catch (tokenErr: any) {
      logs.push(`[${new Date().toISOString()}] [IAM Token] [FAIL] Token retrieval failed: ${tokenErr?.message ?? tokenErr}`);
      throw tokenErr;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return pendingTokenPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, loadedText, forceFallback } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing incident text' });
  }

  const cleanText = text.trim();
  const cleanLoadedText =
    loadedText && typeof loadedText === 'string' && loadedText.trim()
      ? loadedText.trim()
      : undefined;

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] [Inference Start] Received incident text: "${cleanText.substring(0, 50)}..."`);

  const requestIsPreset = isPresetIncident(cleanText) || (cleanLoadedText && isPresetIncident(cleanLoadedText));
  
  // ─── Flow A: Reference Benchmark (Fallback / Preset) ───────────────────────
  if (forceFallback || requestIsPreset) {
    logs.push(`[${new Date().toISOString()}] [Flow Route] Preset or Explicit Reference Benchmark requested.`);
    const cacheKey = cleanLoadedText ? `preset_${cleanText}|||${cleanLoadedText}` : `preset_${cleanText}`;
    
    // Check Preset Cache
    const cachedResponse = PRESET_CACHE.get(cacheKey);
    if (cachedResponse) {
      logs.push(`[${new Date().toISOString()}] [Preset Cache] Cache HIT. Returning pre-audited reference response.`);
      cachedResponse._metadata.cacheStatus = 'HIT';
      cachedResponse._metadata.logs = [...logs, `[${new Date().toISOString()}] [Complete] Preset loaded from cache.`];
      return res.status(200).json(cachedResponse);
    }

    logs.push(`[${new Date().toISOString()}] [Preset Cache] Cache MISS. Loading pre-audited reference benchmarks.`);
    // Get Mock Response
    let mockResult: any;
    if (cleanLoadedText) {
      mockResult = {
        neutral: generateMockResponse(cleanText, logs),
        loaded: generateMockResponse(cleanLoadedText, logs),
      };
      mockResult.neutral._metadata.cacheStatus = 'MISS / CACHED';
      mockResult.neutral._metadata.connectionStatus = 'OFFLINE / REFERENCE BENCHMARK';
      mockResult.neutral._metadata.modelId = 'Audited Reference Benchmark';
      mockResult.loaded._metadata.cacheStatus = 'MISS / CACHED';
      mockResult.loaded._metadata.connectionStatus = 'OFFLINE / REFERENCE BENCHMARK';
      mockResult.loaded._metadata.modelId = 'Audited Reference Benchmark';
    } else {
      mockResult = generateMockResponse(cleanText, logs);
      mockResult._metadata.cacheStatus = 'MISS / CACHED';
      mockResult._metadata.connectionStatus = 'OFFLINE / REFERENCE BENCHMARK';
      mockResult._metadata.modelId = 'Audited Reference Benchmark';
    }

    PRESET_CACHE.set(cacheKey, mockResult);
    const finalLogs = [...logs, `[${new Date().toISOString()}] [Complete] Preset loaded and cached.`];
    if (cleanLoadedText) {
      mockResult.neutral._metadata.logs = finalLogs;
      mockResult.loaded._metadata.logs = finalLogs;
    } else {
      mockResult._metadata.logs = finalLogs;
    }
    return res.status(200).json(mockResult);
  }

  // ─── Flow B: Custom Live Inference (No Cache, Calls IBM) ───────────────────
  logs.push(`[${new Date().toISOString()}] [Flow Route] Custom user incident detected. Routing to live IBM watsonx.ai.`);
  const cacheKey = cleanLoadedText ? `custom_${cleanText}|||${cleanLoadedText}` : `custom_${cleanText}`;

  // In-flight deduplication to prevent concurrent double-clicks from running duplicate inferences
  let pendingPromise = PENDING_API_REQUESTS.get(cacheKey);
  if (pendingPromise) {
    logs.push(`[${new Date().toISOString()}] [Request Deduplication] Reusing active concurrent live inference request.`);
    try {
      const responsePayload = await pendingPromise;
      return res.status(200).json(responsePayload);
    } catch (err: any) {
      return res.status(502).json({
        error: 'IBM watsonx.ai is currently unavailable',
        code: 'WATSONX_API_FAILURE',
        details: err?.message ?? String(err),
        logs,
      });
    }
  }

  const requestPromise = (async () => {
    const watsonxApiKey = process.env.WATSONX_API_KEY;
    const watsonxProjectId = process.env.WATSONX_PROJECT_ID;

    if (!watsonxApiKey || !watsonxProjectId) {
      logs.push(`[${new Date().toISOString()}] [Environment] [FAIL] Watsonx credentials are not configured in backend.`);
      throw new Error('IBM watsonx.ai credentials are not configured on the server.');
    }
    logs.push(`[${new Date().toISOString()}] [Environment] Environment credentials validated.`);

    const accessToken = await getIamToken(watsonxApiKey, logs);
    if (!accessToken) {
      throw new Error('Failed to retrieve active OAuth token.');
    }

    if (cleanLoadedText) {
      logs.push(`[${new Date().toISOString()}] [Model Query] Sending parallel requests for neutral and loaded phrasings.`);
      const [neutralPayload, loadedPayload] = await Promise.all([
        callWatsonx(cleanText, accessToken, watsonxProjectId, logs),
        callWatsonx(cleanLoadedText, accessToken, watsonxProjectId, logs),
      ]);
      return {
        neutral: neutralPayload,
        loaded: loadedPayload,
      };
    } else {
      logs.push(`[${new Date().toISOString()}] [Model Query] Sending live generation request.`);
      return await callWatsonx(cleanText, accessToken, watsonxProjectId, logs);
    }
  })();

  PENDING_API_REQUESTS.set(cacheKey, requestPromise);

  try {
    const finalPayload = await requestPromise;
    logs.push(`[${new Date().toISOString()}] [Complete] Live inference successfully generated and validated.`);
    
    // Add logs & status variables
    const finalLogs = [...logs];
    if (cleanLoadedText) {
      finalPayload.neutral._metadata.logs = finalLogs;
      finalPayload.loaded._metadata.logs = finalLogs;
    } else {
      finalPayload._metadata.logs = finalLogs;
    }

    return res.status(200).json(finalPayload);
  } catch (error: any) {
    logs.push(`[${new Date().toISOString()}] [Pipeline FAIL] Pipeline execution failed: ${error?.message ?? error}`);
    // DO NOT fall back to mock data. Return a structured 502 Gateway Error
    return res.status(502).json({
      error: 'IBM watsonx.ai is currently unavailable',
      code: 'WATSONX_API_FAILURE',
      details: error?.message ?? String(error),
      logs,
    });
  } finally {
    PENDING_API_REQUESTS.delete(cacheKey);
  }
}

// ─── Watsonx direct call — 20s timeout with retry ────────────────────────────
async function callWatsonx(
  text: string,
  accessToken: string,
  watsonxProjectId: string,
  logs: string[]
) {
  const systemInstruction = 'You are an expert rules interpreter. Always reply strictly in JSON format without markdown code blocks.';
  const rawPrompt = `You are an expert rules interpreter for high-stakes decision systems. Analyze the following incident and provide 4 perspectives: Fan (Purposive Reading), Referee (Contextual Reading), VAR (Procedural Reading), and Rulebook (Strict Constructionist Reading).

Also identify the key undefined term that is causing interpretive disagreement (the tension term), and rate the ambiguity on a scale of 1-10.

Incident: "${text}"

Respond EXACTLY in this JSON format, with no markdown formatting, no backticks, and no conversational text:
{
  "retrievedLaw": "Law/Regulation X - Brief quote or summary of the applicable rule...",
  "tensionTerm": "the exact undefined word or phrase causing disagreement",
  "ambiguityScore": 8.5,
  "interpretationSpread": {
    "purposive": 85,
    "contextual": 40,
    "procedural": 65,
    "strict": 50
  },
  "perspectives": [
    { "persona": "Fan", "text": "Purposive/Intent-based interpretation: what was the spirit, objective, or moral intent of the rule/action here..." },
    { "persona": "Referee", "text": "Contextual/Textualist interpretation: how does the text of the rule apply to the physical context and observable facts..." },
    { "persona": "VAR", "text": "Procedural-Threshold interpretation: did this action cross the strict procedural threshold required to warrant intervention..." },
    { "persona": "Rulebook", "text": "Strict Constructionist interpretation: the literal, rigid interpretation of the exact wordings of the rule..." }
  ]
}`;

  const prompt = `<|system|>\n${systemInstruction}\n<|user|>\n${rawPrompt}\n<|assistant|>\n`;

  const watsonxUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
  const watsonxModelId = process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-chat-v2';
  const url = `${watsonxUrl.replace(/\/$/, '')}/ml/v1/text/generation?version=2023-05-29`;

  logs.push(`[${new Date().toISOString()}] [Model Query] Querying model ID: "${watsonxModelId}" via ${url}`);

  const watsonxResponse = await fetchWithRetry(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        input: prompt,
        parameters: {
          decoding_method: 'greedy',
          max_new_tokens: 800,
          repetition_penalty: 1,
        },
        model_id: watsonxModelId,
        project_id: watsonxProjectId,
      }),
    },
    20000,
    2,
    1000
  );

  const responseStatus = watsonxResponse.status;
  const responseBody = await watsonxResponse.text().catch(() => '(unreadable)');

  if (!watsonxResponse.ok) {
    throw new Error(`Watsonx API query failed with status ${responseStatus}. Response: ${responseBody.substring(0, 100)}`);
  }

  const watsonxData = JSON.parse(responseBody);
  let generatedText: string = watsonxData.results?.[0]?.generated_text ?? '';

  logs.push(`[${new Date().toISOString()}] [JSON Parser] Received raw model text. Trimming markdown block markers.`);

  // Strip markdown fences and leading/trailing whitespace
  generatedText = generatedText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Extract the first JSON object in the response (handles conversational prefix)
  const jsonStart = generatedText.indexOf('{');
  const jsonEnd = generatedText.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    generatedText = generatedText.slice(jsonStart, jsonEnd + 1);
  }

  logs.push(`[${new Date().toISOString()}] [JSON Parser] Parsing JSON structure.`);
  const parsedPayload = JSON.parse(generatedText);

  logs.push(`[${new Date().toISOString()}] [Schema Validation] Validating parsed payload structure.`);

  // ─── STRICT SCHEMA VALIDATION ──────────────────────────────────────────────
  if (!parsedPayload.retrievedLaw || typeof parsedPayload.retrievedLaw !== 'string') {
    throw new Error('Schema violation: "retrievedLaw" field is missing or not a string.');
  }
  if (!parsedPayload.tensionTerm || typeof parsedPayload.tensionTerm !== 'string') {
    throw new Error('Schema violation: "tensionTerm" field is missing or not a string.');
  }
  if (typeof parsedPayload.ambiguityScore !== 'number') {
    throw new Error('Schema violation: "ambiguityScore" field is missing or not a number.');
  }
  if (!parsedPayload.interpretationSpread || typeof parsedPayload.interpretationSpread !== 'object') {
    throw new Error('Schema violation: "interpretationSpread" field is missing or not an object.');
  }
  if (!Array.isArray(parsedPayload.perspectives) || parsedPayload.perspectives.length < 4) {
    throw new Error('Schema violation: "perspectives" field must be an array with at least 4 items.');
  }

  const requiredPersonas = ['Fan', 'Referee', 'VAR', 'Rulebook'];
  const validatedPerspectives = requiredPersonas.map(persona => {
    const match = parsedPayload.perspectives.find(
      (p: any) => p && typeof p.persona === 'string' && p.persona.toLowerCase().includes(persona.toLowerCase())
    );
    if (!match || typeof match.text !== 'string' || !match.text.trim()) {
      throw new Error(`Schema violation: Perspective for persona "${persona}" is missing or contains invalid text.`);
    }
    return {
      persona,
      text: match.text.trim(),
    };
  });

  const validatedSpread = {
    purposive: typeof parsedPayload.interpretationSpread.purposive === 'number' ? parsedPayload.interpretationSpread.purposive : 50,
    contextual: typeof parsedPayload.interpretationSpread.contextual === 'number' ? parsedPayload.interpretationSpread.contextual : 50,
    procedural: typeof parsedPayload.interpretationSpread.procedural === 'number' ? parsedPayload.interpretationSpread.procedural : 50,
    strict: typeof parsedPayload.interpretationSpread.strict === 'number' ? parsedPayload.interpretationSpread.strict : 50,
  };

  logs.push(`[${new Date().toISOString()}] [Schema Validation] [PASS] Payload conforms strictly to expected output schema.`);

  return {
    retrievedLaw: parsedPayload.retrievedLaw.trim(),
    tensionTerm: parsedPayload.tensionTerm.trim(),
    ambiguityScore: parsedPayload.ambiguityScore,
    interpretationSpread: validatedSpread,
    perspectives: validatedPerspectives,
    _metadata: {
      modelId: watsonxModelId,
      prompt: prompt,
      inferenceStatus: 'LIVE_WATSONX_AI',
      executionMode: 'Greedy / Deterministic',
      cacheStatus: 'BYPASSED',
      connectionStatus: 'ONLINE / LIVE',
    }
  };
}

// ─── Reference Benchmark mock payload generator ─────────────────────────────
function generateMockResponse(incidentText: string, logs: string[]) {
  const lowerText = incidentText.toLowerCase();
  logs.push(`[${new Date().toISOString()}] [Mock Reference] Checking local reference benchmarks for match.`);

  // Default Fallbacks matched to known incident types
  if (lowerText.includes('employee') || lowerText.includes('disclosure') || lowerText.includes('contractor')) {
    logs.push(`[${new Date().toISOString()}] [Mock Reference] Match found: Compliance Data Disclosure.`);
    const isLoaded = lowerText.includes('leak') || lowerText.includes('unauthorized') || lowerText.includes('breach');
    return {
      retrievedLaw: 'Section 4.2 (Information Security & Data Protection Policy)\n\nEmployees must safeguard company information. Unauthorized transmission of proprietary business data to external third parties is strictly prohibited.',
      tensionTerm: 'authorized',
      ambiguityScore: isLoaded ? 9.1 : 7.2,
      interpretationSpread: {
        purposive: isLoaded ? 92 : 35,
        contextual: isLoaded ? 88 : 28,
        procedural: isLoaded ? 95 : 42,
        strict: 80,
      },
      perspectives: [
        { persona: 'Fan', text: isLoaded ? 'Purposive Reading: Bypassing security protocols to leak data constitutes a major violation regardless of motive.' : 'Purposive Reading: External qa check was done in good faith to hit target milestones.' },
        { persona: 'Referee', text: isLoaded ? 'Contextual Reading: Unpermitted transfer of proprietary files is a direct violation under existing facts.' : 'Contextual Reading: A valid master agreement protected the data. It stayed within the legal circle.' },
        { persona: 'VAR', text: isLoaded ? 'Procedural Reading: Immediate escalation triggered. Transfer crossed severity threshold.' : 'Procedural Reading: The review did not cover system-wide core assets, below intervention threshold.' },
        { persona: 'Rulebook', text: 'Strict Constructionist Reading: All disclosures must be pre-cleared by legal counsel. Intent is irrelevant.' }
      ],
      _metadata: {
        modelId: 'Audited Reference Benchmark',
        inferenceStatus: 'REFERENCE_BENCHMARK',
        executionMode: 'Pre-audited',
        cacheStatus: 'HIT',
        connectionStatus: 'OFFLINE / REFERENCE BENCHMARK',
      }
    };
  }

  if (lowerText.includes('handball') || lowerText.includes('arm') || lowerText.includes('deliberately')) {
    logs.push(`[${new Date().toISOString()}] [Mock Reference] Match found: Handball Offense.`);
    const isLoaded = lowerText.includes('deliberately') || lowerText.includes('extended') || lowerText.includes('outward');
    return {
      retrievedLaw: 'Law 12 (Handling the ball)\n\nIt is an offence if a player deliberately touches the ball with their hand/arm, or makes their body unnaturally bigger.',
      tensionTerm: 'deliberately',
      ambiguityScore: isLoaded ? 9.4 : 8.5,
      interpretationSpread: {
        purposive: isLoaded ? 97 : 18,
        contextual: isLoaded ? 75 : 30,
        procedural: isLoaded ? 88 : 45,
        strict: 50,
      },
      perspectives: [
        { persona: 'Fan', text: isLoaded ? 'Purposive Reading: Blatant handball to block the ball path. Clear penalty.' : 'Purposive Reading: Natural running movement with no time to react.' },
        { persona: 'Referee', text: isLoaded ? 'Contextual Reading: Arm was raised outwards, blocking the cross. Penalty.' : 'Contextual Reading: Arm is in natural position relative to jump sequence. Play on.' },
        { persona: 'VAR', text: isLoaded ? 'Procedural Reading: Clear and obvious error. Recommend penalty review.' : 'Procedural Reading: No clear error detected. Natural body movement.' },
        { persona: 'Rulebook', text: 'Strict Constructionist Reading: Rule requires "deliberately" or "unnaturally bigger" — both are subjective.' }
      ],
      _metadata: {
        modelId: 'Audited Reference Benchmark',
        inferenceStatus: 'REFERENCE_BENCHMARK',
        executionMode: 'Pre-audited',
        cacheStatus: 'HIT',
        connectionStatus: 'OFFLINE / REFERENCE BENCHMARK',
      }
    };
  }

  // Fallback default (Tackle Severity)
  logs.push(`[${new Date().toISOString()}] [Mock Reference] Match found: Tackle Severity.`);
  const isLoaded = lowerText.includes('violently') || lowerText.includes('excessive');
  return {
    retrievedLaw: 'Law 12 (Fouls and Misconduct - Serious Foul Play)\n\nA tackle that endangers the safety of an opponent or uses excessive force must be sanctioned with a red card.',
    tensionTerm: 'excessive force',
    ambiguityScore: isLoaded ? 8.9 : 7.6,
    interpretationSpread: {
      purposive: isLoaded ? 97 : 12,
      contextual: isLoaded ? 80 : 35,
      procedural: isLoaded ? 90 : 28,
      strict: 65,
    },
    perspectives: [
      { persona: 'Fan', text: isLoaded ? 'Purposive Reading: Brutal, dangerous challenge. Straight red card.' : 'Purposive Reading: He got the ball. High intensity but clean challenge.' },
      { persona: 'Referee', text: isLoaded ? 'Contextual Reading: Endangerment of safety is clear. Serious foul play.' : 'Contextual Reading: High speed but contact was low. Yellow card warning is sufficient.' },
      { persona: 'VAR', text: isLoaded ? 'Procedural Reading: Replay confirms studs up contact with force. Recommend red.' : 'Procedural Reading: Sub-brutality threshold. Stick with referee decision.' },
      { persona: 'Rulebook', text: 'Strict Constructionist Reading: The threshold dividing reckless (yellow) from excessive force (red) is undefined.' }
    ],
    _metadata: {
      modelId: 'Audited Reference Benchmark',
      inferenceStatus: 'REFERENCE_BENCHMARK',
      executionMode: 'Pre-audited',
      cacheStatus: 'HIT',
      connectionStatus: 'OFFLINE / REFERENCE BENCHMARK',
    }
  };
}
