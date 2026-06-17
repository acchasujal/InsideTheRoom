# Milestone Plan

This document outlines the 5 key milestones to deliver the VAR Room demo.

## M1: Foundation
**Objective:** Prove the mechanical loop works with real content.
* **Deliverables:**
  * Project initialized (React/Next.js/Vite).
  * `incidents.json` populated with static content for Perišić, De Jong, Suárez.
  * Basic, unstyled UI components for the main loop.
* **Success Criteria:** A developer can click through the 3 core incidents sequentially from start to finish.
* **Risks:** Data structure of `incidents.json` doesn't match frontend expectations.
* **Fallback Plan:** Hardcode data directly into components to bypass data-loading logic.

## M2: Core Experience
**Objective:** Maximize the emotional impact of the "Reveal."
* **Deliverables:**
  * UI System fully implemented (Typography, Colors, Glassmorphism).
  * The Reveal Animation (1.0s delay -> undefined term illumination).
  * Static media assets (GIFs/Images) integrated and pre-loading.
* **Success Criteria:** The transition from Decision 1 to the Law Reveal feels dramatic, premium, and intellectually satisfying.
* **Risks:** Animations cause performance stutters or break the routing flow.
* **Fallback Plan:** Downgrade to simple CSS fade-ins. Remove complex micro-animations.

## M3: Granite Layer
**Objective:** Prove structural necessity via the Live API layer (Layer 2).
* **Deliverables:**
  * LangFlow pipeline hosted and stable.
  * Backend API proxy deployed.
  * Frontend `/live` route fully integrated.
* **Success Criteria:** A user can input a custom incident and receive 5 Granite-generated perspectives in under 15 seconds.
* **Risks:** watsonx.ai timeout during the live demo; LangFlow webhook instability.
* **Fallback Plan:** Abandon Layer 2. Present the `/live` page as a pure UX mockup and show architecture diagrams during Q&A. Rely 100% on Layer 1.

## M4: Demo Ready
**Objective:** Bulletproof the 3-minute presentation.
* **Deliverables:**
  * Global state reset hotkey implemented.
  * Final content review against FIFA Laws.
  * Successful end-to-end timing runs.
* **Success Criteria:** The presenter can run the Layer 1 demo 5 times consecutively with zero bugs, state-hangs, or network buffering.
* **Risks:** Presenter runs out of time; UI hangs between incidents.
* **Fallback Plan:** Cut the 3rd incident (Suárez) from the live demo flow.

## M5: Submission Ready
**Objective:** Final package for IBM SkillsBuild submission.
* **Deliverables:**
  * GitHub Repository cleaned and documented.
  * Video recording of the demo completed.
  * Judge Defense Playbook memorized by the team.
* **Success Criteria:** All submission gates are cleared and the project is formally submitted.
* **Risks:** Missing a disqualification gate requirement.
* **Fallback Plan:** Audit against `challenge_context.md` 24 hours before the deadline to ensure absolute compliance.
