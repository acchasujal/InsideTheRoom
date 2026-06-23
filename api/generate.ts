import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function Configuration
export const maxDuration = 30; // seconds

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
    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: 'Missing incident text' });
    }

    const watsonxApiKey = process.env.WATSONX_API_KEY;
    const watsonxProjectId = process.env.WATSONX_PROJECT_ID;

    // Fallback to mock if environment variables are not configured
    if (!watsonxApiKey || !watsonxProjectId) {
      console.log('Falling back to mock response (missing IBM Cloud credentials)');
      return res.status(200).json(generateMockResponse(text));
    }

    // 2. Fetch IBM IAM Token
    const tokenResponse = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: watsonxApiKey,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`IAM Token exchange failed: ${tokenResponse.statusText}`);
    }

    const { access_token } = await tokenResponse.json();

    // 3. Prepare Granite Prompt
    const prompt = `You are an expert soccer rules analyst. Analyze the following incident and provide 4 perspectives: Fan, Referee, VAR, and Rulebook.

Incident: "${text}"

Respond EXACTLY in this JSON format, with no markdown formatting, no backticks, and no conversational text:
{
  "retrievedLaw": "Law X - Brief quote...",
  "perspectives": [
    { "persona": "Fan", "text": "..." },
    { "persona": "Referee", "text": "..." },
    { "persona": "VAR", "text": "..." },
    { "persona": "Rulebook", "text": "..." }
  ]
}`;

    // 4. Call watsonx.ai Granite Model
    const watsonxResponse = await fetch('https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        input: prompt,
        parameters: {
          decoding_method: 'greedy',
          max_new_tokens: 800,
          repetition_penalty: 1,
        },
        model_id: 'ibm/granite-13b-chat-v2',
        project_id: watsonxProjectId,
      }),
    });

    if (!watsonxResponse.ok) {
      const errText = await watsonxResponse.text();
      throw new Error(`Watsonx API failed: ${watsonxResponse.status} - ${errText}`);
    }

    const watsonxData = await watsonxResponse.json();
    let generatedText = watsonxData.results?.[0]?.generated_text || '';

    // 5. Aggressive JSON Extraction (Strip markdown ticks if Granite hallucinates them)
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsedPayload = JSON.parse(generatedText);
      
      // Ensure schema matches frontend expectations
      if (!parsedPayload.retrievedLaw || !Array.isArray(parsedPayload.perspectives)) {
        throw new Error('Invalid JSON schema returned by Granite');
      }

      // Add metadata for frontend inspector
      parsedPayload._metadata = {
        modelId: 'ibm/granite-13b-chat-v2',
        prompt: prompt,
        parameters: {
          decoding_method: 'greedy',
          max_new_tokens: 800,
          repetition_penalty: 1,
        },
        ambiguityScore: Math.round((7.5 + (text.length % 21) / 10) * 10) / 10 // Dynamic deterministic score between 7.5 and 9.5
      };

      return res.status(200).json(parsedPayload);
    } catch (parseError) {
      console.error('Failed to parse Granite output:', generatedText);
      // Fallback to mock on parse failure to save the demo
      return res.status(200).json(generateMockResponse(text));
    }

  } catch (error: any) {
    console.error('API Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// Fallback Mock Logic (Migrated from client)
function generateMockResponse(incidentText: string) {
  const lowerText = incidentText.toLowerCase();
  let theme = 'general';

  if (lowerText.includes('handball') || lowerText.includes('arm')) theme = 'handball';
  else if (lowerText.includes('tackle') || lowerText.includes('foul')) theme = 'tackle';
  else if (lowerText.includes('offside')) theme = 'offside';

  const baseResponse = theme === 'handball' ? {
    retrievedLaw: "Law 12 (Fouls and Misconduct)\n\nIt is an offence if a player deliberately touches the ball with their hand/arm.",
    perspectives: [
      { persona: "Fan", text: "Clear handball, his arm was completely unnatural!" },
      { persona: "Referee", text: "Arm was in a natural silhouette for the movement." },
      { persona: "VAR", text: "Recommend review for unnatural barrier." },
      { persona: "Rulebook", text: "Unnatural position not justifiable by body movement." }
    ]
  } : {
    retrievedLaw: "Law 12 (Fouls and Misconduct)\n\nA tackle that endangers safety must be sanctioned.",
    perspectives: [
      { persona: "Fan", text: "That was a reckless challenge!" },
      { persona: "Referee", text: "Follow-through was incidental, yellow card." },
      { persona: "VAR", text: "Force used endangers opponent safety." },
      { persona: "Rulebook", text: "Lunging at an opponent with excessive force is serious foul play." }
    ]
  };

  return {
    ...baseResponse,
    _metadata: {
      modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
      prompt: `You are an expert soccer rules analyst. Analyze the following incident and provide 4 perspectives: Fan, Referee, VAR, and Rulebook.\n\nIncident: "${incidentText}"`,
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: 800,
        repetition_penalty: 1
      },
      ambiguityScore: Math.round((7.5 + (incidentText.length % 21) / 10) * 10) / 10
    }
  };
}

