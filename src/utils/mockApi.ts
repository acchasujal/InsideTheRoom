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

export const generateLivePerspectives = async (incidentText: string, loadedText?: string): Promise<any> => {
  const body: any = { text: incidentText };
  if (loadedText) {
    body.loadedText = loadedText;
  }
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Failed to generate perspectives: ${response.statusText}`);
  }

  return response.json();
};
