# Frontend Architecture

**Status:** CANONICAL.
This architecture is optimized ruthlessly for demo impact, absolute reliability during a 3-minute presentation, implementation speed for a small team, and judge memorability.

---

## 1. Architectural Overview

### 1.1 The MVP Architecture (Demo-Critical Path)
The product must function entirely as a **Static Frontend Application** (React/Next.js or Vite) serving a hardcoded, bundled JSON file (`incidents.json`).
- **No Backend for Layer 1:** The frontend is the entire application for the main 3-minute flow.
- **No Database:** Removes latency, schema migrations, API timeout risks, and demo downtime.
- **Precomputed Data:** All AI perspectives, law text, and incident data are generated offline, verified, and shipped inside the bundle. 

### 1.2 The Demo-Safe Guarantee
If the WiFi fails in the judging room, Layer 1 must still execute flawlessly from localhost.

### 1.3 Overengineering Traps (DO NOT BUILD)
To ensure we ship on time, reject any PRs containing:
- **Custom Video Scrubbers/Players:** Use standard HTML5 `<video>` elements or looping GIFs.
- **User Authentication:** Zero judging upside.
- **Persistent State (localStorage/DB):** State only exists for the duration of a single demo run.
- **Complex Routing Animations:** Stick to simple CSS fade-ins. Heavy animation libraries break navigation flows.
- **Live LLM Calls in Layer 1:** The main path MUST NEVER call an external API.

---

## 2. Page Hierarchy & Routing

Strict, linear routing. The user cannot navigate freely; they must follow the narrative.

### 2.1 `/` (Home / Hook)
- **Purpose:** Establish the thesis and reset expectations.
- **Inputs:** None.
- **Outputs:** Button click pushes router to the first incident.
- **Dependencies:** None.

### 2.2 `/incident/[id]` (The Main Loop)
- **Purpose:** Orchestrates the core Two-Decision mechanism. Handles all incidents sequentially (Perišić -> De Jong -> Mbappé (optional) -> Suárez).
- **Inputs:** URL parameter `[id]` which maps to a key in `incidents.json`.
- **Outputs:** User decisions (held in local state), progression to the next phase in the cycle.
- **Dependencies:** `incidents.json`, core flow components.

### 2.3 `/live` (Layer 2 - Live Generation)
- **Purpose:** Prove Granite's structural necessity to judges via real-time LangFlow execution on a novel incident.
- **Inputs:** Free-text incident description typed by the judge.
- **Outputs:** Live pipeline logs, 5 Granite-generated perspectives.
- **Dependencies:** External LangFlow/Granite API endpoint.

---

## 3. State Management

**Philosophy:** Ephemeral, localized, and easily erasable. No Redux, no Zustand. React Context or local component state is entirely sufficient.

### 3.1 Global State (React Context)
- `DemoContext`:
  - `currentIncidentIndex`: Tracks which of the canonical incidents the user is currently viewing.
  - `resetDemo()`: A function bound to a hidden hotkey or logo click that instantly wipes all state and routes to `/`. Crucial for seamless judging transitions.

### 3.2 Local State (`IncidentContainer`)
State lives only as long as the user is on the specific incident.
- `step`: `SETUP` -> `DECISION_1` -> `PERSPECTIVES` -> `REVEAL` -> `DECISION_2`.
- `userDecisions`: `{ decision1: string | null, decision2: string | null }`.

---

## 4. Data Flow

### 4.1 Content Loading (Layer 1)
- **Source:** `src/data/incidents.json`.
- **Flow:** The `IncidentContainer` mounts, reads the URL parameter `[id]`, retrieves the matching static object from the JSON file, and passes the required strings down as props to `IncidentCard`, `DecisionPanel`, `LawViewer`, etc. Data flow is strictly top-down.

### 4.2 API Integration (Layer 2 Only)
- **Source:** User input in the `/live` route.
- **Flow:** User clicks "Generate" -> Frontend POST request to LangFlow Webhook/API -> Frontend polls or uses SSE for pipeline logs -> Final JSON response is parsed into the `EvidenceViewer`.

---

## 5. Caching Strategy
- **Layer 1:** 100% Client-side. `incidents.json` is bundled at build time. No network caching is needed because no network requests are made.
- **Layer 2:** No caching. Every request must hit the API to prove live capability to the judge.
- **Media Assets:** Videos/Images must be heavily compressed and eager-loaded upon landing on the Home screen to ensure zero buffering during the critical 3-minute demo window.

---

## 6. Animation Orchestration
- **Framework:** CSS Transitions or a lightweight library (e.g., Framer Motion).
- **Rule:** Animations are triggered *only* by state changes in `IncidentContainer` (e.g., when `step` changes from `PERSPECTIVES` to `REVEAL`).
- **Critical Animation:** The Reveal. The law text must render first, pause, and then the undefined term must illuminate/highlight. This timing (e.g., a 1.0s delay) is crucial for delivering the "a-ha" moment.

---

## 7. Mobile Responsiveness
- **Philosophy:** Mobile-first design principles, but **Demo-first execution**.
- **Reality:** The demo will be presented to judges on a laptop, iPad, or external monitor.
- **Implementation:** Use flexbox/grid for fluid scaling. Ensure typography remains highly readable on a tablet screen. Do not waste time building complex mobile drawer menus; the UI is entirely linear, and linear flows stack naturally on vertical screens.
