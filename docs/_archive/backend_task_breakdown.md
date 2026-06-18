# Backend Task Breakdown

This document outlines the backend and API integration execution plan, organized by build sequence.

**Rule:** The backend strictly supports Layer 2 (Live Generation). Layer 1 requires zero backend development beyond static JSON generation.

## 1. Build Sequence

### Phase A: Static Data Formatting (Critical Path)
1. **Data Normalization:** Translate `incident_content_registry.md` into the exact JSON schema required by the frontend (`incidents.json`).
2. **Offline Generation:** Run the Granite prompts manually for the 3 core incidents to generate the static perspectives.

### Phase B: Serverless API Proxy (Demo-Critical)
1. **API Route Setup:** Create `POST /api/v1/incidents/generate`.
2. **Input Validation:** Implement middleware to sanitize user text (prevent prompt injection, ensure length limits).
3. **Mock Integration:** Initially, make the API return a hardcoded successful response matching the expected Granite payload to unblock the frontend `/live` page.

### Phase C: LangFlow & Granite Orchestration (Parallelizable)
1. **LangFlow Pipeline Setup:** Import the conceptual pipeline into LangFlow.
2. **Docling Integration:** Connect IBM Docling for FIFA law retrieval.
3. **Granite Node Configuration:** Configure watsonx.ai keys and prompt templates.
4. **Webhook Exposure:** Expose the LangFlow pipeline as an external API webhook.

### Phase D: API Layer Integration (Demo-Critical)
1. **Connect Proxy to Webhook:** Update the API route (Phase B) to call the LangFlow webhook (Phase C).
2. **Error Handling:** Implement robust timeout handling and fallback responses if IBM APIs are slow.
3. **Response Parsing:** Ensure the LangFlow output is strictly formatted to match the `incidents.json` schema before returning to the client.

### Phase E: Deployment & Caching (Demo-Critical)
1. **Edge Deployment:** Deploy the Serverless API to Vercel/Netlify.
2. **Disable Caching:** Explicitly disable edge caching on the `/api/v1/incidents/generate` route to guarantee live execution during the demo.

## 2. Work Categorization

### Critical Path (Must Build to Win)
* Phase A (Static JSON). Layer 1 cannot function without this data.

### Demo-Critical Work (High ROI)
* Phase E (Deployment). The API must be accessible globally without CORS issues.

### Parallelizable Work (Can be done concurrently)
* Phase B, C, D. The entire Layer 2 backend can be built entirely independently of the frontend Layer 1 loop.
