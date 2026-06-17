# Backend Architecture

**Status:** CANONICAL. 
**Goal:** Define an implementation-ready backend system optimized for demo safety, challenge scoring constraints, and extreme reliability, strictly adhering to the two-layer architecture strategy.

## 1. Architectural Overview

The backend architecture is strictly divided into two operational modes to satisfy both absolute demo reliability and the proof of IBM Granite's structural necessity.

### 1.1 Service Architecture
- **Layer 1 (Precomputed / Demo-Critical):** "Zero Backend." Served entirely via CDN (Vercel/Netlify) as static JSON (`incidents.json`) bundled with the Next.js/React frontend. This ensures zero API latency, zero database timeouts, and perfect demo safety.
- **Layer 2 (Live Generation):** A serverless API layer acting as a secure proxy and orchestrator to the LangFlow/Granite pipeline. This layer only activates when a judge requests a novel, live incident.

### 1.2 Deployment Architecture
- **Frontend & Static Content (Layer 1):** Vercel/Netlify Global Edge Network.
- **Backend API (Layer 2):** Vercel Serverless Functions / AWS API Gateway + Lambda.
- **AI Orchestration:** IBM watsonx.ai (hosting Granite models) + LangFlow webhook/API.
- **Database:** None for MVP. Future scale uses PostgreSQL (Supabase/Neon).

## 2. Backend Responsibilities & Subsystems

### 2.1 Content Delivery Layer
* **Purpose:** Serve the locked, canonical 5 incidents instantly.
* **Inputs:** Client requests for routes or static assets.
* **Outputs:** Static HTML/JS/CSS and `incidents.json`.
* **Dependencies:** CDN.

### 2.2 Incident Engine (Layer 2)
* **Purpose:** Ingest unstructured text from the user for novel incidents, sanitize it, and format it for the pipeline.
* **Inputs:** Free-text incident descriptions (e.g., "Player tripped in the box").
* **Outputs:** Structured incident payload.
* **Dependencies:** Input validation middleware.

### 2.3 Law Retrieval Layer (Docling)
* **Purpose:** Ensure Granite grounds its arguments in actual FIFA Law, preventing hallucination.
* **Inputs:** Keywords or vector search from the Incident Engine.
* **Outputs:** Exact text of the relevant FIFA Law.
* **Dependencies:** IBM Docling / Vector Store of FIFA Laws.

### 2.4 Perspective Engine & Granite Orchestration Layer
* **Purpose:** The core AI pipeline proving structural necessity. Generates divergent arguments.
* **Inputs:** Structured incident + retrieved FIFA Law.
* **Outputs:** 5 personas (Fan, Referee, VAR, Rulebook, Player), divergence validation score, and a 1-sentence compressed insight/reflection.
* **Dependencies:** LangFlow, watsonx.ai (Granite).

### 2.5 Caching Strategy
* **MVP:** 100% Client-side caching of Layer 1. Layer 2 is **strictly un-cached** to prove to judges that the generation is happening live.
* **Future:** Redis cache for previously generated Layer 2 incidents to save compute costs.

## 3. Implementation Guardrails

### 3.1 MVP Backend (Build This Today)
* A single Serverless function: `POST /api/v1/incidents/generate`.
* Validates API keys, sanitizes input, calls LangFlow, and streams the response back via Server-Sent Events (SSE) or simple polling.
* Static generation scripts that ran once to produce `incidents.json`.

### 3.2 Demo-Critical Backend
* Only the static CDN layer. The demo must be capable of running flawlessly even if the serverless functions or IBM APIs are completely offline.

### 3.3 Overengineering Traps (Do NOT Build)
* **Databases for Layer 1:** Do not put the 5 canonical incidents in Postgres or MongoDB. Keep them in JSON.
* **User Authentication:** Zero value for the judging demo.
* **Complex Microservices:** Do not split the API into distinct microservices. A single monolith or serverless function is required.
* **WebSockets for Logging:** Use SSE (Server-Sent Events) or simple polling instead of heavy WebSocket infrastructure for the LangFlow logs.
