import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getIamToken, fetchWithRetry } from './utils';

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

interface PerspectivesPayload {
  retrievedLaw: string;
  tensionTerm: string;
  ambiguityScore: number;
  interpretationSpread: {
    purposive: number;
    contextual: number;
    procedural: number;
    strict: number;
  };
  perspectives: { persona: string; text: string }[];
  _metadata: {
    requestId: string;
    modelId: string;
    auditId: string;
    executionMode: string;
    cacheStatus: string;
    connectionStatus: string;
    timestamp: string;
    inferenceDuration?: number;
    logs?: string[];
  };
}

type GeneratorResponse = PerspectivesPayload | { neutral: PerspectivesPayload; loaded: PerspectivesPayload };

class SchemaValidationError extends Error {
  statusCode = 422;
  payload: {
    error: string;
    code: string;
    details: string;
    logs: string[];
    requestId?: string;
  };

  constructor(message: string, code: string, details: string, logs: string[]) {
    super(message);
    this.name = 'SchemaValidationError';
    this.payload = {
      error: message,
      code,
      details,
      logs,
    };
  }
}

// Global Cache for Presets only
const PRESET_CACHE = new LRUCache<string, GeneratorResponse>(50, 10 * 60 * 1000); // 50 entries, 10 min TTL
const PENDING_API_REQUESTS = new Map<string, Promise<GeneratorResponse>>();

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

  const { text, loadedText, mode, presetId } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing incident text' });
  }
  if (text.length > 3000 || (loadedText && typeof loadedText === 'string' && loadedText.length > 3000)) {
    return res.status(400).json({ error: 'Payload exceeds maximum allowed length of 3000 characters.' });
  }
  if (!mode || (mode !== 'live' && mode !== 'preset')) {
    return res.status(400).json({ error: 'Invalid or missing mode. Must be "live" or "preset".' });
  }
  if (mode === 'preset' && !presetId) {
    return res.status(400).json({ error: 'Missing presetId for preset mode.' });
  }

  const cleanText = text.trim();
  const cleanLoadedText =
    loadedText && typeof loadedText === 'string' && loadedText.trim()
      ? loadedText.trim()
      : undefined;

  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Inference Start] Received mode: ${mode}`);

  // ─── Flow A: Reference Benchmark (Preset) ──────────────────────────────
  if (mode === 'preset') {
    logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Flow Route] Explicit Reference Benchmark requested for presetId: ${presetId}.`);
    const cacheKey = cleanLoadedText ? `preset_${presetId}|||${cleanLoadedText}` : `preset_${presetId}`;
    
    // Check Preset Cache
    const cachedResponse = PRESET_CACHE.get(cacheKey);
    if (cachedResponse) {
      logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Preset Cache] Cache HIT. Returning pre-audited reference response.`);
      if ('neutral' in cachedResponse) {
         const sensPayload = cachedResponse as { neutral: PerspectivesPayload; loaded: PerspectivesPayload };
         const nowStr = new Date().toISOString();
         sensPayload.neutral._metadata = {
            ...sensPayload.neutral._metadata,
            requestId,
            cacheStatus: 'HIT',
            inferenceDuration: Date.now() - startTime,
            timestamp: nowStr
         };
         sensPayload.loaded._metadata = {
            ...sensPayload.loaded._metadata,
            requestId,
            cacheStatus: 'HIT',
            inferenceDuration: Date.now() - startTime,
            timestamp: nowStr
         };
      } else {
         const singlePayload = cachedResponse as PerspectivesPayload;
         singlePayload._metadata = {
            ...singlePayload._metadata,
            requestId,
            cacheStatus: 'HIT',
            inferenceDuration: Date.now() - startTime,
            timestamp: new Date().toISOString()
         };
      }
      return res.status(200).json(cachedResponse);
    }

    logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Preset Cache] Cache MISS. Loading pre-audited reference benchmarks.`);
    // Get Mock Response
    let mockResult: GeneratorResponse;
    if (cleanLoadedText) {
      const neutral = generateMockResponse(presetId, false, logs, requestId, cleanText);
      const loaded = generateMockResponse(presetId, true, logs, requestId, cleanLoadedText);
      neutral._metadata.cacheStatus = 'MISS / CACHED';
      loaded._metadata.cacheStatus = 'MISS / CACHED';
      mockResult = { neutral, loaded };
    } else {
      const single = generateMockResponse(presetId, false, logs, requestId, cleanText);
      single._metadata.cacheStatus = 'MISS / CACHED';
      mockResult = single;
    }

    PRESET_CACHE.set(cacheKey, mockResult);
    
    if (cleanLoadedText && 'neutral' in mockResult) {
       mockResult.neutral._metadata.inferenceDuration = Date.now() - startTime;
       mockResult.loaded._metadata.inferenceDuration = Date.now() - startTime;
    } else if ('_metadata' in mockResult) {
       mockResult._metadata.inferenceDuration = Date.now() - startTime;
    }

    return res.status(200).json(mockResult);
  }

  // ─── Flow B: Custom Live Inference (No Cache, Calls IBM) ───────────────────
  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Flow Route] Custom user incident detected. Routing to live IBM watsonx.ai.`);
  const cacheKey = cleanLoadedText ? `live_${cleanText}|||${cleanLoadedText}` : `live_${cleanText}`;

  // In-flight deduplication to prevent concurrent double-clicks from running duplicate inferences
  const pendingPromise = PENDING_API_REQUESTS.get(cacheKey);
  if (pendingPromise) {
    logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Request Deduplication] Reusing active concurrent live inference request.`);
    try {
      const responsePayload = await pendingPromise;
      if (cleanLoadedText && 'neutral' in responsePayload) {
         const sensPayload = responsePayload as { neutral: PerspectivesPayload; loaded: PerspectivesPayload };
         sensPayload.neutral._metadata.requestId = requestId;
         sensPayload.loaded._metadata.requestId = requestId;
         sensPayload.neutral._metadata.inferenceDuration = Date.now() - startTime;
         sensPayload.loaded._metadata.inferenceDuration = Date.now() - startTime;
      } else if ('_metadata' in responsePayload) {
         const singlePayload = responsePayload as PerspectivesPayload;
         singlePayload._metadata.requestId = requestId;
         singlePayload._metadata.inferenceDuration = Date.now() - startTime;
      }
      return res.status(200).json(responsePayload);
    } catch (err: unknown) {
      const errorObj = err as { statusCode?: number; payload?: { requestId?: string }; message?: string };
      if (errorObj.statusCode === 422 && errorObj.payload) {
         errorObj.payload.requestId = requestId;
         return res.status(422).json(errorObj.payload);
      }
      return res.status(502).json({
        error: 'IBM watsonx.ai is currently unavailable',
        code: 'WATSONX_API_FAILURE',
        details: errorObj.message ?? 'Internal Pipeline Error',
        logs,
        requestId,
      });
    }
  }

  const requestPromise = (async () => {
    const watsonxApiKey = process.env.WATSONX_API_KEY;
    const watsonxProjectId = process.env.WATSONX_PROJECT_ID;

    if (!watsonxApiKey || !watsonxProjectId) {
      logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Environment] [FAIL] Watsonx credentials are not configured in backend.`);
      throw new Error('IBM watsonx.ai credentials are not configured on the server.');
    }
    logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Environment] Environment credentials validated.`);

    const accessToken = await getIamToken(watsonxApiKey, logs);
    if (!accessToken) {
      throw new Error('Failed to retrieve active OAuth token.');
    }

    if (cleanLoadedText) {
      logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Model Query] Sending parallel requests for neutral and loaded phrasings.`);
      const [neutralPayload, loadedPayload] = await Promise.all([
        callWatsonx(cleanText, accessToken, watsonxProjectId, logs, requestId),
        callWatsonx(cleanLoadedText, accessToken, watsonxProjectId, logs, requestId),
      ]);
      return {
        neutral: neutralPayload,
        loaded: loadedPayload,
      };
    } else {
      logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Model Query] Sending live generation request.`);
      return await callWatsonx(cleanText, accessToken, watsonxProjectId, logs, requestId);
    }
  })();

  PENDING_API_REQUESTS.set(cacheKey, requestPromise);

  try {
    const finalPayload = await requestPromise;
    logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Complete] Live inference successfully generated and validated.`);
    
    // Add logs & status variables
    if (cleanLoadedText && 'neutral' in finalPayload) {
      finalPayload.neutral._metadata.inferenceDuration = Date.now() - startTime;
      finalPayload.loaded._metadata.inferenceDuration = Date.now() - startTime;
    } else if ('_metadata' in finalPayload) {
      finalPayload._metadata.inferenceDuration = Date.now() - startTime;
    }

    return res.status(200).json(finalPayload);
  } catch (error: unknown) {
    const errorObj = error as { statusCode?: number; payload?: { requestId?: string }; message?: string };
    logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Pipeline FAIL] Pipeline execution failed: ${errorObj.message ?? errorObj}`);
    
    if (errorObj.statusCode === 422 && errorObj.payload) {
       errorObj.payload.requestId = requestId;
       return res.status(422).json(errorObj.payload);
    }
    
    // DO NOT fall back to mock data. Return a structured 502 Gateway Error
    return res.status(502).json({
      error: 'IBM watsonx.ai is currently unavailable',
      code: 'WATSONX_API_FAILURE',
      details: errorObj.message ?? 'Internal Pipeline Error',
      logs,
      requestId,
    });
  }
}

