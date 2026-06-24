import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function Configuration
export const maxDuration = 30; // seconds

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers
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

  try {
    const { text, loadedText } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing incident text' });
    }

    // Guard: treat whitespace-only loadedText as absent
    const cleanLoadedText =
      loadedText && typeof loadedText === 'string' && loadedText.trim()
        ? loadedText.trim()
        : undefined;

    const watsonxApiKey = process.env.WATSONX_API_KEY;
    const watsonxProjectId = process.env.WATSONX_PROJECT_ID;

    // Helper to generate a single payload
    const getPayload = async (inputText: string, token: string | null) => {
      if (!token || !watsonxProjectId) {
        return generateMockResponse(inputText);
      }
      try {
        return await callWatsonx(inputText, token, watsonxProjectId);
      } catch (err) {
        console.error('Watsonx call failed, using mock fallback:', err);
        return generateMockResponse(inputText);
      }
    };

    // Obtain IAM token if credentials are present — with 8s timeout
    let accessToken: string | null = null;
    if (watsonxApiKey && watsonxProjectId) {
      try {
        const tokenResponse = await fetchWithTimeout(
          'https://iam.cloud.ibm.com/identity/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
            body: new URLSearchParams({
              grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
              apikey: watsonxApiKey,
            }),
          },
          8000
        );

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessToken = tokenData.access_token ?? null;
        } else {
          console.error('IAM token request failed with status', tokenResponse.status);
        }
      } catch (tokenErr: any) {
        console.error('IAM token fetch error (will use mock):', tokenErr?.message ?? tokenErr);
      }
    }

    if (cleanLoadedText) {
      // Parallel generation for both phrasings
      const [neutralPayload, loadedPayload] = await Promise.all([
        getPayload(text.trim(), accessToken),
        getPayload(cleanLoadedText, accessToken),
      ]);
      return res.status(200).json({
        neutral: neutralPayload,
        loaded: loadedPayload,
      });
    } else {
      const payload = await getPayload(text.trim(), accessToken);
      return res.status(200).json(payload);
    }
  } catch (error: any) {
    console.error('API Error:', error?.message ?? error);
    // Never return a raw 500 — always return mock so the demo continues
    return res.status(200).json(generateMockResponse((req.body?.text as string) || ''));
  }
}

// ─── Watsonx direct call — 20s timeout ───────────────────────────────────────
async function callWatsonx(
  text: string,
  accessToken: string,
  watsonxProjectId: string
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

  const watsonxResponse = await fetchWithTimeout(
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
    20000
  );

  const responseStatus = watsonxResponse.status;
  const responseBody = await watsonxResponse.text().catch(() => '(unreadable)');

  if (!watsonxResponse.ok) {
    throw new Error(`Watsonx API failed: ${responseStatus} - ${responseBody}`);
  }

  const watsonxData = JSON.parse(responseBody);
  let generatedText: string = watsonxData.results?.[0]?.generated_text ?? '';

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

  try {
    const parsedPayload = JSON.parse(generatedText);

    // Validate minimum required shape
    if (!parsedPayload.retrievedLaw || !Array.isArray(parsedPayload.perspectives)) {
      throw new Error('Invalid JSON schema returned by Granite');
    }
    if (parsedPayload.perspectives.length < 4) {
      throw new Error('Incomplete perspectives array from Granite');
    }

    parsedPayload._metadata = {
      modelId: watsonxModelId,
      prompt: prompt,
      inferenceStatus: 'LIVE_WATSONX_AI',
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: 800,
        repetition_penalty: 1,
      },
      ambiguityScore:
        parsedPayload.ambiguityScore ??
        Math.round((7.5 + (text.length % 21) / 10) * 10) / 10,
      tensionTerm: parsedPayload.tensionTerm ?? null,
      interpretationSpread: parsedPayload.interpretationSpread ?? null,
    };

    return parsedPayload;
  } catch (parseError: any) {
    console.error(
      'Failed to parse Granite output, falling back to mock:',
      parseError?.message ?? parseError,
      '\nRaw text (first 500 chars):',
      generatedText.slice(0, 500)
    );
    return generateMockResponse(text);
  }
}

