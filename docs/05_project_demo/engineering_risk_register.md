# Engineering & Project Risk Register

**Goal:** Identify fatal flaws before they occur and establish ruthless fallbacks.

## 1. Demo Risks (The Fatal Gate)
**Risk:** The live demo fails during the 3-minute presentation due to API latency or downtime.
**Probability:** High (if relying on live LLM generation for the main flow).
**Impact:** High (Instant Disqualification / Lowest Score).
**Mitigation:** Implement the "Two-Layer" architecture. The primary 3-minute demo path (Layer 1) must run entirely on precomputed, static JSON shipped with the frontend bundle.
**Fallback Plan:** If the Layer 2 (Live Gen) API goes down, skip it entirely during the demo and only show Layer 1, defending it as standard "production caching."

## 2. Technical Risks
**Risk:** Complex state management breaks the sequential narrative flow (e.g., user skips ahead, state doesn't reset).
**Probability:** Medium.
**Impact:** High (Ruins the "Experience Before Explanation" mechanic).
**Mitigation:** Strictly linear routing. No "back" buttons during an incident cycle. Force the user through the defined path.
**Fallback Plan:** Implement a hard refresh mechanism (e.g., clicking a logo) that automatically clears all local state and routes back to the home screen for a clean restart.

## 3. AI Risks
**Risk:** Granite generates perspectives that agree with each other or hallucinate the FIFA Law (Perspective Quality Risk).
**Probability:** High.
**Impact:** High (Destroys the thesis that the law allows for divergent, logical conclusions).
**Mitigation:** For Layer 1, utilize human-in-the-loop verification of the offline-generated JSON. For Layer 2, strictly prompt the agents in LangFlow to adopt extreme adversarial personas (e.g., "You are an angry fan," "You are a pedantic referee").
**Fallback Plan:** If live generation lacks divergence, inject a "Divergence Validator" script that forces regeneration if the sentiment scores of the outputs are too similar.

## 4. UX Risks
**Risk:** UI complexity distracts from the core message (Weak Emotional Impact).
**Probability:** Medium.
**Impact:** High (Judge forgets the thesis).
**Mitigation:** Ruthless minimalism. One piece of information per screen. The Reveal screen should be stark—just the law text and the highlighted undefined word. No dashboards, no analytics charts.
**Fallback Plan:** Strip out all secondary information (player names, minute of the match, scoreline) from the incident screens to focus purely on the action and the text.

## 5. Scope Risks
**Risk:** Time overrun caused by attempting to build 3D visualizers, custom video scrubbers, or a database backend.
**Probability:** High (Hackathon temptation).
**Impact:** Medium (Time wasted, core loop unpolished).
**Mitigation:** Enforce the "Dangerous Overengineering Traps" list from the Implementation Roadmap. Reject any PR that adds a backend database.
**Fallback Plan:** If video assets prove too difficult to source or integrate cleanly, downgrade immediately to high-resolution still images with text descriptions. The thesis is about the words, not the video.

## 6. Judging Risks
**Risk:** Judges object that the app "doesn't actually solve the referee's problem" or predict the correct outcome.
**Probability:** High.
**Impact:** Medium (Points lost for utility).
**Mitigation:** Pre-empt the objection in the demo script and playbook. Lean entirely into the thesis: "AI shouldn't replace judgment where the law demands it. AI should expose where the law is broken."
**Fallback Plan:** Pivot to the transparency angle during Q&A—argue that exposing structural ambiguity is the first required step before a governing body can write better laws.
