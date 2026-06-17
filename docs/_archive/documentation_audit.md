# Documentation Audit

## Overview
This audit examines all existing documentation in the `/docs/` and `/docs/validation/` directories to determine canonical status, identify redundancies, and highlight historical context that could confuse future AI agents or developers.

## 1. Canonical Source Documents (To Be Merged)
These documents represent the final, locked decisions. Their core insights will be merged into the five final canonical documents.
- `00_challenge_context.md` (Source of Truth for challenge context)
- `01_project_vision.md` (Source of Truth for vision/moat)
- `02_core_thesis.md` (Source of Truth for the core thesis)
- `granite_necessity_strategy.md` (Source of Truth for Granite implementation)
- `project_principles.md` (Canonical principles)
- `validation/final_thesis_validation.md` (Final defenses of the thesis)
- `validation/reconciled_incident_registry.md` (Final incident taxonomy)
- `validation/category_framework.md` (Final ambiguity categories)
- `validation/demo_prioritization.md` (Final demo pacing and cuts)

## 2. Documents to Archive / Delete (Obsolete/Superseded)
These documents contain historical debate, rejected alternatives, and intermediate steps. Leaving these active will cause hallucination and context drift in future AI agents.
- `validation/adversarial_review.md` (Historical debate; superseded by reconciled registry)
- `validation/final_incident_registry.md` (Superseded by `reconciled_incident_registry.md`)
- `validation/final_verdict.md` (Historical project milestone summary)
- `validation/incident_scoring_matrix.md` (Analysis artifact used to select incidents)
- `validation/incident_universe.md` (Raw list of incidents, contains rejected alternatives)
- `validation/memory_test.md` (Analysis artifact)
- `validation/replacement_analysis.md` (Historical debate about replacing incidents)
- `validation/scoring_audit.md` (Analysis artifact)
- `validation/signature_moment_design.md` (Merged into demo prioritization / incident registry)
- `validation/thesis_stress_test.md` (Historical debate; superseded by `final_thesis_validation.md`)

## 3. Duplicate Information & Contradictions
- **Incident List Contradictions:** `final_incident_registry.md` contains the original Phase 2A selections and conflicts directly with `reconciled_incident_registry.md` (e.g., treating Perišić as pure intent vs. intent/threshold blend, and treating Suárez as undefined term vs. deliberate silence).
- **Demo Flow Contradictions:** `signature_moment_design.md` suggests a pacing that `demo_prioritization.md` explicitly overrides due to time constraints (nesting VAR, heavily compressing Mbappé).
- **Thesis Duplication:** The core thesis is repeated in `00_challenge_context.md`, `01_project_vision.md`, `02_core_thesis.md`, and `final_thesis_validation.md`. This needs to be consolidated into a single `project_thesis_final.md`.

## 4. Risks for Future AI Agents
If the `/docs/validation/` folder is left intact, an AI agent performing RAG or reading context might:
1. Resurrect the "VAR Judgment is a standalone incident" approach.
2. Treat Suárez as an "undefined term" case rather than "deliberate silence".
3. Confuse the final 3-minute demo pacing with the original 5-cycle conceptual design.
4. Attempt to implement features rejected in the final verdict.

**Recommendation:** Archive or delete all non-final files, and consolidate the canonical knowledge into the five proposed final documents.
