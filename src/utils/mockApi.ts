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
    inferenceStatus?: string;
  };
}

/**
 * Calls /api/generate with a hard 25-second client-side timeout.
 * On any network failure, timeout, or non-OK response, throws a structured
 * Error so the caller can catch and show a graceful fallback — never hangs.
 */
export const generateLivePerspectives = async (
  incidentText: string,
  loadedText?: string
): Promise<any> => {
  const body: Record<string, string> = { text: incidentText };
  if (loadedText && loadedText.trim()) {
    body.loadedText = loadedText.trim();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response has the expected shape before returning
    if (loadedText && loadedText.trim()) {
      if (!data.neutral || !data.loaded) {
        throw new Error('Malformed sensitivity response from API');
      }
    } else {
      if (!data.perspectives || !Array.isArray(data.perspectives)) {
        throw new Error('Malformed single-inference response from API');
      }
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out after 25 seconds. Using fallback data.');
    }
    throw err;
  }
};
