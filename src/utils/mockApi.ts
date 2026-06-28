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
    requestId: string;
    auditId?: string;
    modelId: string;
    prompt?: string;
    parameters?: Record<string, unknown>;
    ambiguityScore?: number;
    inferenceStatus?: string;
    executionMode?: string;
    cacheStatus?: string;
    connectionStatus?: string;
    inferenceDuration?: number;
    timestamp?: string;
    logs?: string[];
  };
}

export class WatsonxError extends Error {
  code: string;
  details: string;
  logs: string[];
  requestId?: string;

  constructor(message: string, code: string, details: string, logs: string[], requestId?: string) {
    super(message);
    this.name = 'WatsonxError';
    this.code = code;
    this.details = details;
    this.logs = logs;
    this.requestId = requestId;
  }
}

interface ErrorResponseBody {
  error?: string;
  code?: string;
  details?: string;
  logs?: string[];
  requestId?: string;
}

/**
 * Calls /api/generate with a hard 25-second client-side timeout.
 * On any network failure, timeout, or non-OK response, throws a structured
 * WatsonxError containing details from the backend, so the UI can display "IBM unavailable"
 * and offer reference benchmarks.
 */
export const generateLivePerspectives = async (
  incidentText: string,
  loadedText?: string,
  mode: 'live' | 'preset' = 'live',
  presetId?: string | null
): Promise<LiveGenerationResponse | { neutral: LiveGenerationResponse; loaded: LiveGenerationResponse }> => {
  const body: { text: string; mode: string; presetId?: string; loadedText?: string } = {
    text: incidentText,
    mode,
  };
  if (mode === 'preset' && presetId) {
    body.presetId = presetId;
  }
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
      let errBody: ErrorResponseBody = { error: 'Unknown server error', code: 'SERVER_ERROR', details: '' };
      try {
        errBody = await response.json() as ErrorResponseBody;
      } catch {
        // use default
      }
      const errorMsg = errBody.error || `Server returned status ${response.status}`;
      throw new WatsonxError(
        errorMsg,
        errBody.code || 'HTTP_ERROR',
        errBody.details || '',
        errBody.logs || [],
        errBody.requestId
      );
    }

    const data = await response.json();

    // Verify response schema structure minimally to ensure it's not silently corrupted
    if (loadedText && loadedText.trim()) {
      if (!data.neutral || !data.loaded) {
        throw new Error('Malformed sensitivity response: neutral or loaded data is missing.');
      }
    } else {
      if (!data.perspectives || !Array.isArray(data.perspectives) || data.perspectives.length < 4) {
        throw new Error('Malformed single-inference response: perspectives array is missing or incomplete.');
      }
    }

    return data as LiveGenerationResponse | { neutral: LiveGenerationResponse; loaded: LiveGenerationResponse };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new WatsonxError(
        'Request timed out after 25 seconds. Please try again.',
        'TIMEOUT',
        'The Watsonx serverless proxy did not return a response within 25s.',
        []
      );
    }
    throw err;
  }
};
