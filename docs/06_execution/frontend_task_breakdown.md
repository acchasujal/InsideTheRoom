# Frontend Task Breakdown

This document outlines the specific frontend execution plan, organized by build sequence.

## 1. Build Sequence

### Phase A: Architecture & State (Critical Path)
1. **Initialize Project:** Next.js/Vite setup, strict ESLint rules.
2. **Context Provider (`DemoContext`):** Implement global state for tracking `currentIncidentIndex` and the `resetDemo()` function.
3. **Routing Setup:** Configure static paths for `/` and `/incident/[id]`, plus `/live` for Layer 2.

### Phase B: Design System & Primitives (Critical Path)
1. **CSS Variables:** Define typography (Inter/Outfit), stark dark mode background, and glassmorphism tokens.
2. **Typography Components:** Standardize `H1`, `H2`, `Body`, `Microcopy` components.
3. **Buttons & Inputs:** Build the standard ghost button, primary action button, and text area (for live mode).

### Phase C: Core Components (Critical Path)
1. **`IncidentCard`**: Renders the video/GIF and the basic incident description.
2. **`DecisionPanel`**: The binary input interface for the user's initial and final decisions.
3. **`LawViewer`**: The dramatic text display for the FIFA Law Reveal.
4. **`PerspectiveBubble`**: The UI for displaying Granite's 5 divergent personas.

### Phase D: Layouts & Pages (Critical Path)
1. **`Home Layout` (Hook):** Stark landing page with the initial thesis.
2. **`Incident Layout` (Main Loop):** The state machine orchestration (Setup -> Decision 1 -> Perspectives -> Reveal -> Decision 2).

### Phase E: Animations & Polish (Demo-Critical Work)
1. **The Reveal Animation:** Implement the 1.0s delay where law text renders before the "undefined" term illuminates.
2. **Phase Transitions:** Simple CSS fade-ins between the steps in the Incident Layout.

### Phase F: Layer 2 Live Integration (Parallelizable)
1. **`/live` Page:** Build the text input interface.
2. **Loading State:** Implement the pipeline logging animation while waiting for the LangFlow webhook.
3. **Results Parsing:** Map the real-time JSON response into the `PerspectiveBubble` components.

## 2. Work Categorization

### Critical Path (Must Build to Win)
* Phase A, B, C, D.
* Without these, there is no Layer 1 demo.

### Demo-Critical Work (High ROI)
* Phase E (Animations & Polish).
* The Reveal Animation is what sells the intellectual "a-ha" moment to the judges.

### Parallelizable Work (Can be done concurrently)
* Phase F (Layer 2).
* Since Layer 2 does not block Layer 1, a second frontend dev can build the `/live` page and API proxy concurrently while the main loop is built.
