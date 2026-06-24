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
    const { text, loadedText } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: 'Missing incident text' });
    }

    const watsonxApiKey = process.env.WATSONX_API_KEY;
    const watsonxProjectId = process.env.WATSONX_PROJECT_ID;

    // Helper to generate a single payload
    const getPayload = async (inputText: string, token: string | null) => {
      if (!token || !watsonxProjectId) {
        return generateMockResponse(inputText);
      }
      return callWatsonx(inputText, token, watsonxProjectId);
    };

    // Obtain token if api key is present
    let accessToken: string | null = null;
    if (watsonxApiKey && watsonxProjectId) {
      try {
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

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessToken = tokenData.access_token;
        }
      } catch (tokenErr) {
        console.error('Error fetching IAM token, using mock fallback:', tokenErr);
      }
    }

    if (loadedText) {
      // Parallel generation for both phrasings
      const [neutralPayload, loadedPayload] = await Promise.all([
        getPayload(text, accessToken),
        getPayload(loadedText, accessToken)
      ]);
      return res.status(200).json({
        neutral: neutralPayload,
        loaded: loadedPayload
      });
    } else {
      const payload = await getPayload(text, accessToken);
      return res.status(200).json(payload);
    }

  } catch (error: any) {
    console.error('API Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

async function callWatsonx(text: string, accessToken: string, watsonxProjectId: string) {
  const prompt = `You are an expert rules interpreter for high-stakes decision systems. Analyze the following incident and provide 4 perspectives: Fan (Purposive Reading), Referee (Contextual Reading), VAR (Procedural Reading), and Rulebook (Strict Constructionist Reading).

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


  const watsonxResponse = await fetch('https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
  generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsedPayload = JSON.parse(generatedText);
    if (!parsedPayload.retrievedLaw || !Array.isArray(parsedPayload.perspectives)) {
      throw new Error('Invalid JSON schema returned by Granite');
    }

    parsedPayload._metadata = {
      modelId: 'ibm/granite-13b-chat-v2',
      prompt: prompt,
      inferenceStatus: 'LIVE_WATSONX_AI',
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: 800,
        repetition_penalty: 1,
      },
      ambiguityScore: parsedPayload.ambiguityScore ?? Math.round((7.5 + (text.length % 21) / 10) * 10) / 10,
      tensionTerm: parsedPayload.tensionTerm ?? null,
      interpretationSpread: parsedPayload.interpretationSpread ?? null,
    };

    return parsedPayload;
  } catch (parseError) {
    console.error('Failed to parse Granite output, falling back to mock:', generatedText);
    return generateMockResponse(text);
  }
}

function generateMockResponse(incidentText: string) {
  const lowerText = incidentText.toLowerCase();
  
  // Checking corporate compliance scenarios first
  if (lowerText.includes('employee') || lowerText.includes('shared') || lowerText.includes('leak') || lowerText.includes('unauthorized') || lowerText.includes('contractor') || lowerText.includes('proprietary') || lowerText.includes('disclosure')) {
    const isLoaded = lowerText.includes('leak') || lowerText.includes('unauthorized') || lowerText.includes('violently') || lowerText.includes('steal') || lowerText.includes('malicious');
    
    return {
      retrievedLaw: "Section 4.2 (Information Security & Data Protection Policy)\n\nEmployees must safeguard company information. Unauthorized transmission of proprietary business data to external third parties is strictly prohibited. External reviews must occur under authorized non-disclosure terms.",
      perspectives: [
        { 
          persona: "Fan", 
          text: isLoaded 
            ? "The employee committed a major compliance violation. Bypassing standard protocols exposes the entire product line to corporate espionage, regardless of execution speed." 
            : "The collaboration with an external contractor was intended to accelerate critical QA testing, directly serving the project's success and company milestones." 
        },
        { 
          persona: "Referee", 
          text: isLoaded
            ? "Sharing proprietary code without security approval constitutes a direct breach of corporate data policy. The action cannot be excused."
            : "An active Master Services Agreement and NDA were in place with the contractor. The information remained within a legally protected business circle." 
        },
        { 
          persona: "VAR", 
          text: isLoaded
            ? "The data transmission crossed the severity threshold for immediate compliance escalation and credential revocation."
            : "The sharing was restricted to specific files under review, not meeting the threshold of a systemic database leak or IP compromise." 
        },
        { 
          persona: "Rulebook", 
          text: "All disclosures of proprietary company assets to non-employee entities must be pre-cleared by corporate legal counsel. Unsanctioned transfers are policy violations." 
        }
      ],
      tensionTerm: "authorized",
      interpretationSpread: { purposive: isLoaded ? 92 : 35, contextual: isLoaded ? 88 : 28, procedural: isLoaded ? 95 : 42, strict: 80 },
      _metadata: {
        modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
        prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
        inferenceStatus: 'LOCAL_MOCK_FALLBACK',
        parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
        ambiguityScore: isLoaded ? 9.1 : 7.2,
        tensionTerm: "authorized",
        interpretationSpread: { purposive: isLoaded ? 92 : 35, contextual: isLoaded ? 88 : 28, procedural: isLoaded ? 95 : 42, strict: 80 }
      }
    };
  }

  // Handball scenarios
  if (lowerText.includes('handball') || lowerText.includes('arm') || lowerText.includes('deliberately touches') || lowerText.includes('contact with the ball') || lowerText.includes('deliberately touches the ball')) {
    const isLoaded = lowerText.includes('violently') || lowerText.includes('no attempt') || lowerText.includes('deliberately touches');
    
    return {
      retrievedLaw: "Law 12 (Fouls and Misconduct - Handling the ball)\n\nIt is an offence if a player deliberately touches the ball with their hand/arm, or touches the ball when their hand/arm has made their body unnaturally bigger.",
      perspectives: [
        { 
          persona: "Fan", 
          text: isLoaded 
            ? "Blatant infraction! He lunges and moves his hand directly to intercept the ball. This is a clear cheat that must be penalized with a penalty." 
            : "Completely natural body movement. The ball was kicked from close range, and the player had no time or intent to move their arm away." 
        },
        { 
          persona: "Referee", 
          text: isLoaded
            ? "The player's arm was raised and blocked the ball path. I have to blow the whistle; he took the risk by making himself unnaturally bigger."
            : "The arm silhouette was natural for a running stride. I saw no deliberate motion to change the ball path. Play on." 
        },
        { 
          persona: "VAR", 
          text: isLoaded
            ? "The replay shows clear contact with the hand extended. I recommend an on-field review to award the penalty kick."
            : "The contact was incidental and occurred during a natural jumping action. No clear and obvious error; stick with the on-field decision." 
        },
        { 
          persona: "Rulebook", 
          text: "Handling the ball is penalized if a player deliberately touches it or positions their arm to make their body unnaturally bigger in an unjustifiable silhouette." 
        }
      ],
      tensionTerm: "deliberately",
      interpretationSpread: { purposive: isLoaded ? 97 : 18, contextual: isLoaded ? 75 : 30, procedural: isLoaded ? 88 : 45, strict: 50 },
      _metadata: {
        modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
        prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
        inferenceStatus: 'LOCAL_MOCK_FALLBACK',
        parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
        ambiguityScore: isLoaded ? 9.4 : 8.5,
        tensionTerm: "deliberately",
        interpretationSpread: { purposive: isLoaded ? 97 : 18, contextual: isLoaded ? 75 : 30, procedural: isLoaded ? 88 : 45, strict: 50 }
      }
    };
  }

  // Football tackle / Serious Misconduct
  if (lowerText.includes('tackle') || lowerText.includes('foul') || lowerText.includes('lunged') || lowerText.includes('kick') || lowerText.includes('referee') || lowerText.includes('card') || lowerText.includes('pitch')) {
    const isTackleLoaded = lowerText.includes('violently') || lowerText.includes('no attempt') || lowerText.includes('lunged') || lowerText.includes('excessive');
    return {
      retrievedLaw: "Law 12 (Fouls and Misconduct - Serious Foul Play)\n\nA tackle or challenge that endangers the safety of an opponent or uses excessive force or brutality must be sanctioned as serious foul play.",
      perspectives: [
        { 
          persona: "Fan", 
          text: isTackleLoaded 
            ? "Unacceptable, brutal challenge! It was a red card tackle that could have broken his leg. He didn't even look at the ball." 
            : "Clean tackle. He touched the ball first, and any follow-through contact was completely incidental and unavoidable." 
        },
        { 
          persona: "Referee", 
          text: isTackleLoaded
            ? "The challenge was high and endangerment was clear. I had to issue a red card for serious foul play."
            : "The tackle was reckless, but he was playing the ball and didn't make high contact. A yellow card is sufficient warning." 
        },
        { 
          persona: "VAR", 
          text: isTackleLoaded
            ? "The replay reveals a high, studded challenge with excessive force. I recommend an immediate red card review."
            : "There is contact, but it does not meet the threshold of brutality or serious endangerment. Stick with the yellow card." 
        },
        { 
          persona: "Rulebook", 
          text: "Any player who lunges at an opponent in challenging for the ball from the front, from the side or from behind using one or both legs with excessive force or endangers the safety of an opponent is guilty of serious foul play." 
        }
      ],
      tensionTerm: "excessive force",
      interpretationSpread: { purposive: isTackleLoaded ? 97 : 12, contextual: isTackleLoaded ? 80 : 35, procedural: isTackleLoaded ? 90 : 28, strict: 65 },
      _metadata: {
        modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
        prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
        inferenceStatus: 'LOCAL_MOCK_FALLBACK',
        parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
        ambiguityScore: isTackleLoaded ? 8.9 : 7.6,
        tensionTerm: "excessive force",
        interpretationSpread: { purposive: isTackleLoaded ? 97 : 12, contextual: isTackleLoaded ? 80 : 35, procedural: isTackleLoaded ? 90 : 28, strict: 65 }
      }
    };
  }

  // Fallback for ANY OTHER DOMAIN (completely domain-agnostic)
  const cleanWords = incidentText.split(/\s+/).filter(w => w.length > 4);
  const keyword = cleanWords.length > 0 ? cleanWords[0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") : "Behavioral";
  const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
  
  const isLoaded = lowerText.includes('violation') || lowerText.includes('breach') || lowerText.includes('violently') || lowerText.includes('severe') || lowerText.includes('unauthorized') || lowerText.includes('failure');

  return {
    retrievedLaw: `Section Governance.10.3 (Standard Operational Conduct - Compliance Policy regarding ${formattedKeyword})\n\nActions and processes involving "${formattedKeyword.toLowerCase()}" must align with the core transparency guidelines. Discretionary bounds must be documented to prevent procedural inconsistency.`,
    perspectives: [
      {
        persona: "Fan",
        text: isLoaded
          ? `Purposive Reading: The context indicates a clear violation of standard procedure. Tolerating deviations of this severity exposes the system to systemic failures and operational risk.`
          : `Purposive Reading: The activity was conducted in good faith to advance critical operations. A strict infraction penalty runs counter to the spirit of operational agility.`
      },
      {
        persona: "Referee",
        text: isLoaded
          ? `Contextual Reading: The facts show a direct conflict with procedural guidelines. The operational boundary was crossed under conditions that justify formal sanctions.`
          : `Contextual Reading: Although a procedural boundary was intersected, the surrounding operational context and pressure place this behavior in a justifiable gray zone.`
      },
      {
        persona: "VAR",
        text: isLoaded
          ? `Procedural Reading: The event logs confirm a clear, material breach. The incident crosses the structural threshold requiring immediate review and corrective action.`
          : `Procedural Reading: The event logs show standard deviation within acceptable margins. The action does not cross the material threshold required to warrant an intervention.`
      },
      {
        persona: "Rulebook",
        text: `Strict Constructionist Reading: Under the literal wording of the policy, any deviation involving "${formattedKeyword.toLowerCase()}" represents an immediate compliance infraction. The policy contains no exceptions for intent or context.`
      }
    ],
    tensionTerm: formattedKeyword.toLowerCase(),
    interpretationSpread: { purposive: isLoaded ? 88 : 30, contextual: isLoaded ? 72 : 35, procedural: isLoaded ? 80 : 40, strict: 60 },
    _metadata: {
      modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)',
      prompt: `You are an expert rules interpreter. Analyze the incident: "${incidentText}"`,
      inferenceStatus: 'LOCAL_MOCK_FALLBACK',
      parameters: { decoding_method: 'greedy', max_new_tokens: 800 },
      ambiguityScore: isLoaded ? 8.8 : 6.9,
      tensionTerm: formattedKeyword.toLowerCase(),
      interpretationSpread: { purposive: isLoaded ? 88 : 30, contextual: isLoaded ? 72 : 35, procedural: isLoaded ? 80 : 40, strict: 60 }
    }
  };
}

