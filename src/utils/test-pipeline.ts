import fs from 'fs';
import path from 'path';
import healthHandler from '../../api/health';
import generateHandler from '../../api/generate';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      const key = parts[0].trim();
      const val = parts[1].trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

function mockResponse() {
  const res: any = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(obj: any) {
      this.body = obj;
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
}

async function runTests() {
  console.log('=== INSIDE THE ROOM: PIPELINE DIAGNOSTIC INTERVIEW ===');
  console.log('Environment loaded from .env');
  console.log(`WATSONX_PROJECT_ID: ${process.env.WATSONX_PROJECT_ID ? 'Configured' : 'MISSING'}`);
  console.log(`WATSONX_API_KEY: ${process.env.WATSONX_API_KEY ? 'Configured' : 'MISSING'}`);
  console.log('-----------------------------------------------------\n');

  // Test 1: Health Validation
  console.log('[TEST 1] Executing End-to-End Health Check (api/health.ts)...');
  const req1: any = { method: 'GET' };
  const res1 = mockResponse();
  await healthHandler(req1, res1);
  console.log(`HTTP Status: ${res1.statusCode}`);
  console.log('Result:', JSON.stringify(res1.body, null, 2));
  console.log('-----------------------------------------------------\n');

  // Test 2: Preset Incident Caching and Retrieval
  console.log('[TEST 2] Executing Preset Incident Request (api/generate.ts)...');
  const req2: any = {
    method: 'POST',
    body: {
      text: "The defender made contact with the attacker's leg while attempting to play the ball."
    }
  };
  const res2 = mockResponse();
  await generateHandler(req2, res2);
  console.log(`HTTP Status: ${res2.statusCode}`);
  console.log(`Cache Status: ${res2.body?._metadata?.cacheStatus}`);
  console.log(`Connection Status: ${res2.body?._metadata?.connectionStatus}`);
  console.log(`Extracted Tension Term: "${res2.body?.tensionTerm}"`);
  console.log('-----------------------------------------------------\n');

  // Test 3: Preset Cache Hit verification
  console.log('[TEST 3] Re-running identical Preset Request (Cache Hit verification)...');
  const res3 = mockResponse();
  await generateHandler(req2, res3);
  console.log(`HTTP Status: ${res3.statusCode}`);
  console.log(`Cache Status: ${res3.body?._metadata?.cacheStatus}`);
  console.log(`Connection Status: ${res3.body?._metadata?.connectionStatus}`);
  console.log('-----------------------------------------------------\n');

  // Test 4: Custom Incident Live IBM Inference
  console.log('[TEST 4] Executing Custom Live Incident (api/generate.ts - should bypass cache)...');
  const req4: any = {
    method: 'POST',
    body: {
      text: "A player kicked the referee's drink container in frustration after receiving a warning."
    }
  };
  const res4 = mockResponse();
  await generateHandler(req4, res4);
  console.log(`HTTP Status: ${res4.statusCode}`);
  if (res4.statusCode === 200) {
    console.log(`Model Identity: ${res4.body?._metadata?.modelId}`);
    console.log(`Cache Status: ${res4.body?._metadata?.cacheStatus}`);
    console.log(`Connection Status: ${res4.body?._metadata?.connectionStatus}`);
    console.log(`Extracted Tension Term: "${res4.body?.tensionTerm}"`);
    console.log(`Ambiguity Score: ${res4.body?.ambiguityScore}/10`);
  } else {
    console.log('Live Inference Failed as Expected:', JSON.stringify(res4.body, null, 2));
  }
  console.log('-----------------------------------------------------\n');

  // Test 5: API Error Truthfulness (Bypass Fallback substitution check)
  console.log('[TEST 5] Testing API failure handling under missing credentials...');
  const originalKey = process.env.WATSONX_API_KEY;
  process.env.WATSONX_API_KEY = ''; // Simulate credentials failure

  const res5 = mockResponse();
  await generateHandler(req4, res5);
  console.log(`HTTP Status: ${res5.statusCode} (Expected: 502)`);
  console.log('Response Payload (No fabrication check):', JSON.stringify(res5.body, null, 2));
  
  process.env.WATSONX_API_KEY = originalKey; // Restore
  console.log('\n================ Diagnostic Completed ================');
}

runTests().catch(err => {
  console.error('Diagnostic error:', err);
});
