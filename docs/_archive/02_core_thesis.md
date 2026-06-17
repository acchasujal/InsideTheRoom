# 02 — Core Thesis

**Source of truth:** [00_challenge_context.md](file:///d:/Projects/InsideTheRoom/docs/00_challenge_context.md)
**Status:** Derived document. Do not introduce new strategic positions, features, or concepts here. If this document conflicts with `00_challenge_context.md`, the source of truth prevails.

---

## The Thesis

**Football's most contested decisions are not unresolved because the data is missing. They are unresolved because FIFA Law deliberately uses undefined terms that require human judgment no camera or dataset can replace.**

This is the single claim the entire project exists to prove. Every feature, interaction, and design decision is in service of this thesis. Nothing in the product should contradict it, dilute it, or compete with it for the user's attention.

---

## The Intellectual Core

The undefined-term interaction is the product's intellectual core.

FIFA's Laws of the Game contain terms — "deliberate," "natural position," "clear and obvious error," "serious foul play" — that carry decisive legal weight but receive no formal definition within the Laws themselves. These are not oversights. They are architectural choices in the design of football law, preserving space for human interpretation in situations that resist mechanical resolution.

The project proves this by showing users the exact term, in the exact legal text, and demonstrating that the term has no formal definition across the entire Laws of the Game. This specificity is the proof. The undefined term is not supporting evidence for a broader claim — it *is* the claim, made concrete and verifiable.

---

## What the Thesis Is Not

| Common Misreading | Why It Fails |
|---|---|
| "Football is subjective" | Too vague. Does not identify the *mechanism* that produces subjectivity. Every sports product could claim this. |
| "Referees make mistakes" | Implies the controversy would be resolved with better officiating. The thesis claims the opposite: the controversy is *structurally* irresolvable. |
| "AI can't solve everything" | Frames the thesis as a limitation. The thesis claims this is a *feature* of well-designed law, not a failure of technology. |
| "Judgment vs. facts" | Too abstract. Does not anchor to the specific, verifiable legal mechanism (undefined terms) that produces the judgment requirement. |
| "Reasonable people can disagree" | Describes a *consequence* of the thesis, not the thesis itself. The project proves *why* reasonable people disagree — because the law requires interpretation of undefined terms — not merely *that* they do. |
| "Data can't capture everything" | Implies a data-collection problem. The thesis claims the issue is legal-architectural, not informational. |

---

## The Five Categories of Legal Ambiguity

The project demonstrates its thesis through five incidents, each representing a distinct category of legal ambiguity. This produces a taxonomy the user learns — not a single point repeated five times.

| Category | What Makes It Distinct | Example Undefined Mechanism |
|---|---|---|
| **Intent** | The law requires determining a mental state that no camera can observe. | "Deliberate" handball — did the player intend contact? |
| **Threshold** | The law requires a severity judgment with no defined boundary. | "Serious foul play" vs. "reckless" — where is the line? |
| **Judgment** | The law defers entirely to subjective official assessment with no external standard. | "Clear and obvious error" — obvious to whom, by what measure? |
| **Scope** | The law's defined area of application is itself ambiguous. | "Natural position" in offside — what counts as natural? |
| **Context** | The law's application depends on circumstances the law does not enumerate. | Advantage application — when does context override the whistle? |

Each incident must be a real, identifiable, historically documented event — not a hypothetical. Each must be grounded in specific, verified FIFA Law text.

---

## How the Thesis Is Proved

The thesis is not asserted through text. It is proved through a participatory mechanism:

### The Two-Decision Mechanic

1. **First decision.** The user sees an incident and judges it — penalty or no penalty, red card or yellow, goal or no goal — before receiving any legal or contextual information.

2. **Evidence and perspectives.** The user encounters five perspectives (Fan, Referee, VAR, Rulebook, Player), each grounded in different cited elements, reaching genuinely opposing conclusions. At least two perspectives must reach contradictory judgments with cited evidence supporting both.

3. **The undefined-term reveal.** The user sees the exact FIFA Law text governing the incident, with the undefined term highlighted. The user discovers — through the text itself, not through commentary — that the decisive term has no formal definition.

4. **Second decision.** The user judges the incident again. Their judgment may or may not shift.

5. **Aggregate data.** The user sees how others' judgments shifted (or didn't) after the same reveal.

The purpose of this mechanic is not informational. It is experiential. The user should feel their certainty destabilize. That cognitive event — the moment when confidence gives way to understanding — is the product's signature moment and its primary proof of thesis.

---

## The Thesis as a Decision Filter

For any proposed feature, interaction, or design choice, apply this test:

1. **Does it reinforce the claim that football law deliberately requires human judgment?**
   - If no → it does not belong.

2. **Does it anchor to a specific, verifiable undefined term in FIFA Law?**
   - If no → it risks drifting into abstraction.

3. **Does it prove the thesis through experience rather than assertion?**
   - If no → it violates the project's core design principle.

4. **Could a competitor adopt this feature without abandoning their own premise?**
   - If yes → it does not contribute to differentiation.

All four tests must pass. Features that pass only tests 1–3 but fail test 4 may be necessary infrastructure but should never be positioned as the product's distinctive contribution.

---

## Why This Thesis Wins Competitions

The thesis creates a structural advantage that is conceptual, not technical:

- **It cannot be copied by adding a feature.** A competitor would need to abandon their own product's central premise to adopt it.
- **It makes IBM Granite structurally necessary.** Granite must produce genuinely contradictory outputs across perspectives — not differently-worded agreement. This is the kind of multi-step, multi-perspective reasoning IBM wants showcased.
- **It produces a memorable demo moment.** The undefined-term reveal is specific, surprising, and interactive. It survives a week of judge memory.
- **It aligns with IBM's meta-narrative.** "AI that is honest about the limits of certainty" maps directly onto IBM's trust-and-transparency positioning for Granite.
- **It reframes the close.** The conclusion is not "AI couldn't determine the answer." The conclusion is "the law was designed to require judgment, and here is the exact mechanism." This positions uncertainty as a feature of good governance, not a failure of AI.
