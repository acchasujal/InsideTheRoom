# Project Principles

**Source of truth:** [00_challenge_context.md](file:///d:/Projects/InsideTheRoom/docs/00_challenge_context.md)
**Status:** Derived document. These principles are extracted from locked strategic decisions. Do not introduce new principles, modify existing ones, or reinterpret them without explicit instruction to revise the source of truth.

---

## How to Use This Document

Every principle below is derived from a specific strategic decision in `00_challenge_context.md`. Each principle includes its source reference. If a principle appears to conflict with your current task, re-read the source section before proceeding. If the conflict persists, flag it — do not resolve it by reinterpreting the principle.

These principles are ordered by operational priority, not by importance. The first principles constrain the most decisions.

---

## 1. The Thesis Is the Product

> *Source: §6.1, §6.5.1*

The product exists to prove one claim: **football law deliberately uses undefined terms that require human judgment no camera or dataset can replace.**

Every feature, interaction, and design decision must serve this claim. A feature that does not reinforce the thesis dilutes it. There is no neutral — every element either strengthens the core argument or weakens it through distraction.

**Test:** "If I remove this feature, does the thesis become harder to prove?" If no, the feature does not belong.

---

## 2. Experience Before Explanation

> *Source: §6.2 (Experience Before Explanation subsection)*

The user must experience the controversy before being taught about it. The structural sequence is:

```
Decision → Experience → Discovery → Explanation → Reflection
```

Any design that delivers explanation before experience violates the project's core interaction model. The experience creates memory. The insight creates meaning. Both are required, in this order.

**Test:** "Does the user make a judgment before receiving information?" If no, the sequence is broken.

---

## 3. Specificity Is the Proof

> *Source: §6.5.1, §3.2 (headline compression), §3.3*

The undefined term — a specific phrase in a specific FIFA Law article, shown to have no formal definition across the entire Laws of the Game — is the proof mechanism. General statements about subjectivity, judgment, or disagreement are not proofs. They are claims that require proof.

Specificity is also what survives judge memory. Named incidents, exact legal text, precise terms, and concrete numbers survive. Abstractions, feature lists, and architecture descriptions do not.

**Test:** "Can a judge repeat this to a colleague one week later as a specific fact?" If no, it is not specific enough.

---

## 4. Genuine Divergence, Not Cosmetic Separation

> *Source: §6.5.4, §6.3 (bullet 2)*

The five perspectives (Fan, Referee, VAR, Rulebook, Player) must reach genuinely opposing conclusions — at minimum, two perspectives per incident must disagree on the outcome (e.g., "penalty" vs. "no penalty"), each citing different legitimate evidence.

Perspectives that rephrase the same conclusion in different voices fail the thesis. If all five perspectives agree, the incident does not demonstrate that the law requires judgment — it demonstrates consensus, which is the opposite of the project's claim.

**Test:** "Do at least two perspectives reach contradictory judgments with cited support?" If no, the incident fails.

---

## 5. Legal-Textual Accuracy Is Non-Negotiable

> *Source: §6.5.5, §6.3 (bullet 3)*

Every FIFA Law citation must be verified against the current edition of the FIFA Laws of the Game before use — in code, in demos, in documentation, in generated output. No citation may be assumed, paraphrased from memory, or generated without verification.

This project has zero tolerance for citation error. The entire premise rests on legal-textual precision. A single incorrect citation is more damaging to this project than to any competitor, because competitors' claims rest on data analysis, not legal text.

**Test:** "Has this exact citation been verified against the current FIFA Laws of the Game?" If no, it cannot be used.

---

## 6. The Demo Is the Product

> *Source: §3.2 (demo-readiness as gate), §4.4 (PITMind lesson), §6.2 (bullet 3)*

A broken, incomplete, or inaccessible demo at evaluation time overrides quality in every other category. Demo-readiness is a gate, not a score. No amount of conceptual strength, technical depth, or strategic clarity compensates for a demo that does not work.

The demo presented to judges must use pre-computed, cached outputs with zero live generation risk (hallucination, format break, latency). The product may support live generation in other contexts, but the demo must never depend on it.

**Test:** "If the network goes down during judging, does the demo still work perfectly?" If no, the demo is not ready.

---

## 7. One Moment, Not Many Features

> *Source: §3.2 (headline compression), §3.3, §6.2 (bullet 1), §6.3 (bullet 1)*

The product must produce a single signature demo moment that is specific, interactive, and verifiable. This moment is what survives judge memory. Feature breadth without a single strong moment is camouflage for incompleteness.

The signature moment is the undefined-term reveal: the user sees the FIFA Law text, discovers the term has no definition, and understands why the controversy cannot be resolved. Everything else in the product exists to set up and pay off this moment.

**Test:** "If a judge only remembers one thing from this product a week later, will it be this?" If no, the moment is not strong enough.

---

## 8. Participatory Discovery Over Passive Delivery

> *Source: §5.1 (DECODED lesson), §3.3, §6.2*

The user must *do* something, not just *watch* something. Participatory moments — where the user acts, discovers, and feels the consequence of their action — outperform passive demonstrations of equivalent technical depth.

The two-decision mechanic is the primary participatory device: decide, encounter evidence, discover the legal mechanism, decide again, see how others decided. The user's own shifting judgment is the proof.

**Test:** "Is the user an active participant or a passive reader?" If passive, redesign the interaction.

---

## 9. Granite Must Be Structurally Necessary

> *Source: §1.4, §3.2 (bullet 3), §6.2 (bullet 2)*

IBM Granite must do work that would visibly degrade the product if removed. A Granite call that could be swapped for any other LLM with no change in output quality is decorative integration, not genuine use.

The structural necessity comes from multi-perspective, genuinely contradictory reasoning: Granite must produce opposing conclusions from the same evidence, grounded in different cited elements. This is multi-step synthesis, not single-call retrieval.

**Test:** "If I replaced Granite with a static lookup table, would the output be meaningfully different?" If no, Granite is decorative.

---

## 10. Compete on Argument, Not on Production

> *Source: §6.5.6, §6.4*

The competitive reference point is DECODED. Do not attempt to match or exceed DECODED on visual spectacle, module count, 3D reconstruction, or production polish. Win by making the argument DECODED's own premise prevents it from making.

DECODED's thesis: data reveals truth. This project's thesis: some truths are not data-resolvable by design. These are structurally incompatible. The win condition is proving the stronger thesis, not out-producing the competitor.

**Test:** "Am I building this because it strengthens the thesis, or because it looks impressive?" If the latter, stop.

---

## 11. No Strategic Drift Without New Evidence

> *Source: §6.5.7, §6.3 (bullet 6)*

The concept is locked. Strategic re-analysis should not occur without new evidence — a newly observed competitor, a rule clarification, or a build constraint discovered during implementation. Do not change locked conclusions in response to preference, fatigue, or unprompted second-guessing.

This document and its source of truth exist specifically to prevent the failure mode of continuous re-litigation. Build the product described in these documents.

**Test:** "Is this proposed change driven by new evidence or by discomfort with the current plan?" If the latter, the current plan stands.

---

## Principles That Are NOT in This Document (By Design)

The following are deliberately excluded from project principles because they belong in implementation documents, not strategic ones:

- Architecture decisions (tech stack, deployment, infrastructure)
- UI/UX specifications (layout, color, typography, component design)
- Data model or schema decisions
- API design
- Testing strategy
- Performance requirements
- Accessibility standards

These will be addressed in implementation-layer documents. Their absence here is intentional, not an oversight.
