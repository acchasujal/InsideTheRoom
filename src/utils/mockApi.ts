export interface GeneratedPerspective {
  persona: string;
  text: string;
}

export interface LiveGenerationResponse {
  retrievedLaw: string;
  tensionTerm: string;
  ambiguityScore: number;
  interpretationSpread: {
    purposive: number;
    contextual: number;
    procedural: number;
    strict: number;
  };
  perspectives: GeneratedPerspective[];
  _metadata?: {
    modelId: string;
    prompt: string;
    parameters: any;
    ambiguityScore: number;
    inferenceStatus?: string;
    executionMode?: string;
    cacheStatus?: string;
    connectionStatus?: string;
    logs?: string[];
  };
}

/**
 * Calls /api/generate with a hard 25-second client-side timeout.
 * On any network failure, timeout, or non-OK response, throws a structured
 * Error containing details from the backend, so the UI can display "IBM unavailable"
 * and offer reference benchmarks.
 */
export const generateLivePerspectives = async (
  incidentText: string,
  loadedText?: string,
  isPreset = false,
  forceFallback = false
): Promise<any> => {
  const body: Record<string, any> = {
    text: incidentText,
    isPreset,
    forceFallback,
  };
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
      let errBody = { error: 'Unknown server error', code: 'SERVER_ERROR', details: '' };
      try {
        errBody = await response.json();
      } catch (parseErr) {
        // use default
      }
      const errorMsg = errBody.error || `Server returned status ${response.status}`;
      const errObj = new Error(errorMsg) as any;
      errObj.code = errBody.code || 'HTTP_ERROR';
      errObj.details = errBody.details || '';
      errObj.logs = (errBody as any).logs || [];
      throw errObj;
    }

    const data = await response.json();

    // Verify response schema structure
    if (loadedText && loadedText.trim()) {
      if (!data.neutral || !data.loaded) {
        throw new Error('Malformed sensitivity response: neutral or loaded data is missing.');
      }
    } else {
      if (!data.perspectives || !Array.isArray(data.perspectives) || data.perspectives.length < 4) {
        throw new Error('Malformed single-inference response: perspectives array is missing or incomplete.');
      }
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out after 25 seconds. Please try again.') as any;
      timeoutErr.code = 'TIMEOUT';
      timeoutErr.details = 'The Watsonx serverless proxy did not return a response within 25s.';
      throw timeoutErr;
    }
    throw err;
  }
};
