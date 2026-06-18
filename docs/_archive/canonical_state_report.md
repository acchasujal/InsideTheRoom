# Canonical State Report

## Confirmed Canonical Facts

- **Number of incidents:** 5 — Perišić, VAR Nested, De Jong, Mbappé, Suárez.
- **Product backbone:** all 5 incidents, stored in `incidents.json`, navigable in the app for free exploration.
- **Demo backbone:** 3 beats, fixed order, never reduced — Perišić → VAR Nested → Suárez. De Jong and Mbappé are product-only.
- **Cut hierarchy:** single tier — Layer 2 (Live Generation) is the only cuttable element under time pressure. The 3-beat backbone is never cut.
- **Canonical thesis** (carried forward from `02_core_thesis.md`, not re-audited in this pass): football's most contested decisions are unresolved not because data is missing, but because FIFA Law deliberately uses undefined terms requiring human judgment.
- **Canonical demo strategy doc (target):** `docs/05_project_demo/demo_script.md`, once Section A of `canonical_demo_and_registry.md` is folded into it and `demo_strategy.md` / `user_journey.md` / `narration_script.md` are archived.
- **Canonical incident registry (target):** `docs/02_product/incident_content_registry.md`, once Section B of `canonical_demo_and_registry.md` is folded into it and `docs/01_strategy/incident_registry.md` is archived.
- **Canonical execution documents:** `docs/06_execution/implementation_tasks.md` (corrected) and `docs/06_execution/milestone_plan.md` (corrected), with `backend_task_breakdown.md` and `frontend_task_breakdown.md` slated to merge into the former and `implementation_roadmap.md` slated for archival.

## Remaining Conflicts — Identified Precisely

This canonicalization pass is **not** fully complete. Two categories of conflict remain, and a third is a visibility limitation rather than a conflict:

**1. CRITICAL — Code does not yet implement the canonical demo flow.**
`src/context/DemoContext.tsx`'s `nextIncident()` and `src/pages/IncidentContainer.tsx`'s `handleDecision2()` both advance by incrementing the array index in `incidents.json` (`perisic`(0) → `var_nested`(1) → `dejong`(2) → `mbappe`(3) → `suarez`(4)). As written, completing the VAR Nested incident currently navigates to De Jong, not Suárez. The documentation now correctly states the demo backbone skips De Jong and Mbappé, but the running application cannot yet perform that skip. This is a documentation-to-code conflict, not a documentation-to-documentation one, and fixing it requires an actual code change (e.g., a `demoNextId` field per incident, or a separate ordered array driving a presenter-only "demo mode"). This is the single highest-priority item before the next phase ("Demo flow review") can be considered meaningful — reviewing a demo flow that the code can't yet perform isn't a real review.

**2. MEDIUM — Seven files have not been directly edited because their full content was not available in this conversation.**
`demo_strategy.md`, `user_journey.md`, `narration_script.md`, `demo_script.md`, `incident_registry.md`, `incident_content_registry.md`, and (deferred rather than patched) `implementation_roadmap.md`. Canonical replacement content for the first six is provided in `canonical_demo_and_registry.md`; it has not been verified against each file's actual current full text. Recommend a final repo-wide search for the literal strings `"3 core incidents"`, `"De Jong"` (in any demo-timing context), and `"cut Suárez"` / `"cut the 3rd incident"` to confirm no further stale references survive outside what the audit already found.

**3. LOW — The four foundational strategy docs (`00_challenge_context.md`, `01_project_vision.md`, `02_core_thesis.md`, `project_principles.md`) were not part of this audit's scope.** No drift is known in them, but "not flagged" should not be read as "independently re-verified" in this pass.

## Verdict

**Documentation Canonicalization is NOT yet complete.** It is complete for the four files I had full content for (`milestone_plan.md`, `implementation_tasks.md`, `backend_task_breakdown.md`, and the confirmed-clean `frontend_task_breakdown.md`), and the canonical replacement content for the remaining six files has been drafted and is ready to merge. But Conflict 1 is a real, functional gap — not a documentation nicety — and declaring this "complete" while the app still cannot perform the documented demo flow would be the kind of false confidence this audit exists to prevent. Recommend treating Conflict 1 as the actual first item in the "Manual UI review / Demo flow review" phase that follows this one, ahead of polish or Granite integration work, since neither of those matters if the navigation underneath them doesn't match what's now written down as canonical.
