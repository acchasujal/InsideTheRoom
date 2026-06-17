# 00 — Challenge Context & Strategic Source of Truth

**Project:** VAR Room
**Challenge:** IBM SkillsBuild — June Innovation Challenge (AI Builders Challenge series)
**Status:** Concept locked. This document is the canonical reference. Do not propose new concepts, pivots, or feature sets without explicit instruction to revise this file.
**Purpose of this document:** This is the single source of truth for any future contributor, AI agent, or model working on this project. It exists to prevent re-litigation of decisions already made and to prevent hallucinated context. If a future session does not have access to this file, it does not have accurate context — treat any reasoning that contradicts this document as suspect until reconciled against it.

---

## 1. Challenge Overview

### 1.1 Official Challenge Goal

The IBM June Innovation Challenge asks participants to build an AI solution in the football/World Cup domain that helps fans understand the sport — specifically targeting moments of confusion, controversy, or complexity that broadcasters and existing tools fail to explain. The explicit framing centers on accessibility across knowledge levels and the trust/transparency relationship between fans and the decisions that shape matches.

### 1.2 Explicit Requirements

- Domain: football / soccer, framed around the World Cup
- Must use IBM Granite (via watsonx.ai) as the core reasoning/generation engine
- Must use LangFlow for pipeline/agent orchestration
- Must address fan understanding — explaining *why*, not just *what*
- Fixed build window of approximately 30 days (June cycle)
- Submission requires: public GitHub repository, live demo link, 3-minute presentation video, README

### 1.3 Explicit Negative Signals (Stated Disqualifiers)

- Match outcome prediction or forecasting framed as the core product
- Pure analytics dashboards with no explanatory/reasoning layer
- AI positioned as replacing referees, officials, or coaches
- Black-box systems with no visible reasoning
- Trivia, fantasy-sports, or quiz-style applications

These are not soft preferences. Submissions in this category are confirmed, empirically, in the June field (see Section 5) and represent the lowest-scoring tier observed in this challenge cycle and the prior May cycle.

### 1.4 Technology Requirements

- **IBM Granite** (watsonx.ai) must be doing non-trivial reasoning — multi-step synthesis, not single-call retrieval dressed as reasoning. A Granite call that could be swapped for any other LLM with no change in output quality or behavior is treated by IBM-aligned judges as a failure of the core requirement, even if never stated as a formal rule.
- **LangFlow** must visibly orchestrate distinct steps or agents. A LangFlow instance wrapping a single Granite call is read by technical judges as decorative, not architectural.
- Optional but observed as additive: Docling (for parsing structured documents like FIFA Laws of the Game into RAG knowledge bases), Granite Embedding (for retrieval).

### 1.5 Deliverable Requirements

- Public GitHub repo with a README that leads with value proposition, not installation instructions
- Live, accessible demo (judges will attempt to operate it directly — broken/inaccessible demos are treated as a near-total score gate, see Section 3)
- 3-minute video, uploaded publicly (YouTube or equivalent)
- Team member GitHub usernames

---

## 2. Hidden Requirements (Inferred)

### 2.1 What IBM Actually Wants Showcased

IBM is not running this challenge because of an interest in football specifically. The football/World Cup framing is the accessible global vehicle for a narrower goal: **producing proof-of-concept demonstrations that Granite can power transparent, trustworthy, explainable AI reasoning in a consumer-facing context.** The real subject under evaluation is not "did you build a good football product" but "did you demonstrate something IBM's product and marketing teams would want to use as evidence that Granite does something other models don't."

### 2.2 Why This Theme Was Selected

Football/World Cup 2026 is the single largest global audience IBM can attach an AI demonstration to in this calendar window. Billions of fans, near-universal cultural reach, and a built-in narrative of confusion/controversy (VAR, offside, tactical shifts) that maps naturally onto "AI explains the unexplainable." The theme is a vehicle for a trust-and-transparency narrative IBM is actively building around Granite, not an end in itself.

### 2.3 What Judges Are Likely Seeking

- Evidence that Granite is doing genuine multi-step or multi-perspective reasoning, not retrieval-augmented fact lookup
- A visible, legible reasoning pipeline (LangFlow as a showcased feature, not hidden infrastructure)
- A problem framing that is emotionally resonant to a global, non-expert audience — not an analyst tool mistakenly pointed at fans
- A demo that produces one specific, memorable, quotable artifact — not a feature tour
- Intellectual honesty in how the system frames uncertainty — judges read confident-sounding generated text with skepticism if it isn't grounded in visible evidence

---

## 3. Judge Psychology

### 3.1 Official Judging Criteria (Confirmed, not inferred)

Verified from the published rubric for the AI Builders Challenge series:

