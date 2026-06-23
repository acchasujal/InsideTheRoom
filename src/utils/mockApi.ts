export interface GeneratedPerspective {
  persona: string;
  text: string;
}

export interface LiveGenerationResponse {
  retrievedLaw: string;
  perspectives: GeneratedPerspective[];
  _metadata?: {
    modelId: string;
    prompt: string;
    parameters: any;
    ambiguityScore: number;
  };
}

export const generateLivePerspectives = async (incidentText: string): Promise<LiveGenerationResponse> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: incidentText })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate perspectives: ${response.statusText}`);
  }

  return response.json();
};
