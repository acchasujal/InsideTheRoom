import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 30; // seconds

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    // 1. Environment variables check
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
    const modelId = process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-chat-v2';

    if (!apiKey || !projectId) {
      logStage(
        'Environment Variables',
        'FAIL',
        `Missing critical variables: API_KEY present: ${!!apiKey}, PROJECT_ID present: ${!!projectId}`
      );
      return res.status(200).json({ status: 'unhealthy', stages });
    }
    logStage('Environment Variables', 'PASS', `Credentials configured. Project ID: ${projectId.substring(0, 8)}...`);

    // 2. IAM Token generation
    let token = '';
    try {
      const tokenResponse = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: apiKey,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`IAM token endpoint returned status ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      token = tokenData.access_token ?? '';
      if (!token) {
        throw new Error('access_token field missing in response');
      }
      logStage('IAM Token Generation', 'PASS', `OAuth token retrieved successfully. Length: ${token.length} chars.`);
    } catch (tokenErr: any) {
      logStage('IAM Token Generation', 'FAIL', `Token retrieval failed: ${tokenErr?.message ?? tokenErr}`);
      return res.status(200).json({ status: 'unhealthy', stages });
    }

    // 3. Model query & 4. Generation test
    let generatedText = '';
    try {
      const endpoint = `${url.replace(/\/$/, '')}/ml/v1/text/generation?version=2023-05-29`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          input: '<|system|>\nYou are a helpful test assistant. Respond in JSON only.\n<|user|>\nRespond with exactly {"status":"OK"}\n<|assistant|>\n',
          parameters: {
            decoding_method: 'greedy',
            max_new_tokens: 30,
          },
          model_id: modelId,
          project_id: projectId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Watsonx API endpoint returned status ${response.status}`);
      }

      const responseData = await response.json();
      generatedText = responseData.results?.[0]?.generated_text ?? '';
      if (!generatedText) {
        throw new Error('Generation text was empty');
      }
      logStage('Model Query & Generation', 'PASS', `Successfully generated text from model: ${modelId}`);
    } catch (genErr: any) {
      logStage('Model Query & Generation', 'FAIL', `Generation query failed: ${genErr?.message ?? genErr}`);
      return res.status(200).json({ status: 'unhealthy', stages });
    }

    // 5. JSON Schema validation check
    try {
      const cleaned = generatedText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.status !== 'OK') {
        throw new Error(`Unexpected JSON value: ${JSON.stringify(parsed)}`);
      }
      logStage('JSON Schema Validation', 'PASS', 'Generated text successfully parsed and validated against test schema.');
    } catch (parseErr: any) {
      logStage('JSON Schema Validation', 'FAIL', `Failed to parse model response: ${parseErr?.message ?? parseErr}. Raw text: ${generatedText}`);
      return res.status(200).json({ status: 'unhealthy', stages });
    }

    return res.status(200).json({ status: 'healthy', stages });
  } catch (error: any) {
    logStage('Unexpected Error', 'FAIL', error?.message ?? String(error));
    return res.status(200).json({ status: 'unhealthy', stages });
  }
}
