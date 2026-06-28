import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getIamToken, fetchWithTimeout } from './utils';

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

    // 2. IAM Token generation (Using unified pipeline)
    const logs: string[] = [];
    let token = '';
    try {
      const accessToken = await getIamToken(apiKey, logs);
      if (!accessToken) {
        throw new Error('access_token field missing in response');
      }
      token = accessToken;
      logStage('IAM Token Generation', 'PASS', `OAuth token retrieved successfully. Length: ${token.length} chars.`);
    } catch (tokenErr: unknown) {
      const errMsg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      logStage('IAM Token Generation', 'FAIL', `Token retrieval failed: ${errMsg}`);
      return res.status(200).json({ status: 'unhealthy', stages });
    }

    // 3. Model availability check (pinging /models)
    try {
      // For health, we just check if the generation endpoint is reachable, or run a tiny generation
      const endpoint = `${url.replace(/\/$/, '')}/ml/v1/text/generation?version=2023-05-29`;
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          input: '<|system|>nYou are a helpful test assistant.n<|user|>nSay "hi"n<|assistant|>n',
          parameters: {
            decoding_method: 'greedy',
            max_new_tokens: 5,
          },
          model_id: modelId,
          project_id: projectId,
        }),
      }, 10000);

      if (!response.ok) {
        throw new Error(`Watsonx API endpoint returned status ${response.status}`);
      }
      
      const responseData = await response.json();
      if (!responseData.results || responseData.results.length === 0) {
         throw new Error('Empty result from Watsonx API');
      }

      logStage('Model Availability', 'PASS', `Model ${modelId} is reachable and responding.`);
    } catch (modelErr: unknown) {
      const errMsg = modelErr instanceof Error ? modelErr.message : String(modelErr);
      logStage('Model Availability', 'FAIL', `Model check failed: ${errMsg}`);
      return res.status(200).json({ status: 'unhealthy', stages });
    }

    return res.status(200).json({ status: 'healthy', stages });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logStage('Unexpected Error', 'FAIL', errMsg);
    return res.status(200).json({ status: 'unhealthy', stages });
  }
}
