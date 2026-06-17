# Documentation Migration Plan

This document dictates the final disposition of every existing file in the `/docs/` and `/docs/validation/` directories to complete the transition to the canonical `/docs/final/` structure.

---

## The Target State
All new development and AI agent interaction must rely exclusively on the five files in `/docs/final/`:
1. `challenge_context_final.md`
2. `project_thesis_final.md`
3. `incident_registry_final.md`
4. `demo_strategy_final.md`
5. `granite_strategy_final.md`

---

## File Disposition Directives

### Root Directory: `/docs/`

| File | Disposition | Justification |
|:-----|:------------|:--------------|
| `00_challenge_context.md` | **MERGE & DELETE** | Content compressed into `/docs/final/challenge_context_final.md`. The original is too dense for rapid onboarding. |
| `01_project_vision.md` | **MERGE & DELETE** | Core concepts merged into `/docs/final/project_thesis_final.md`. |
| `02_core_thesis.md` | **MERGE & DELETE** | Content merged into `/docs/final/project_thesis_final.md`. |
| `granite_necessity_strategy.md` | **MERGE & DELETE** | Replaced by the tightened `/docs/final/granite_strategy_final.md`. |
| `project_principles.md` | **MERGE & DELETE** | Principles condensed and relocated to `/docs/final/project_thesis_final.md`. |

### Subdirectory: `/docs/validation/`

This entire directory must be **DELETED** or moved to an explicit `/_archive/` directory out of the context path of AI agents.

| File | Disposition | Justification |
|:-----|:------------|:--------------|
| `adversarial_review.md` | **ARCHIVE / DELETE** | Contains historical debate and critiques that have already been resolved. Leaving it active risks an AI attempting to "solve" already adjudicated problems. |
| `category_framework.md` | **MERGE & DELETE** | Category taxonomy merged into `/docs/final/incident_registry_final.md`. |
| `demo_prioritization.md` | **MERGE & DELETE** | Pacing and cuts merged into `/docs/final/demo_strategy_final.md`. |
| `final_incident_registry.md` | **DELETE** | Superseded by the reconciled version; contains explicitly rejected incident framings. |
| `final_thesis_validation.md` | **MERGE & DELETE** | Surviving thesis defenses incorporated into `/docs/final/project_thesis_final.md`. The rest is historical debate. |
| `final_verdict.md` | **ARCHIVE / DELETE** | Project management artifact marking the end of a phase. No ongoing strategic utility. |
| `incident_scoring_matrix.md` | **ARCHIVE / DELETE** | Selection artifact. The decisions are locked; the math used to reach them is no longer relevant. |
| `incident_universe.md` | **ARCHIVE / DELETE** | Contains rejected alternatives. Leaving it active risks an AI trying to implement cut incidents. |
| `memory_test.md` | **ARCHIVE / DELETE** | Analysis artifact used to validate the demo strategy. Replaced by the final decisions. |
| `reconciled_incident_registry.md` | **MERGE & DELETE** | Content compressed and finalized in `/docs/final/incident_registry_final.md`. |
| `replacement_analysis.md` | **ARCHIVE / DELETE** | Historical debate over incident selection. Resolved and obsolete. |
| `scoring_audit.md` | **ARCHIVE / DELETE** | Historical debate artifact. Obsolete. |
| `signature_moment_design.md` | **MERGE & DELETE** | Flow concepts merged into `/docs/final/demo_strategy_final.md`. |
| `thesis_stress_test.md` | **ARCHIVE / DELETE** | Initial attack vectors on the thesis. Adjudicated and obsolete. |

---

## Implementation Instructions

1. Verify that all 5 final documents exist in `/docs/final/` and are populated.
2. Delete `/docs/validation/` entirely (or move to an `_archive` folder if version history is desired).
3. Delete all `.md` files in the root `/docs/` directory, leaving only the `final/` folder (and this migration plan, temporarily).
4. Update the project README to point exclusively to the `/docs/final/` directory for strategic guidance.
