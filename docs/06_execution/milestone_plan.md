# Milestone Plan

This document outlines the 5 key milestones to deliver the VAR Room demo.

## Canonical Definitions (added during documentation canonicalization)

These definitions resolve the product-vs-demo ambiguity found across prior planning docs. Every milestone below should be read against these two scopes:

- **Product backbone (5 incidents, all built and navigable):** Perišić, VAR Nested, De Jong, Mbappé, Suárez — stored in `incidents.json`, fully click-through in the app for free exploration and Q&A.
- **Demo backbone (3 beats, frozen, what is actually presented live in the 3-minute window):** Perišić → VAR Nested → Suárez. De Jong and Mbappé are product-only; they are not part of the scripted live walkthrough.
- **Cut hierarchy under time pressure:** Layer 2 (Live Generation / `/live`) is the only cuttable element. The 3-beat demo backbone is not cut under any circumstance, including VAR Nested.

(This block absorbs the MVP/cut-hierarchy content that previously lived in `implementation_roadmap.md`, which is being archived — see `final_documentation_map.md`.)

---

## M1: Foundation
**Objective:** Prove the mechanical loop works with real content.
* **Deliverables:**
  * Project initialized (React/Next.js/Vite).
  * `incidents.json` populated with static content for all 5 incidents (Perišić, VAR Nested, De Jong, Mbappé, Suárez).
  * Basic, unstyled UI components for the main loop.
* **Success Criteria:** A developer can click through all 5 incidents sequentially from start to finish.
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
* **Fallback Plan:** Abandon Layer 2. Present the `/live` page as a pure UX mockup and show architecture diagrams during Q&A. Rely 100% on the demo backbone (Perišić → VAR Nested → Suárez).

## M4: Demo Ready
**Objective:** Bulletproof the 3-minute presentation.
* **Deliverables:**
  * Global state reset hotkey implemented.
  * Final content review against FIFA Laws.
  * Successful end-to-end timing runs of the canonical demo backbone (Perišić → VAR Nested → Suárez).
* **Success Criteria:** The presenter can run the canonical 3-beat demo backbone 5 times consecutively with zero bugs, state-hangs, or network buffering.
* **Risks:** Presenter runs out of time; UI hangs between incidents; the app's navigation does not yet support jumping directly from VAR Nested to Suárez (see `canonical_state_report.md`, Conflict 1 — this is a code dependency, not just a documentation one, and must be resolved before this milestone can be honestly marked complete).
* **Fallback Plan:** If time runs short, cut Layer 2 (Live Generation) entirely from the presentation. The 3-beat backbone (Perišić → VAR Nested → Suárez) is frozen and is never cut. If genuinely desperate, compress the VAR Nested beat to a single spoken sentence rather than a full perspectives/reveal cycle — do not skip it outright, since it carries the project's most distinctive insight.

## M5: Submission Ready
**Objective:** Final package for IBM SkillsBuild submission.
* **Deliverables:**
  * GitHub Repository cleaned and documented.
  * Video recording of the demo completed.
  * Judge Defense Playbook memorized by the team.
* **Success Criteria:** All submission gates are cleared and the project is formally submitted.
* **Risks:** Missing a disqualification gate requirement.
* **Fallback Plan:** Audit against `challenge_context.md` 24 hours before the deadline to ensure absolute compliance.
