# Implementation Roadmap

**Execution Principle:** "Highest judging score per hour invested." Everything else is cut.

## 1. The Absolute MVP
A purely frontend React/Next.js (or Vite) application serving a hardcoded JSON file. The JSON contains pre-computed Granite perspectives for the three must-land incidents (Perišić, De Jong, Suárez). No backend, no live LangFlow integration. **If we build only this, we can still win.**

## 2. The Demo-Critical Path
1. **Content:** Port `incident_content_registry.md` into a static JSON structure.
2. **AI Gen (Offline):** Run structured prompts through Granite *offline* to generate the perspectives, then copy-paste them into the JSON.
3. **Frontend:** Build the Two-Decision loop UI (Incident Setup → Decision 1 → Perspectives → Reveal → Decision 2).
4. **Integration:** Connect the static JSON to the UI.

## 3. Dangerous Overengineering Traps (DO NOT BUILD)
- **A Backend/Database:** 100% of Layer 1 data must be static JSON. A database introduces latency and demo failure risk with zero judging upside.
- **User Auth/Login:** Wastes time, blocks the judge, zero points.
- **Live Video Streaming/Scrubbers:** Use lightweight MP4s or high-res GIFs on loop. Do not build a custom video player.
- **Perfecting Layer 2 First:** Building the live LangFlow API integration before Layer 1 is flawless is a fatal error. 

---

## 4. The Phased Build Order

### Phase 1 — Demo-Critical Foundation
**Objective:** Prove the mechanical loop works with real content.
**Deliverables:**
- Web project scaffold.
- `incidents.json` containing the exact text for Perišić, De Jong, and Suárez.
- Basic, unstyled UI components for the complete sequence flow.
**Dependencies:** None.
**Success Criteria:** You can click through the 3 core incidents from start to finish.
**Estimated Effort:** 1-2 Days.
**What can be cut:** Video assets (use static placeholder images and text descriptions if needed).

### Phase 2 — Core Experience (UI/UX)
**Objective:** Maximize the emotional impact of the "Reveal."
**Deliverables:**
- Typography and styling system implemented (stark, premium, minimalistic).
- The "Reveal Screen" animation (dramatically highlighting the undefined word).
- Video/image asset integration.
**Dependencies:** Phase 1 complete.
**Success Criteria:** The transition from Decision 1 to the Law Reveal feels dramatic, intellectually satisfying, and premium.
**Estimated Effort:** 2 Days.
**What can be cut:** Complex page-transition animations. Stick to simple fade-ins if behind schedule.

### Phase 3 — Granite Layer (AI Integration)
**Objective:** Implement Layer 2 (Live Perspective Generation) to prove structural necessity and defend against the "static site" critique.
**Deliverables:**
- LangFlow pipeline hosted/deployed.
- API route in the frontend to submit a novel free-text incident to the LangFlow endpoint.
- "Live Mode" custom input screen.
**Dependencies:** Phase 2 complete. LangFlow endpoint stable.
**Success Criteria:** A judge can type a custom incident and receive 5 Granite-generated perspectives in under 15 seconds.
**Estimated Effort:** 2-3 Days.
**What can be cut:** The entire phase. If we run out of time, we ship Layer 1 (precomputed) and present the live pipeline purely as an architectural diagram during Q&A.

### Phase 4 — Polish & Submission
**Objective:** Bulletproof the 3-minute demo.
**Deliverables:**
- State reset hotkey (for lightning-fast demo restarts).
- Final content review verifying exact FIFA Law text.
- Demo script timing runs.
**Dependencies:** Phase 2 complete (Phase 3 optional).
**Success Criteria:** Presenter can run the demo 5 times perfectly with zero bugs or state-hangs.
**Estimated Effort:** 1 Day.
**What can be cut:** The Mbappé incident (Cycle 3) and the VAR Nested layer. 
