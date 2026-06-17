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
* **Acceptance Criteria:** `incidents.json` contains valid data for Perišić, De Jong, and Suárez, including pre-computed Granite perspectives.

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
* **Acceptance Criteria:** User can click through the 3 core incidents sequentially.

## 4. Backend

### [TASK-BE-01] Layer 2 API Proxy
* **Description:** Create the Next.js Serverless Function / API route `POST /api/v1/incidents/generate` to accept free-text inputs.
* **Dependencies:** TASK-SET-01
* **Priority:** Medium
* **Estimated Effort:** 1 Day
* **Acceptance Criteria:** Endpoint accepts requests, validates input, and returns mock JSON.

## 5. AI Integration

### [TASK-AI-01] LangFlow Pipeline Deployment
* **Description:** Host the LangFlow pipeline integrating IBM Docling and Granite for the live generation layer.
* **Dependencies:** None
* **Priority:** Medium
* **Estimated Effort:** 2 Days
* **Acceptance Criteria:** LangFlow exposes a webhook that generates 5 perspectives from incident text.

### [TASK-AI-02] Backend to LangFlow Connection
* **Description:** Connect the backend API proxy (TASK-BE-01) to the live LangFlow pipeline.
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
* **Description:** Embed heavily compressed MP4s/GIFs and ensure they preload on the Home page.
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
