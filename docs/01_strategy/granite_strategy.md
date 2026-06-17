# Granite Necessity Strategy

**Status:** CANONICAL. This document resolves the tension between demo safety and proving Granite's structural necessity.

---

## 1. The Two-Layer Architecture

To satisfy both Principle 6 (The Demo Is the Product: zero live generation risk) and Principle 9 (Granite Must Be Structurally Necessary), the product operates in two modes:

### Layer 1: Precomputed Perspective Engine (Demo-Safe)
**What it is:** For the five canonical incidents, Granite generates the five perspective analyses during the build phase. These are cached, verified for legal accuracy, and served statically during the judging demo.
**Why it's real AI:** A static table would require humans to hand-write 25 distinct legal arguments. Granite generates them via structured prompts that demand adversarial reasoning based on the retrieved law.

### Layer 2: Live Perspective Generation (Judge-Facing Proof)
**What it is:** An interactive feature where a judge can submit a *new* incident description, and Granite generates the five perspectives in real time.
**Why it exists:** It is the definitive answer to the "couldn't this be a static website?" critique. A static website cannot dynamically process a novel incident, retrieve the law, and produce opposing, logically coherent perspectives on demand.

## 2. Granite's Required Roles

| Role | Why It Is Real & Necessary |
|---|---|
| **Multi-Perspective Reasoning** | Generating genuinely contradictory conclusions from the *same* incident and the *same* law proves cross-frame synthesis. |
| **Adversarial Citation Grounding** | Granite must use the retrieved law and the undefined term to build a logical argument supporting its persona's conclusion. |
| **Insight Compression** | Synthesizing the incident, the law, and the thesis into a single compressed sentence. |
| **Novel Incident Processing** | Accepting free-text input and running the LangFlow pipeline in real time (Layer 2). |

## 3. What Granite Must NEVER Do

- **Single-call fact retrieval:** (e.g., "What does Law 12 say?") This is commodity behavior that judges score as a wrapper.
- **Generate FIFA Law text:** Law text must be verified from canonical sources, never generated.
- **Power a Chatbot:** The product is an experience, not a Q&A tool.
- **Match outcome prediction:** Explicitly disqualified by the challenge brief.

## 4. The LangFlow Pipeline Architecture

A single-node pipeline is read as decorative. The pipeline must contain functionally necessary steps:

1. **Incident Input:** Accepts structured/free-text description.
2. **Law Retrieval (Docling):** Retrieves the relevant FIFA Law.
3. **Term Analysis:** Identifies the undefined term in the law.
4. **Perspective Agents (×5):** Five distinct agents apply persona framing to reason toward conclusions.
5. **Divergence Validator:** Ensures at least two perspectives genuinely disagree (structural safeguard).
6. **Insight Compressor:** Generates the single-sentence summary.

## 5. The Demo Protocol

1. Run the entire 3-minute narrative demo using **Layer 1** (precomputed). Do not mention caching vs. live. Let the divergence speak for itself.
2. **Only if time permits (15-30s remaining) and the narrative lands flawlessly:** Present **Layer 2**. "You saw the verified outputs. But it can do this for any incident."
3. Feed a fallback, pre-tested novel incident. Let the judge watch the pipeline execute.
4. **The "Static Website" Defense:** "The demo content is cached for reliability—like any production AI system. But try giving it an incident it's never seen. A static website can't argue with itself."
