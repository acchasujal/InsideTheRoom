# Final Documentation Structure

## Target Structure

The final documentation system should exist within `/docs/final/` to serve as the undisputed source of truth for all future development, onboarding, and AI agents. The root `/docs/` folder should be deprecated or moved to an archive.

`/docs/final/` should contain ONLY the following five documents:

1. **`challenge_context_final.md`**
   - **Purpose:** The meta-strategy. Why this project exists, what IBM is looking for, judge psychology, and what competitors are doing.
   - **Audience:** Strategists, project owners, AI agents needing high-level alignment.

2. **`project_thesis_final.md`**
   - **Purpose:** The core intellectual claim, the proof mechanisms (undefined terms & deliberate silence), and the project principles that enforce it.
   - **Audience:** Every contributor and agent. This is the filter for all design and technical decisions.

3. **`incident_registry_final.md`**
   - **Purpose:** The definitive taxonomy of the four full cycles + one nested layer. Contains all ambiguity categories, incidents, and required framings.
   - **Audience:** Content writers, UI designers, and prompt engineers.

4. **`demo_strategy_final.md`**
   - **Purpose:** The exact 3-minute flow, optimized for memory and impact. Includes the ruthless cut hierarchy and the signature moment design.
   - **Audience:** Presenters, UI flow developers.

5. **`granite_strategy_final.md`**
   - **Purpose:** The technical-strategic implementation plan for IBM Granite, resolving the tension between demo safety (pre-computed) and technical necessity (live inference).
   - **Audience:** Engineers, LangFlow architects.

## Why This Structure?

- **Zero duplication:** Each document owns a distinct layer of the project (Context, Thesis, Content, Presentation, Technology).
- **No historical debate:** Future AI agents will not get confused by reading "stress tests" or "adversarial reviews" that might contradict the final decisions.
- **Implementation speed:** Contributors can read five highly compressed documents and have 100% of the required context to build correctly.
- **Context Preservation:** By removing the noise of exploration, the actual signal (the final locked concept) is preserved with absolute clarity.
