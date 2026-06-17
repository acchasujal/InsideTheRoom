# Granite Integration Design

**Status:** CANONICAL.
**Goal:** Define exactly how IBM Granite is utilized to prove structural necessity without compromising demo safety.

## 1. The Exact Role of Granite

Granite is NOT used as a chatbot, a match outcome predictor, or a simple text summarizer. It is structurally required to perform four tasks a static lookup cannot:
1. **Multi-Perspective Reasoning:** Generating completely contradictory, logically sound arguments from the exact same dataset.
2. **Adversarial Citation Grounding:** Using retrieved FIFA Law to support opposing personas.
3. **Insight Compression:** Synthesizing complex legal arguments into a single memorable sentence.
4. **Novel Incident Processing:** Operating on unforeseen user input in real-time.

## 2. Layer Architecture

* **Precomputed Layer (Layer 1):** Granite was used during the build phase to generate the five canonical incidents. The outputs were verified by humans for strict legal accuracy, locked, and bundled into the static frontend as `incidents.json`.
* **Live Generation Layer (Layer 2):** Granite is connected via a live LangFlow pipeline accessible via the `/live` route for demoing to judges.

### Why Granite is Necessary
A static website cannot dynamically process a novel incident, retrieve the law, and produce opposing, logically coherent perspectives on demand. Granite acts as an adversarial legal reasoning engine, proving the thesis over an infinite domain of unstructured text.

### What is Cached vs Generated
* **Cached:** All outputs for the 5 canonical incidents (Perišić, De Jong, Mbappé, Suárez, and the VAR Layer).
* **Generated:** Any input submitted through the Layer 2 `/live` endpoint.

## 3. The LangFlow Prompt Flow (Layer 2)

1. **Incident Input Node:** Receives the user's free-text scenario.
2. **Law Retrieval Node (Docling):** Performs a semantic search against the official FIFA Laws dataset.
3. **Term Analysis Node (Granite):** Analyzes the incident against the retrieved law to identify the specific undefined term (e.g., "deliberately").
4. **Adversarial Agents Node (Granite × 5 Parallel):**
   * *Fan Agent Prompt:* "You are a biased fan. Using the incident and the retrieved law, argue passionately for the most dramatic outcome."
   * *Referee Agent Prompt:* "You are a pragmatic referee. Argue for the safest game-management outcome."
   * *VAR Agent Prompt:* "You are pedantic VAR. Focus strictly on the letter of the law."
   * *Player Agent Prompt:* "You are the accused player. Defend your intent."
   * *Rulebook Agent Prompt:* "State only the objective facts and the limitations of the text."
5. **Divergence Validator Node (Python Script):** Checks if at least two perspectives reach opposite conclusions. If not, re-prompts the agents to be more extreme.
6. **Insight Compressor Node (Granite):** Outputs the final synthesis reflection sentence.

## 4. Grounding & Citation Strategy

* **Grounding:** Granite must be given a strict system prompt: *"You must base your entire argument on the provided Law Text. Do not invent rules. Acknowledge ambiguity where it exists."*
* **Citation:** Every perspective generated must explicitly quote the law text retrieved by Docling at least once.

## 5. Hallucination Prevention

* **Restricted Domain:** The vector store contains ONLY official IFAB/FIFA rulebooks.
* **System Prompting:** "If the law does not define a term, you must explicitly state 'The law does not define [term]'."
* **No Law Generation:** Granite is explicitly forbidden from generating law text from its training weights. It must only use the context window provided by Docling.

## 6. Demo Fallback Strategy

**What happens if Granite fails during the live demo?**

If the API times out or Watsonx goes down while demonstrating Layer 2, immediately execute **The 'Static Website' Defense**.
* **Script:** *"And this is exactly why we cache the main path for production. The live generation is powerful, but for absolute reliability, the primary system uses verified, precomputed Granite outputs. Let's look at what that looks like in the Suarez incident."*
* **Action:** Pivot seamlessly away from the `/live` route back to `/incident/suarez` and execute the emotional climax on the 100% reliable Layer 1 architecture.