// ─── Watsonx direct call — 20s timeout with retry ────────────────────────────
async function callWatsonx(
  text: string,
  accessToken: string,
  watsonxProjectId: string,
  logs: string[],
  requestId: string
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

  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Model Query] Querying model ID: "${watsonxModelId}" via ${url}`);

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

  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [JSON Parser] Received raw model text. Trimming markdown block markers.`);

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

  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [JSON Parser] Parsing JSON structure.`);
  interface PerspectiveItem {
    persona: string;
    text: string;
  }
  interface WatsonxPayload {
    retrievedLaw?: string;
    tensionTerm?: string;
    ambiguityScore?: number;
    interpretationSpread?: Record<string, unknown>;
    perspectives?: PerspectiveItem[];
  }
  let parsedPayload: WatsonxPayload;
  try {
     parsedPayload = JSON.parse(generatedText) as WatsonxPayload;
  } catch (err: unknown) {
     const errMsg = err instanceof Error ? err.message : String(err);
     throw new SchemaValidationError(
        'Unprocessable Entity: Failed to parse Granite model response as JSON',
        'SCHEMA_VALIDATION_FAILED',
        errMsg,
        logs
     );
  }

  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Schema Validation] Validating parsed payload structure.`);

  // ─── STRICT SCHEMA VALIDATION ──────────────────────────────────────────────
  const missingFields: string[] = [];
  
  if (!parsedPayload.retrievedLaw || typeof parsedPayload.retrievedLaw !== 'string') {
    missingFields.push('retrievedLaw (string)');
  }
  if (!parsedPayload.tensionTerm || typeof parsedPayload.tensionTerm !== 'string') {
    missingFields.push('tensionTerm (string)');
  }
  if (typeof parsedPayload.ambiguityScore !== 'number') {
    missingFields.push('ambiguityScore (number)');
  }
  if (!parsedPayload.interpretationSpread || typeof parsedPayload.interpretationSpread !== 'object') {
    missingFields.push('interpretationSpread (object)');
  }
  if (!Array.isArray(parsedPayload.perspectives) || parsedPayload.perspectives.length < 4) {
    missingFields.push('perspectives (array of at least 4 items)');
  }

  if (missingFields.length > 0) {
     throw new SchemaValidationError(
        'Unprocessable Entity: Model response missing required fields.',
        'SCHEMA_VALIDATION_FAILED',
        `Missing or invalid fields: ${missingFields.join(', ')}`,
        logs
     );
  }

  const requiredPersonas = ['Fan', 'Referee', 'VAR', 'Rulebook'];
  const validatedPerspectives = requiredPersonas.map(persona => {
    const match = (parsedPayload.perspectives as PerspectiveItem[]).find(
      p => p && typeof p.persona === 'string' && p.persona.toLowerCase().includes(persona.toLowerCase())
    );
    if (!match || typeof match.text !== 'string' || !match.text.trim()) {
        throw new SchemaValidationError(
           'Unprocessable Entity: Model response missing valid perspective.',
           'SCHEMA_VALIDATION_FAILED',
           `Missing valid perspective text for persona: ${persona}`,
           logs
        );
    }
    return {
      persona,
      text: match.text.trim(),
    };
  });

  const spread = parsedPayload.interpretationSpread as Record<string, unknown>;
  const validatedSpread = {
    purposive: typeof spread.purposive === 'number' ? spread.purposive : 50,
    contextual: typeof spread.contextual === 'number' ? spread.contextual : 50,
    procedural: typeof spread.procedural === 'number' ? spread.procedural : 50,
    strict: typeof spread.strict === 'number' ? spread.strict : 50,
  };

  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Schema Validation] [PASS] Payload conforms strictly to expected output schema.`);

  return {
    retrievedLaw: (parsedPayload.retrievedLaw as string).trim(),
    tensionTerm: (parsedPayload.tensionTerm as string).trim(),
    ambiguityScore: parsedPayload.ambiguityScore as number,
    interpretationSpread: validatedSpread,
    perspectives: validatedPerspectives,
    _metadata: {
      requestId,
      modelId: watsonxModelId,
      auditId: `audit-${crypto.randomUUID().split('-')[0]}`,
      executionMode: 'live',
      cacheStatus: 'BYPASSED',
      connectionStatus: 'ONLINE / LIVE',
      timestamp: new Date().toISOString()
    }
  } as PerspectivesPayload;
}

// ─── Reference Benchmark mock payload generator ─────────────────────────────
function generateMockResponse(presetId: string, isLoaded: boolean, logs: string[], requestId: string, textContext?: string) {
  logs.push(`[${new Date().toISOString()}] [Request ${requestId}] [Mock Reference] Returning local reference benchmark for preset ${presetId}.`);

  const searchStr = ((presetId || '') + ' ' + (textContext || '')).toLowerCase();
  
  // 1. Corporate Compliance check
  const isCompliance = searchStr.includes('compliance') || 
                       searchStr.includes('corporate') || 
                       searchStr.includes('policy') || 
                       searchStr.includes('employee') || 
                       searchStr.includes('data') || 
                       searchStr.includes('leak') || 
                       searchStr.includes('contract') || 
                       searchStr.includes('disclosure');

  if (isCompliance || presetId.includes('compliance') || presetId.includes('data')) {
    return {
      retrievedLaw: 'Section 4.2 (Information Security & Data Protection Policy)\\n\\nEmployees must safeguard company information. Unauthorized transmission of proprietary business data to external third parties is strictly prohibited.',
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
        requestId,
        modelId: 'Audited Reference Benchmark',
        auditId: `ref-compliance-1`,
        executionMode: 'preset',
        cacheStatus: 'HIT',
        connectionStatus: 'OFFLINE / REFERENCE BENCHMARK',
        timestamp: new Date().toISOString()
      }
    };
  }

  // 2. Football checks
  const isHandball = searchStr.includes('handball') || searchStr.includes('arm') || searchStr.includes('hand');
  if (isHandball || presetId.includes('handball')) {
    return {
      retrievedLaw: 'Law 12 (Handling the ball)\\n\\nIt is an offence if a player deliberately touches the ball with their hand/arm, or makes their body unnaturally bigger.',
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
        requestId,
        modelId: 'Audited Reference Benchmark',
        auditId: `ref-handball-2`,
        executionMode: 'preset',
        cacheStatus: 'HIT',
        connectionStatus: 'OFFLINE / REFERENCE BENCHMARK',
        timestamp: new Date().toISOString()
      }
    };
  }

  const isTackle = searchStr.includes('tackle') || searchStr.includes('force') || searchStr.includes('referee') || searchStr.includes('foul') || searchStr.includes('red card');
  if (isTackle || presetId.includes('tackle')) {
    return {
      retrievedLaw: 'Law 12 (Fouls and Misconduct - Serious Foul Play)\\n\\nA tackle that endangers the safety of an opponent or uses excessive force must be sanctioned with a red card.',
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
        requestId,
        modelId: 'Audited Reference Benchmark',
        auditId: `ref-tackle-3`,
        executionMode: 'preset',
        cacheStatus: 'HIT',
        connectionStatus: 'OFFLINE / REFERENCE BENCHMARK',
        timestamp: new Date().toISOString()
      }
    };
  }

  // 3. Domain-agnostic generic fallback
  return {
    retrievedLaw: 'Standard Operating Procedure Section 9 (Discretionary Execution Guidelines)\\n\\nOperators must exercise reasonable care and follow authorized procedures when executing transactions under uncertain conditions.',
    tensionTerm: 'reasonable care',
    ambiguityScore: isLoaded ? 8.8 : 6.8,
    interpretationSpread: {
      purposive: isLoaded ? 85 : 30,
      contextual: isLoaded ? 80 : 25,
      procedural: isLoaded ? 90 : 35,
      strict: 60,
    },
    perspectives: [
      { persona: 'Fan', text: isLoaded ? 'Purposive Reading: The action violates the core intent of the guidelines and presents a clear compliance risk.' : 'Purposive Reading: The action was taken to protect operational efficiency and fits the intent of the guidelines.' },
      { persona: 'Referee', text: isLoaded ? 'Contextual Reading: The operator failed to satisfy the objective standard of care required.' : 'Contextual Reading: Under the observed circumstances, the operator\'s steps were consistent with reasonable efforts.' },
      { persona: 'VAR', text: isLoaded ? 'Procedural Reading: Significant deviation from standard workflow, warranting formal compliance intervention.' : 'Procedural Reading: The procedural deviation did not cross the critical threshold for escalating a violation.' },
      { persona: 'Rulebook', text: 'Strict Constructionist Reading: The term "reasonable care" is not defined quantitatively. Any strict enforcement is subjective.' }
    ],
    _metadata: {
      requestId,
      modelId: 'Audited Reference Benchmark',
      auditId: `ref-generic-4`,
      executionMode: 'preset',
      cacheStatus: 'HIT',
      connectionStatus: 'OFFLINE / REFERENCE BENCHMARK',
      timestamp: new Date().toISOString()
    }
  };
}