// ─── Mock fallback — always produces valid, divergent output ──────────────────
function generateMockResponse(incidentText: string) {
  const lowerText = incidentText.toLowerCase();

  // ── 1. Corporate compliance / employee scenarios ──────────────────────────
  if (
    lowerText.includes('employee') ||
    lowerText.includes('consultant') ||
    lowerText.includes('contractor') ||
    lowerText.includes('disclosure') ||
    lowerText.includes('proprietary') ||
    lowerText.includes('data') ||
    lowerText.includes('document') ||
    lowerText.includes('shared') ||
    lowerText.includes('leak')
  ) {
    const isLoaded =
      lowerText.includes('leak') ||
      lowerText.includes('unauthorized') ||
      lowerText.includes('confidential') ||
      lowerText.includes('malicious') ||
      lowerText.includes('steal') ||
      lowerText.includes('breach');

    return {
      retrievedLaw:
        'Section 4.2 (Information Security & Data Protection Policy)\n\nEmployees must safeguard company information. Unauthorized transmission of proprietary business data to external third parties is strictly prohibited. External reviews must occur under authorized non-disclosure terms.',
      perspectives: [
        {
          persona: 'Fan',
          text: isLoaded
            ? 'Purposive Reading: The employee committed a major compliance violation. Bypassing standard protocols exposes the entire product line to corporate espionage, regardless of execution speed.'
            : 'Purposive Reading: The collaboration with an external consultant was intended to accelerate critical QA testing, directly serving the project\'s success and company milestones.',
        },
        {
          persona: 'Referee',
          text: isLoaded
            ? 'Contextual Reading: Sharing proprietary documents without security approval constitutes a direct breach of corporate data policy. The action cannot be excused by intent.'
            : 'Contextual Reading: An active Master Services Agreement and NDA were in place with the consultant. The information remained within a legally protected business circle.',
        },
        {
          persona: 'VAR',
          text: isLoaded
            ? 'Procedural Reading: The data transmission crossed the severity threshold for immediate compliance escalation and credential revocation.'
            : 'Procedural Reading: The sharing was restricted to specific files under review, not meeting the threshold of a systemic database leak or IP compromise.',
        },
        {
          persona: 'Rulebook',
          text: 'Strict Constructionist Reading: All disclosures of proprietary company assets to non-employee entities must be pre-cleared by corporate legal counsel. Unsanctioned transfers are policy violations regardless of intent.',
        },
      ],
      tensionTerm: 'authorized',
      interpretationSpread: {
        purposive: isLoaded ? 92 : 35,
        contextual: isLoaded ? 88 : 28,
        procedural: isLoaded ? 95 : 42,
        strict: 80,
      },
      _metadata: {
        modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
        prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
        inferenceStatus: 'LOCAL_MOCK_FALLBACK',
        parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
        ambiguityScore: isLoaded ? 9.1 : 7.2,
        tensionTerm: 'authorized',
        interpretationSpread: {
          purposive: isLoaded ? 92 : 35,
          contextual: isLoaded ? 88 : 28,
          procedural: isLoaded ? 95 : 42,
          strict: 80,
        },
      },
    };
  }

  // ── 2. Handball scenarios ─────────────────────────────────────────────────
  if (
    lowerText.includes('handball') ||
    lowerText.includes('arm') ||
    lowerText.includes('hand') ||
    lowerText.includes('deliberately touches') ||
    lowerText.includes('contact with the ball') ||
    lowerText.includes('cross')
  ) {
    const isLoaded =
      lowerText.includes('violently') ||
      lowerText.includes('no attempt') ||
      lowerText.includes('deliberately') ||
      lowerText.includes('extended') ||
      lowerText.includes('intercepted') ||
      lowerText.includes('outward');

    return {
      retrievedLaw:
        "Law 12 (Fouls and Misconduct - Handling the ball)\n\nIt is an offence if a player deliberately touches the ball with their hand/arm, or touches the ball when their hand/arm has made their body unnaturally bigger.",
      perspectives: [
        {
          persona: 'Fan',
          text: isLoaded
            ? "Purposive Reading: Blatant infraction! He extends his arm and moves it directly to intercept the ball. This is a clear cheat that must be penalized with a penalty kick."
            : "Purposive Reading: Completely natural body movement. The ball was kicked from close range, and the player had no time or intent to move their arm away.",
        },
        {
          persona: 'Referee',
          text: isLoaded
            ? "Contextual Reading: The player's arm was raised outward and blocked the ball path. He took the risk by making himself unnaturally bigger. I have to award the penalty."
            : "Contextual Reading: The arm position was natural for a player in motion. I saw no deliberate movement to intercept the ball. The contact was incidental. Play on.",
        },
        {
          persona: 'VAR',
          text: isLoaded
            ? "Procedural Reading: The replay shows clear intentional contact with the arm extended. I recommend an on-field review to award the penalty kick."
            : "Procedural Reading: The contact was incidental during a natural jumping action. No clear and obvious error — stick with the on-field decision. No penalty.",
        },
        {
          persona: 'Rulebook',
          text: "Strict Constructionist Reading: Handling the ball is penalized if a player deliberately touches it or positions their arm to make their body unnaturally bigger in an unjustifiable silhouette.",
        },
      ],
      tensionTerm: 'deliberately',
      interpretationSpread: {
        purposive: isLoaded ? 97 : 18,
        contextual: isLoaded ? 75 : 30,
        procedural: isLoaded ? 88 : 45,
        strict: 50,
      },
      _metadata: {
        modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
        prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
        inferenceStatus: 'LOCAL_MOCK_FALLBACK',
        parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
        ambiguityScore: isLoaded ? 9.4 : 8.5,
        tensionTerm: 'deliberately',
        interpretationSpread: {
          purposive: isLoaded ? 97 : 18,
          contextual: isLoaded ? 75 : 30,
          procedural: isLoaded ? 88 : 45,
          strict: 50,
        },
      },
    };
  }

  // ── 3. Football tackle / foul / contact scenarios ─────────────────────────
  if (
    lowerText.includes('tackle') ||
    lowerText.includes('foul') ||
    lowerText.includes('contact with') ||
    lowerText.includes('challenge') ||
    lowerText.includes('lunged') ||
    lowerText.includes('studs') ||
    lowerText.includes('kick') ||
    lowerText.includes('attacker') ||
    lowerText.includes('defender') ||
    lowerText.includes('pitch') ||
    lowerText.includes('reckless') ||
    lowerText.includes('excessive')
  ) {
    const isLoaded =
      lowerText.includes('violently') ||
      lowerText.includes('no attempt to play') ||
      lowerText.includes('lunged') ||
      lowerText.includes('excessive') ||
      lowerText.includes('reckless') ||
      lowerText.includes('assault') ||
      lowerText.includes('force');

    return {
      retrievedLaw:
        'Law 12 (Fouls and Misconduct - Serious Foul Play)\n\nA tackle or challenge that endangers the safety of an opponent or uses excessive force or brutality must be sanctioned as serious foul play.',
      perspectives: [
        {
          persona: 'Fan',
          text: isLoaded
            ? "Purposive Reading: Unacceptable, dangerous challenge. It was a red card offense that endangered the opponent. He made no attempt to play the ball."
            : "Purposive Reading: Clean tackle. He made contact with the ball first, and any follow-through contact was completely incidental and unavoidable.",
        },
        {
          persona: 'Referee',
          text: isLoaded
            ? "Contextual Reading: The challenge was high and the endangerment was clear. Serious foul play — I had to issue a red card."
            : "Contextual Reading: The tackle was firm, but he was playing the ball and didn't make high contact. A yellow card is sufficient warning for recklessness.",
        },
        {
          persona: 'VAR',
          text: isLoaded
            ? "Procedural Reading: The replay reveals a high, dangerous challenge with excessive force. I recommend an immediate red card review."
            : "Procedural Reading: There is contact, but it does not meet the threshold of brutality or serious endangerment. Stick with the yellow card.",
        },
        {
          persona: 'Rulebook',
          text: "Strict Constructionist Reading: Any player who lunges at an opponent using excessive force or endangers the safety of an opponent is guilty of serious foul play. The threshold between 'reckless' and 'excessive force' is the undefined boundary.",
        },
      ],
      tensionTerm: 'excessive force',
      interpretationSpread: {
        purposive: isLoaded ? 97 : 12,
        contextual: isLoaded ? 80 : 35,
        procedural: isLoaded ? 90 : 28,
        strict: 65,
      },
      _metadata: {
        modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
        prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
        inferenceStatus: 'LOCAL_MOCK_FALLBACK',
        parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
        ambiguityScore: isLoaded ? 8.9 : 7.6,
        tensionTerm: 'excessive force',
        interpretationSpread: {
          purposive: isLoaded ? 97 : 12,
          contextual: isLoaded ? 80 : 35,
          procedural: isLoaded ? 90 : 28,
          strict: 65,
        },
      },
    };
  }

  // ── 4. Governance / board / fiduciary scenarios ───────────────────────────
  if (
    lowerText.includes('board') ||
    lowerText.includes('fiduciary') ||
    lowerText.includes('director') ||
    lowerText.includes('vote') ||
    lowerText.includes('conflict of interest') ||
    lowerText.includes('spouse') ||
    lowerText.includes('equity') ||
    lowerText.includes('regulatory') ||
    lowerText.includes('filing') ||
    lowerText.includes('governance')
  ) {
    const isLoaded =
      lowerText.includes('concealing') ||
      lowerText.includes('enrich') ||
      lowerText.includes('willfully') ||
      lowerText.includes('deliberately') ||
      lowerText.includes('bypass') ||
      lowerText.includes('breach') ||
      lowerText.includes('violat');

    return {
      retrievedLaw:
        'Section 5.1 (Corporate Governance - Conflict of Interest & Fiduciary Duty)\n\nBoard members must disclose any material financial interest in matters subject to a vote. A "material" conflict is defined as any interest that a reasonable person would consider significant.',
      perspectives: [
        {
          persona: 'Fan',
          text: isLoaded
            ? "Purposive Reading: The board member violated their fiduciary duty by allowing personal financial gain to influence a corporate vote. This is a clear breach of governance ethics."
            : "Purposive Reading: A minor indirect equity position through a spouse doesn't necessarily compromise a board member's judgment, especially if the interest is de minimis.",
        },
        {
          persona: 'Referee',
          text: isLoaded
            ? "Contextual Reading: Concealing a financial relationship from fellow directors while voting on the matter is a direct breach of the duty of loyalty. The vote should be voided."
            : "Contextual Reading: The existence of a spousal equity position, without evidence of influence on the vote outcome, may fall below the threshold requiring mandatory recusal.",
        },
        {
          persona: 'VAR',
          text: isLoaded
            ? "Procedural Reading: The non-disclosure crosses the materiality threshold. Under the conflict of interest policy, the vote must be reviewed and the member faces potential removal."
            : "Procedural Reading: The equity position must be reviewed against the materiality standard. Without quantification, a procedural finding of violation cannot be confirmed.",
        },
        {
          persona: 'Rulebook',
          text: "Strict Constructionist Reading: The policy requires disclosure of any 'material' interest. 'Material' is not defined with a monetary threshold. Any interest that a reasonable person would consider significant must be disclosed — but 'reasonable person' is itself undefined.",
        },
      ],
      tensionTerm: 'material',
      interpretationSpread: {
        purposive: isLoaded ? 91 : 32,
        contextual: isLoaded ? 85 : 40,
        procedural: isLoaded ? 88 : 45,
        strict: 70,
      },
      _metadata: {
        modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
        prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
        inferenceStatus: 'LOCAL_MOCK_FALLBACK',
        parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
        ambiguityScore: isLoaded ? 9.0 : 7.4,
        tensionTerm: 'material',
        interpretationSpread: {
          purposive: isLoaded ? 91 : 32,
          contextual: isLoaded ? 85 : 40,
          procedural: isLoaded ? 88 : 45,
          strict: 70,
        },
      },
    };
  }

  // ── 5. Domain-agnostic fallback — always produces divergent output ─────────
  const cleanWords = incidentText.split(/\s+/).filter((w) => w.length > 4);
  const keyword =
    cleanWords.length > 0
      ? cleanWords[0].replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      : 'Behavioral';
  const formattedKeyword =
    keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();

  const isLoaded =
    lowerText.includes('violation') ||
    lowerText.includes('breach') ||
    lowerText.includes('violently') ||
    lowerText.includes('severe') ||
    lowerText.includes('unauthorized') ||
    lowerText.includes('failure') ||
    lowerText.includes('deliberate') ||
    lowerText.includes('intentional') ||
    lowerText.includes('willful');

  return {
    retrievedLaw: `Section Governance.10.3 (Standard Operational Conduct - Compliance Policy)\n\nActions and processes must align with core transparency guidelines. Discretionary bounds must be documented to prevent procedural inconsistency. The term "${formattedKeyword.toLowerCase()}" is subject to interpretive review.`,
    perspectives: [
      {
        persona: 'Fan',
        text: isLoaded
          ? `Purposive Reading: The context indicates a clear violation of standard procedure. Tolerating deviations of this severity exposes the system to systemic failures and operational risk. Corrective action is warranted.`
          : `Purposive Reading: The activity was conducted in good faith to advance critical operations. A strict infraction penalty runs counter to the spirit of operational agility and cooperation.`,
      },
      {
        persona: 'Referee',
        text: isLoaded
          ? `Contextual Reading: The facts show a direct conflict with procedural guidelines. The operational boundary was crossed under conditions that justify formal sanctions and review.`
          : `Contextual Reading: Although a procedural boundary was intersected, the surrounding context places this behavior within a justifiable gray zone that does not warrant formal escalation.`,
      },
      {
        persona: 'VAR',
        text: isLoaded
          ? `Procedural Reading: The event logs confirm a clear, material breach. The incident crosses the structural threshold requiring immediate review and corrective action.`
          : `Procedural Reading: The event logs show standard deviation within acceptable margins. The action does not cross the material threshold required to warrant an intervention.`,
      },
      {
        persona: 'Rulebook',
        text: `Strict Constructionist Reading: Under the literal wording of the policy, any deviation involving "${formattedKeyword.toLowerCase()}" may represent a compliance infraction. However, the policy does not define a measurable threshold — every adjudication of this term is a discretionary judgment call.`,
      },
    ],
    tensionTerm: formattedKeyword.toLowerCase(),
    interpretationSpread: {
      purposive: isLoaded ? 88 : 30,
      contextual: isLoaded ? 72 : 35,
      procedural: isLoaded ? 80 : 40,
      strict: 60,
    },
    _metadata: {
      modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
      prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
      inferenceStatus: 'LOCAL_MOCK_FALLBACK',
      parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
      ambiguityScore: isLoaded ? 8.8 : 6.9,
      tensionTerm: formattedKeyword.toLowerCase(),
      interpretationSpread: {
        purposive: isLoaded ? 88 : 30,
        contextual: isLoaded ? 72 : 35,
        procedural: isLoaded ? 80 : 40,
        strict: 60,
      },
    },
  };
}
