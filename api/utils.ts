export function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  retries = 2,
  delayMs = 1000
): Promise<Response> {
  try {
    return await fetchWithTimeout(url, options, timeoutMs);
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    console.warn(`[Retry Handler] API call failed, retrying in ${delayMs}ms. Error:`, error);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fetchWithRetry(url, options, timeoutMs, retries - 1, delayMs * 2);
  }
}

let cachedIamToken: { token: string; expiresAt: number } | null = null;
let pendingTokenPromise: Promise<string | null> | null = null;

export async function getIamToken(apiKey: string, logs: string[]): Promise<string | null> {
  if (cachedIamToken && cachedIamToken.expiresAt > Date.now()) {
    logs.push(`[${new Date().toISOString()}] [IAM Token] Using cached IAM OAuth token.`);
    return cachedIamToken.token;
  }
  if (pendingTokenPromise) {
    logs.push(`[${new Date().toISOString()}] [IAM Token] Awaiting active IAM OAuth token generation request.`);
    return pendingTokenPromise;
  }

  pendingTokenPromise = (async () => {
    try {
      logs.push(`[${new Date().toISOString()}] [IAM Token] Requesting new IAM OAuth token from IBM Cloud.`);
      const tokenResponse = await fetchWithRetry(
        'https://iam.cloud.ibm.com/identity/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
            apikey: apiKey,
          }),
        },
        8000,
        2,
        500
      );

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token ?? null;
        if (accessToken) {
          const expiresIn = tokenData.expires_in ?? 3600;
          cachedIamToken = {
            token: accessToken,
            expiresAt: Date.now() + (expiresIn - 300) * 1000,
          };
          logs.push(`[${new Date().toISOString()}] [IAM Token] IAM OAuth token successfully retrieved and cached.`);
          return accessToken;
        }
      }
      throw new Error(`IAM token endpoint returned status ${tokenResponse.status}`);
    } catch (tokenErr: unknown) {
      const errMsg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      logs.push(`[${new Date().toISOString()}] [IAM Token] [FAIL] Token retrieval failed: ${errMsg}`);
      throw tokenErr;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return pendingTokenPromise;
}
