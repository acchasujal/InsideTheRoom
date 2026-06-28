import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getIamToken, fetchWithTimeout } from './utils';

export const maxDuration = 30; // seconds

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stages: Array<{ stage: string; status: 'PASS' | 'FAIL'; timestamp: string; details: string }> = [];

  const logStage = (stageName: string, status: 'PASS' | 'FAIL', details: string) => {
    stages.push({
      stage: stageName,
      status,
      timestamp: new Date().toISOString(),
      details,
    });
  };

  try {
    // 1. Credentials
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
    const modelId = process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-chat-v2';

    if (!apiKey || !projectId) {
      logStage('Credentials', 'FAIL', 'Missing WATSONX_API_KEY or WATSONX_PROJECT_ID');
      return res.status(200).json({ status: 'failed', stages });
    }
    logStage('Credentials', 'PASS', 'Environment variables present');

    // 2. Token
    const logs: string[] = [];
    let token = '';
    try {
      const accessToken = await getIamToken(apiKey, logs);
      if (!accessToken) throw new Error('No token returned');
      token = accessToken;
      logStage('Token', 'PASS', 'IAM Token retrieved successfully via unified utility');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logStage('Token', 'FAIL', errMsg);
      return res.status(200).json({ status: 'failed', stages });
    }

    // 3. Inference
    const text = "Diagnostic test incident. The referee made a call that was highly disputed by fans because the player was offside.";
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

    const prompt = `<|system|>n${systemInstruction}n<|user|>n${rawPrompt}n<|assistant|>n`;

    let generatedText = '';
    try {
      const endpoint = `${url.replace(/\/$/, '')}/ml/v1/text/generation?version=2023-05-29`;
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
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
          model_id: modelId,
          project_id: projectId,
        }),
      }, 25000);

      if (!response.ok) {
        throw new Error(`Watsonx API returned ${response.status}`);
      }
      
      const responseData = await response.json();
      generatedText = responseData.results?.[0]?.generated_text ?? '';
      logStage('Inference', 'PASS', 'Watsonx model generated text payload successfully');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logStage('Inference', 'FAIL', errMsg);
      return res.status(200).json({ status: 'failed', stages });
    }

    // 4. Parser
    let parsedPayload: Record<string, unknown>;
    try {
      let cleaned = generatedText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
      }
      parsedPayload = JSON.parse(cleaned) as Record<string, unknown>;
      logStage('Parser', 'PASS', 'Extracted and parsed JSON successfully');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logStage('Parser', 'FAIL', `Failed to parse JSON. Error: ${errMsg}. Raw: ${generatedText.substring(0, 100)}...`);
      return res.status(200).json({ status: 'failed', stages });
    }

    // 5. Schema Validation
    try {
      const missingFields: string[] = [];
      if (!parsedPayload.retrievedLaw || typeof parsedPayload.retrievedLaw !== 'string') missingFields.push('retrievedLaw');
      if (!parsedPayload.tensionTerm || typeof parsedPayload.tensionTerm !== 'string') missingFields.push('tensionTerm');
      if (typeof parsedPayload.ambiguityScore !== 'number') missingFields.push('ambiguityScore');
      if (!parsedPayload.interpretationSpread || typeof parsedPayload.interpretationSpread !== 'object') missingFields.push('interpretationSpread');
      if (!Array.isArray(parsedPayload.perspectives) || parsedPayload.perspectives.length < 4) missingFields.push('perspectives');

      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }
      
      logStage('Schema Validation', 'PASS', 'All required fields present and of correct types');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logStage('Schema Validation', 'FAIL', errMsg);
      return res.status(200).json({ status: 'failed', stages });
    }

    // 6. Response Payload
    logStage('Response Payload', 'PASS', 'Pipeline fully verified. Output matches expected production structure.');
    return res.status(200).json({ status: 'passed', stages });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logStage('Unexpected Error', 'FAIL', errMsg);
    return res.status(200).json({ status: 'failed', stages });
  }
}
