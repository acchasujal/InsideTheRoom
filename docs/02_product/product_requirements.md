# Product Requirements Document: VAR Room

## 1. Product Overview
VAR Room is an interactive, multi-perspective AI experience designed to prove that football's most contested decisions are unresolved because FIFA Law deliberately requires human judgment, not because of missing data. The product serves as a proof-of-concept demonstration of IBM Granite's capabilities in transparent, trustworthy, and explainable AI reasoning for the IBM SkillsBuild June Innovation Challenge.

## 2. Core Principles & Constraints
- **The Thesis Is the Product:** Every feature must serve the core claim that ambiguity is built into the law.
- **Experience Before Explanation:** The user must make a judgment *before* being exposed to the legal context and ambiguity.
- **Zero Live Gen Risk (Main Path):** The primary demo flow must rely on pre-computed, zero-risk AI outputs to prevent demo failure.
- **Structural Necessity:** Granite must perform multi-step synthesis (LangFlow orchestration) that a static lookup table cannot replicate.

## 3. Key Features
### 3.1 The Two-Decision Mechanic
A participatory loop forcing the user to confront their own bias:
1. **Decision 1:** User judges an incident based on video/text.
2. **Perspectives:** Presentation of 5 divergent, Granite-generated perspectives grounded in evidence.
3. **The Reveal:** Exposure of the exact FIFA Law text and the undefined term/deliberate silence.
4. **Decision 2:** User judges again, reflecting on the lack of objective definition.

### 3.2 Dual-Layer AI Architecture
- **Layer 1 (Precomputed Perspective Engine):** Cached, verified AI outputs for the 5 canonical incidents. Ensures demo safety.
- **Layer 2 (Live Perspective Generation):** A live judge-facing tool where users can input a novel incident, and Granite orchestrates the LangFlow pipeline in real-time to generate opposing perspectives.

### 3.3 The LangFlow Pipeline (Layer 2)
1. **Incident Input:** Accepts structured/free-text description.
2. **Law Retrieval:** Retrieves relevant FIFA Law via Docling.
3. **Term Analysis:** Identifies the undefined term.
4. **Perspective Agents (x5):** Distinct agents apply persona framing to reason toward conclusions based on the law.
5. **Divergence Validator:** Ensures at least two perspectives disagree.
6. **Insight Compressor:** Synthesizes a single-sentence summary.

## 4. Out of Scope (Anti-Goals)
*To ensure strict adherence to the locked strategy, the following are strictly prohibited:*
- 3D reconstructions of incidents.
- Match outcome prediction or forecasting.
- Analytics dashboards or psychological quantification.
- Chatbots or Q&A rule-lookup interfaces.
- AI replacing human referees.
