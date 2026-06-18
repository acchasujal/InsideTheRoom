# Final Documentation Map

For every file touched by the audit, plus the files in this conversation's scope. Status reflects the end state this canonicalization pass is driving toward — some MERGE/ARCHIVE actions are recommended next steps rather than already-completed file operations, since I can only directly rewrite files whose full content I had in this conversation (noted below).

| File | Status | Reasoning | Action taken in this pass |
|:---|:---|:---|:---|
| `docs/06_execution/milestone_plan.md` | **KEEP** (canonical, high-level timeline) | Per audit Task 4. Receives the migrated MVP/cut-hierarchy content from `implementation_roadmap.md`. | Fully rewritten — corrected file provided. |
| `docs/06_execution/implementation_tasks.md` | **KEEP** (canonical execution doc) | Per audit Task 4. Target for the eventual backend/frontend breakdown merge. | Fully rewritten — corrected file provided. |
| `docs/06_execution/backend_task_breakdown.md` | **MERGE** → into `implementation_tasks.md` | Per audit Task 4. Reduces source-of-truth count for execution docs. | Critical content fixed (5 incidents, not 3). Merge into `implementation_tasks.md` not yet performed — flagged as open in `canonical_state_report.md`. |
| `docs/06_execution/frontend_task_breakdown.md` | **MERGE** → into `implementation_tasks.md` | Same reasoning as above. | Checked for staleness — no incident-count drift found, no content fix needed. Merge not yet performed. |
| `docs/05_project_demo/implementation_roadmap.md` | **ARCHIVE** | Per audit Task 4 — explicitly called redundant and the source of conflicting demo sequences. Its still-needed content (MVP definition, cut hierarchy) has been migrated into `milestone_plan.md`'s new "Canonical Definitions" section. | Content migrated. Recommend archiving the file itself now rather than patching it in place — patching a file scheduled for deletion is wasted effort. |
| `docs/01_strategy/demo_strategy.md` | **MERGE** → into `docs/05_project_demo/demo_script.md` | Per audit Task 4. | Could not patch directly (full content not available to me). Canonical replacement content for its §3/§4 provided in `canonical_demo_and_registry.md`, Section A — fold into `demo_script.md`, then archive this file. |
| `docs/02_product/user_journey.md` | **MERGE** → into `docs/05_project_demo/demo_script.md` | Per audit Task 4. | Same as above — Section A of `canonical_demo_and_registry.md` covers the corrected Stage 2 flow. |
| `docs/05_project_demo/narration_script.md` | **MERGE** → into `docs/05_project_demo/demo_script.md` | Per audit Task 4. | Same as above. |
| `docs/05_project_demo/demo_script.md` | **KEEP** (canonical demo narrative, receives the three merges above) | Per audit Task 4. | Not directly edited (full content not available to me) — fold in Section A of `canonical_demo_and_registry.md` as its new §3/§4 equivalent. |
| `docs/01_strategy/incident_registry.md` | **MERGE** → into `docs/02_product/incident_content_registry.md` | Per audit Task 4 — content registry is more comprehensive and already matches `incidents.json`. | Corrected sequencing framing (product order vs. demo order) provided in `canonical_demo_and_registry.md`, Section B. Incident *content* untouched, per the audit's explicit instruction not to change incident content. |
| `docs/02_product/incident_content_registry.md` | **KEEP** (canonical incident registry, receives the merge above) | Per audit Task 4. Already aligned with `incidents.json` per the audit's own Task 3 finding. | Not directly edited (full content not available to me) — fold in Section B of `canonical_demo_and_registry.md`. |
| `src/data/incidents.json` | **KEEP, no change** | Already correct per audit Task 3 — matches `incident_content_registry.md`, no drift found in the data itself. | None needed. |
| `docs/00_challenge_context.md`, `01_project_vision.md`, `02_core_thesis.md`, `project_principles.md` | **KEEP, out of scope for this pass** | These are foundational strategy docs from earlier in the project; the audit did not flag drift in them, and they were not re-examined as part of this canonicalization. | None — flagging only that "no issues found" here means "not in this audit's scope," not "independently re-verified." |

### What "Files modified" and "Exact changes applied" means for this pass

**Fully rewritten (complete corrected files provided):** `milestone_plan.md`, `implementation_tasks.md`, `backend_task_breakdown.md`.

**Exact changes:**
- `milestone_plan.md`: added a "Canonical Definitions" block; M1 deliverables/success-criteria changed from "3 core incidents (Perišić, De Jong, Suárez)" to "all 5 incidents"; M4 risks/fallback rewritten to remove "cut Suárez" and replace with "cut Layer 2 only, VAR Nested and Suárez are frozen."
- `implementation_tasks.md`: TASK-CON-01 acceptance criteria changed from 3 named incidents to 5; TASK-FE-02 acceptance criteria expanded to require both full 5-incident click-through *and* a direct demo-mode jump from VAR Nested to Suárez, flagged as currently unmet.
- `backend_task_breakdown.md`: Phase A item 2 changed from "3 core incidents" to "all 5 incidents."

**New canonical content provided (not a patch to an unseen file, but ready-to-merge replacement material):** `canonical_demo_and_registry.md`, covering the corrected 3-minute demo flow and the dual product/demo sequencing.

**Not modified, recommend archiving without further patching:** `implementation_roadmap.md` (content migrated elsewhere; patching it further is wasted effort given its scheduled deletion).

**Not modified, full content unavailable to me:** `demo_strategy.md`, `user_journey.md`, `narration_script.md`, `demo_script.md`, `incident_registry.md`, `incident_content_registry.md`. Recommend applying the content in `canonical_demo_and_registry.md` to these during the merge step, ideally by whichever agent has direct repo access.