1. **Technical Execution** — effective use of IBM and open-source technology; functional, well-structured solution
2. **Innovation** — creativity, originality, unique application of AI
3. **Challenge Fit** — relevance to the stated challenge; ability to address a real-world problem
4. **Implementation & Feasibility** — practicality, scalability, real-world potential

### 3.2 Hidden Criteria (Inferred From Pattern Across Two Challenge Cycles)

Ranked by apparent influence on outcomes:

1. **Demo-readiness functions as a gate, not a score.** A broken, incomplete, or inaccessible live demo at evaluation time appears to override quality in every other category. The most technically and conceptually ambitious entry observed in the May cycle (APEX) had unresolved placeholder links at documentation time and did not place, despite being arguably the most innovative project in that field.
2. **Headline compression — one quotable, specific, memorable artifact** that survives a week of judge memory. Examples observed: a named race scenario with a specific numeric swing (PitStrat-AI); a single quotable sentence (LapGhost: "Senna is dance. Verstappen is physics."); a draggable, physically interactive discovery moment with a specific numeric outcome (DECODED: 2.3cm offside margin).
3. **IBM tool structural necessity.** If Granite's removal would not visibly degrade the product, it reads as a wrapper rather than a genuine integration. This is the implicit version of the "could this be GPT-4 instead" disqualifier.
4. **Scope breadth as a late tie-breaker between two similarly well-executed entries.** Observed directly in the May cycle: a narrower, more rigorously executed entry covering one race lost to a broader entry covering 72 races with comparable rigor, when both were otherwise comparable in quality.

### 3.3 What Survives Memory Decay (One Week Later)

Specific, named, numerical, and personally-experienced artifacts survive. Architecture diagrams, feature lists, and agent counts do not survive. A judge is more likely to remember "I dragged a line and the margin updated to 2.3cm" than "the system uses a five-agent LangFlow pipeline with confidence scoring." Participatory moments — where the judge does something, not just watches something — outperform passive demonstrations of equivalent technical depth.

### 3.4 What Creates Average, Forgettable Entries

- Feature tours without a single specific demo moment
- Explanations that are accurate but generic (no fact a judge could repeat to someone else a week later)
- Five-module products where no single module is memorable on its own (breadth without depth functions as camouflage for incompleteness, not as a strength, unless at least one module lands hard)
- Confident-sounding AI output with no visible evidence trail

---

## 4. Lessons From May Cycle Winners

These are recorded as **principles only.** Their specific implementations (counterfactual race simulators, telemetry clustering, skeletal mesh tracking) belong to those projects and must not be replicated as features.

### 4.1 PitStrat-AI (1st Place)
- **Principle:** A single falsifiable, specific, named claim is more memorable and more engaging than a comprehensive explanation. Judges engage with claims they can mentally argue against.
- **Avoid copying:** The counterfactual-simulator format itself — that is this project's identity.
- **What increased judge scores:** The claim was testable, attached to a real named event, and invited disagreement. Engagement, not passive comprehension, drove recall.

### 4.2 LapGhost (2nd Place)
- **Principle:** Compression is the highest-leverage form of insight. A single sentence that permanently reframes how the user thinks about the subject outperforms a technically rigorous but diffuse explanation.
- **Avoid copying:** The cross-era driver-comparison framing.
- **What increased judge scores:** The compressed sentence produced a feeling of recognition ("I always sensed this but never had the words"). That emotional payoff creates advocates in judge deliberation, independent of underlying technical depth (which, per repo evidence, may have been partially precomputed).

### 4.3 AEROS-XAI (Best Use of Technology)
- **Principle:** A single, clean, attributable number ("performance loss = 48% driver + 32% tire + 15% brake + 5% track") reads as explainability before any architecture is examined.
- **Avoid copying:** Treating polish and visual production value as a substitute for verified live inference — the project's own README disclosed a simulation fallback mode and stated Granite integration was "architecture ready," not necessarily live, and certain biometric inputs were explicitly simulated due to data unavailability.
- **What increased judge scores:** Visual and interaction polish in a category explicitly weighted toward engineering execution rather than ML rigor. This is evidence that judges do not uniformly probe live inference depth in every category.

### 4.4 PITMind AI (Most Innovative)
- **Principle (inferred, evidence-limited):** The Most Innovative award appears to reward conceptual reframing of what AI is doing — in PITMind's case, a dual-mode (fan/engineer) architecture generating radically different output from identical input and the same model, framed explicitly as "AI as translation layer," not as an oracle producing one canonical answer.
- **Avoid copying:** The specific fan-vs-engineer axis — that is this project's identity.
- **Caution:** This project's live demo was inaccessible during external review. The lesson to extract is the inverse: an inaccessible live demo at evaluation time is the single most damaging outcome regardless of underlying concept strength.

---

## 5. Lessons From June Cycle Competitors

