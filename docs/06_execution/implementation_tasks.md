# Implementation Tasks

This document translates the VAR Room project strategy into executable development tickets.

## 1. Setup

### [TASK-SET-01] Repository & Tooling Initialization
* **Description:** Initialize the Git repository, configure Next.js/Vite, install styling libraries, and set up folder structures.
* **Dependencies:** None
* **Priority:** Critical
* **Estimated Effort:** 0.5 Days
* **Acceptance Criteria:** `npm run dev` starts the project. ESLint and Prettier are configured.

### [TASK-SET-02] UI System Tokens
* **Description:** Define global CSS variables (colors, typography, glassmorphism shadows) based on `ui_system.md`.
* **Dependencies:** TASK-SET-01
* **Priority:** Critical
* **Estimated Effort:** 0.5 Days
* **Acceptance Criteria:** A test page successfully renders typography and a sample glassmorphism panel.

## 2. Content

### [TASK-CON-01] Static Incident JSON Generation
* **Description:** Port the contents of `incident_content_registry.md` into a static `incidents.json` file.
* **Dependencies:** None
* **Priority:** Critical
* **Estimated Effort:** 1 Day
* **Acceptance Criteria:** `incidents.json` contains valid data for all 5 incidents (Perišić, VAR Nested, De Jong, Mbappé, Suárez), including pre-computed Granite perspectives.

## 3. Frontend

### [TASK-FE-01] Core Component Library
* **Description:** Build reusable components: `DecisionPanel`, `RevealCard`, `IncidentHeader`, `PerspectiveBubble`.
* **Dependencies:** TASK-SET-02
* **Priority:** Critical
* **Estimated Effort:** 2 Days
* **Acceptance Criteria:** All components render correctly in isolation with hardcoded props.

### [TASK-FE-02] Main Loop Integration (`/incident/[id]`)
* **Description:** Implement the state machine (SETUP -> DEC1 -> PERSPECTIVES -> REVEAL -> DEC2) and connect it to `incidents.json`.
* **Dependencies:** TASK-FE-01, TASK-CON-01
* **Priority:** Critical
* **Estimated Effort:** 3 Days
* **Acceptance Criteria:** User can click through all 5 incidents sequentially in free-exploration mode. Additionally, the canonical live-demo path (Perišić → VAR Nested → Suárez) must be directly navigable without passing through De Jong or Mbappé — this requires the incident-to-incident navigation logic to support a non-sequential "demo mode" jump rather than only incrementing through the `incidents.json` array index. **Status: Complete (Implemented via isDemoMode flag).**

### Frontend Task Breakdown

#### Build Sequence
* **Phase A: Architecture & State (Critical Path):** Initialize Project (Next.js/Vite, ESLint), Context Provider (`DemoContext` for `currentIncidentIndex` and `resetDemo`), Routing Setup (`/`, `/incident/[id]`, `/live`).
* **Phase B: Design System & Primitives (Critical Path):** CSS Variables (Inter/Outfit, dark mode, glassmorphism), Typography Components, Buttons & Inputs.
* **Phase C: Core Components (Critical Path):** `IncidentCard`, `DecisionPanel`, `LawViewer`, `PerspectiveBubble`.
* **Phase D: Layouts & Pages (Critical Path):** `Home Layout` (Hook), `Incident Layout` (Main Loop).
* **Phase E: Animations & Polish (Demo-Critical Work):** The Reveal Animation (1.0s delay), Phase Transitions (fade-ins).
* **Phase F: Layer 2 Live Integration (Parallelizable):** `/live` Page (text input), Loading State (pipeline logging animation), Results Parsing (mapping JSON response).

#### Work Categorization
* **Critical Path (Must Build to Win):** Phases A, B, C, D. Without these, there is no Layer 1 demo.
* **Demo-Critical Work (High ROI):** Phase E (Animations & Polish). The Reveal Animation is what sells the intellectual "a-ha" moment to the judges.
* **Parallelizable Work:** Phase F (Layer 2). Can be built concurrently with the main loop.

## 4. Backend

### [TASK-BE-01] Layer 2 API Proxy
* **Description:** Create the Next.js Serverless Function / API route `POST /api/v1/incidents/generate` to accept free-text inputs.
* **Dependencies:** TASK-SET-01
* **Priority:** Medium
* **Estimated Effort:** 1 Day
* **Acceptance Criteria:** Endpoint accepts requests, validates input, and returns mock JSON.

### Backend Task Breakdown

#### Build Sequence
* **Phase A: Static Data Formatting (Critical Path):** Data Normalization (`incident_content_registry.md` to `incidents.json`), Offline Generation (Run Granite prompts for all 5 incidents).
* **Phase B: Serverless API Proxy (Demo-Critical):** API Route Setup (`POST /api/v1/incidents/generate`), Input Validation (sanitize text), Mock Integration (hardcoded successful response).
* **Phase C: watsonx.ai REST Integration (Parallelizable):** API Payload Construction, context matching database integration, Granite system prompt design, credentials integration.
* **Phase D: API Layer Integration (Demo-Critical):** Connect Proxy to watsonx.ai endpoint, Error Handling (timeout handling), Response Parsing (`incidents.json` schema matching).
* **Phase E: Deployment & Caching (Demo-Critical):** Edge Deployment (Vercel), Disable Caching (on `/api/generate`).

#### Work Categorization
* **Critical Path (Must Build to Win):** Phase A (Static JSON). Layer 1 cannot function without this data for all incidents.
* **Demo-Critical Work (High ROI):** Phase E (Deployment). The API must be accessible globally without CORS issues.
* **Parallelizable Work:** Phases B, C, D. The entire Layer 2 backend can be built entirely independently of the frontend Layer 1 loop.

## 5. AI Integration

### [TASK-AI-01] watsonx.ai Integration and Direct REST Call
* **Description:** Integrate the watsonx.ai client or direct REST endpoints with Granite-13b-chat models for the live generation layer.
* **Dependencies:** None
* **Priority:** Medium
* **Estimated Effort:** 2 Days
* **Acceptance Criteria:** Calling the watsonx.ai endpoint generates 4 perspectives from incident text.

### [TASK-AI-02] Backend to watsonx.ai Connection
* **Description:** Connect the backend API proxy (TASK-BE-01) to the live watsonx.ai endpoint.
* **Dependencies:** TASK-BE-01, TASK-AI-01
* **Priority:** Medium
* **Estimated Effort:** 1 Day
* **Acceptance Criteria:** Calling the API proxy successfully triggers Granite and returns real generated perspectives.

## 6. Demo

### [TASK-DEMO-01] Quick Reset Hotkey
* **Description:** Implement a global hidden hotkey to instantly wipe state and route to `/`.
* **Dependencies:** TASK-FE-02
* **Priority:** High
* **Estimated Effort:** 0.5 Days
* **Acceptance Criteria:** Pressing the hotkey instantly resets the demo to the hook page.

### [TASK-DEMO-02] Offline Asset Loading
* **Description:** Embed lightweight, stylized illustration assets (not photoreal depictions of real players — see asset-strategy note) and ensure they preload on the Home page.
* **Dependencies:** TASK-FE-02
* **Priority:** High
* **Estimated Effort:** 1 Day
* **Acceptance Criteria:** Demo functions completely without buffering when network speed is throttled.

## 7. Deployment

### [TASK-DEP-01] Vercel Production Build
* **Description:** Deploy the Layer 1 application to Vercel/Netlify.
* **Dependencies:** TASK-FE-02
* **Priority:** Critical
* **Estimated Effort:** 0.5 Days
* **Acceptance Criteria:** Live URL serves the static demo flawlessly.