### 5.1 DECODED
**Territory owned:** "The World Cup's iconic emotional moments were always made of data — we make that data visible." A revelation narrative; data as final arbiter of what happened and why.
**Strengths:** Physically interactive discovery (manual offside calibrator), a specific memorable numeric artifact (2.3cm), broad five-module scope giving multiple chances to land a moment with any given judge, built by a creator with a demonstrated track record (LapGhost, May 2nd place) who clearly understands this judge panel.
**Weaknesses:** Five modules spreads execution depth thin; the underlying thesis — that sufficient data resolves football's controversies — structurally cannot account for incidents where the deciding factor is legally undefined (e.g., handball "deliberateness," "natural position" in offside). Quantifying psychological states (Crucible Score, composure index) as precise numbers is an evidentiary overreach a sufficiently skeptical judge could challenge.
**Strategic lesson:** Participatory discovery moments are the strongest demo mechanic observed in this challenge series. Steal the principle (let the judge discover, don't tell them), never the specific mechanic (calibrator dragging, skeletal mesh, crucible scoring).

### 5.2 Football Atlas
**Territory owned:** Tactical visualization — "see the tactic, don't just watch the result." Ask a question, watch the pitch respond.
**Strengths:** Scope discipline. One concept executed with confidence. Zero friction between question and visual answer.
**Weaknesses:** No identified signature memorable moment or specific quotable artifact. Pleasant but not surprising — does not appear to generate the kind of recognition that produces judge advocacy a week later.
**Strategic lesson:** Restraint and focus are themselves a competitive signal, but restraint without a strong thesis produces a well-made tool rather than a memorable entry. Restraint must be paired with a position, not used as a substitute for one.

### 5.3 SameWhistle
**Territory owned:** Referee consistency auditing — "was the same whistle blown for both teams?" Reframes fan outrage into an auditable claim about treatment parity across a match.
**Strengths:** Asks a genuinely unoccupied question rather than answering a common question better. Emotionally validating — agrees with fan instinct rather than correcting it, then gives that instinct a structured investigation.
**Weaknesses:** Statistical foundation risk — a single match likely produces a small number of genuinely comparable incidents, making consistency claims vulnerable to a judge asking "is that a large enough sample to conclude anything?" Citation-grounded but methodologically thinner than its framing implies.
**Strategic lesson:** Originality of the *question being asked* outperforms originality of the *answer given* to a common question. The fairness/trust framing is strong and emotionally resonant; the statistical execution is the vulnerability, not the concept.

### 5.4 MatchMind
**Territory owned:** Misconception correction — "your football opinion, evaluated against historical evidence and corrected." Distinct from explanation-of-events; this is correction-of-belief.
**Strengths:** Most conceptually differentiated entry in the June field outside of the project covered by this document — nobody else attempted belief-correction as the core mechanic.
**Weaknesses:** Risk of reading as didactic or condescending to the user if not carefully framed; correction-of-opinion framing can alienate rather than engage if the tone errs toward "you are wrong" rather than "here's what the evidence shows."
**Strategic lesson:** A genuinely uncommon mechanic (correcting belief, not explaining events) is valuable specifically because it does not compete for the same territory as explanation-style products. Confirms that the opportunity space rewards orthogonal framings over incremental improvements on the dominant "explain what happened" pattern.

### 5.5 Cupify Coach
**Territory owned:** Multilingual rules accessibility — grounded RAG over FIFA Laws of the Game, citing sources, answering plain-language questions across languages.
**Strengths:** Genuine groundedness (Docling-parsed official documents, sources always shown) is a real trust mechanism, not just a claimed one.
**Weaknesses:** Falls into the most saturated category observed across both challenge cycles — multilingual FAQ/chatbot-over-rules is a well-populated, low-differentiation pattern. Grounded citation is necessary but not sufficient for memorability; the product has no single demo moment that survives a week of judge memory.
**Strategic lesson:** Groundedness and citation-backed trust are necessary baseline hygiene for any project in this space (this project must also cite FIFA law accurately — see Section 6), but groundedness alone does not differentiate. It is a floor, not a ceiling.

---

## 6. Final Strategic Conclusions

### 6.1 The Locked Strategic Position

**Football's most contested decisions are not unresolved because the data is missing. They are unresolved because FIFA Law deliberately uses undefined terms — "deliberate," "natural position," "clear and obvious error," "serious foul play" — that require human judgment no camera or dataset can replace. This is not a flaw in officiating. It is the law functioning as designed.**

This position is structurally distinct from every competitor in the field:

- DECODED's implicit thesis: data reveals truth.
- SameWhistle's implicit thesis: consistency reveals truth.
- Football Atlas's implicit thesis: visualization reveals truth.
- MatchMind's implicit thesis: evidence corrects false belief.
- **This project's thesis: some football truths are not data-resolvable by design, and proving exactly why is the actual act of explanation.**

No competitor can adopt this position without abandoning their own product's central premise. This is the moat. It is conceptual, not technical, and therefore cannot be copied overnight by adding a feature.

### 6.2 What Wins

- A single signature demo moment that is specific, interactive, and verifiable — modeled on the principle behind DECODED's calibrator (participatory discovery), not its implementation
- Granite producing genuinely contradictory, not merely differently-labeled, outputs across perspectives — this is what makes the IBM tool structurally necessary rather than decorative
- A demo built entirely on pre-computed, cached outputs — zero live generation during judging
- One compressed, quotable sentence that reframes how the viewer thinks about football controversy generally (the LapGhost principle)
- Explicit, accurate FIFA Law citation, verified before any line of demo code is written
- A close framing that positions "the law required judgment" as a feature of good governance and trustworthy AI design — not as a limitation or failure of the AI
- ### Experience Before Explanation

A judge should experience the controversy before being taught about it.

The preferred order is:

Decision
→ Experience
→ Discovery
→ Explanation
→ Reflection

Not:

Explanation
→ Explanation
→ Explanation

Future contributors should prioritize interactive experiences, user participation, and discovery-based learning over additional informational content.

The experience creates memory.

The insight creates meaning.

Both are required.


### 6.3 What Loses

- Treating breadth (module count) as a substitute for one strong, deep, memorable moment
- Five perspectives that rephrase the same conclusion in different voices rather than genuinely contradicting each other
- Any unverified or inaccurate FIFA law citation — this specific project has zero tolerance for this failure mode, since the entire premise rests on legal-textual accuracy
- A live demo with any generation risk (hallucination, format break, latency) during judging
- Framing the conclusion as "AI couldn't determine the answer" rather than "the law was designed to require judgment, and here is the exact mechanism"
- Continued strategic re-analysis or pivoting once the position is locked (this document exists specifically to prevent this failure mode going forward)

### 6.4 What Must Never Be Built

- 3D reconstruction of incidents (Three.js or equivalent). This directly invites visual comparison against DECODED's better-resourced equivalent, with no demonstrated payoff in either challenge cycle's evidence — no May winner attempted true 3D, and the build-time cost is categorically disproportionate to differentiation gained.
- Match outcome prediction in any form, hedged or otherwise. Explicitly disqualified by the brief and independently confirmed as a populated, low-scoring pattern in the June field (three entries already in this category).
- Psychological or pressure quantification (DECODED's territory; also philosophically incompatible with this project's thesis that some things resist quantification).
- A referee-consistency audit module (SameWhistle's territory; also statistically fragile at small sample sizes).
- Any feature whose removal would not weaken the core claim that football law deliberately requires human judgment. If a feature does not serve that claim, it dilutes it.

### 6.5 What Future Contributors Must Understand

1. The concept is locked. The signature mechanism is the undefined-term interaction (FIFA Law text, term highlighted, shown to occur with zero formal definition across the official Laws of the Game). This is the product's entire intellectual core. Do not abstract it away into a vaguer "judgment vs. facts" framing — the specificity of the undefined term IS the proof, not mere supporting evidence for a broader claim.
2. Five incidents should span five distinct categories of legal ambiguity (intent, threshold, judgment, scope, context) — not five examples of the same ambiguity type. This produces a taxonomy the user learns, not a single point repeated five times.
3. The two-decision mechanic (a decision before evidence, a second decision after the contested-clause reveal, with aggregate "changed view" data shown) is the project's primary engagement and learning-demonstration device. It must work end-to-end and must display a real or realistically-modeled aggregate statistic.
4. All five perspectives (Fan, Referee, VAR, Rulebook, Player) must be engineered to genuinely diverge in conclusion, grounded in different cited elements, for at least one incident per ambiguity category. Cosmetic separation (same conclusion, different voice) fails the core thesis and will be read by a technical judge as superficial multi-agent design.
5. Every FIFA Law citation used anywhere in the product or demo must be verified against the actual FIFA Laws of the Game (current edition) before being used. A single incorrect citation is uniquely damaging to this project specifically, because the premise is built on legal-textual precision — more so than for any competitor whose claims rest on data analysis rather than legal text.
6. The competitive reference point is DECODED, not because it must be beaten on its own terms, but because its thesis is the one this project's thesis directly opposes. Do not attempt to out-produce DECODED on visual spectacle, module count, or production polish. Win by making the argument DECODED's own premise prevents it from making.
7. From this point forward, strategic re-analysis should not occur without new evidence (a newly observed competitor, a rule clarification, a build constraint discovered during implementation). Per the revision rule governing this work: do not change the locked conclusion in response to preference, fatigue, or unprompted second-guessing. Build the product described in this document.
