# Scoring Audit — Phase 2B

The scoring matrix in `02_core_thesis`/registry documents has the visual form of rigor — eight dimensions, integer scores, a ranked total — without a shown methodology. There's no stated rater process, no inter-rater check, no explanation of how a "9" was distinguished from an "8." Numeric precision here is mostly a presentation device, not evidence. That doesn't make the scores wrong, but it means the ranking should be read as one strategist's ordered intuition dressed in spreadsheet form, not as an independently verifiable result. The audit below treats it that way.

---

## Inflated scores

**Perišić: Legal Ambiguity 10, Thesis Demo 10.** Both scores assume the category assignment (Intent) is correct. As argued in the adversarial review, the actual contested element — arm position / "unnaturally bigger" — is a threshold question, not an intent question. A 10 on "legal ambiguity" for the category it's been slotted into is partly self-fulfilling: the score validates the categorization rather than testing it.

**VAR Judgment: Thesis Demo 10.** This is the highest "thesis demo" score in the whole matrix, awarded to the incident the matrix itself rates lowest on memorability, visual clarity, and emotional impact. That combination is plausible (an idea can be intellectually pure and experientially flat at the same time) but the score doesn't reflect the genericness risk — that this is restating a known idea in legal theory rather than discovering something football-specific. A "10" implies no vulnerability; there is a real one.

## Biased / motivated scoring

**Suárez (Thesis Demo 9) vs. Zidane (Thesis Demo 7).** Both are Context-category, both are "the law was followed and people still feel wronged" cases. The two-point gap is asserted, not derived — the stated reason ("the controversy about provocation is more about ethics than law") could be applied just as easily to Suárez ("the controversy about an inadequate remedy is more about fairness than law"). This looks like a score assigned to match a conclusion the strategist had already reached (Suárez should win the Context slot) rather than a score that produced the conclusion. That's a normal and forgivable way to think through a decision, but it shouldn't be presented as if eight independent dimensions converged on Suárez by 71-to-69 coincidence.

## Missing dimensions

The matrix has no measure for:

- **Audience football-literacy requirement.** Whether the incident still works for a judge panel that doesn't follow football closely. This matters more than almost anything else in a hackathon context, where judges are frequently technologists, not sports fans.
- **Category-fit purity.** Whether the incident actually belongs to the ambiguity category it's been assigned to, independent of how good a story it is. This is exactly the gap that let the Perišić Intent/Threshold conflation and the Suárez term/gap mismatch go unflagged by the numbers.
- **Explanation overhead.** How much setup is required before the first decision can be made at all. Mbappé and VAR Judgment would score worst here, and this dimension would have predicted the "too much legal explanation" problem before it showed up as a stress-test attack.
- **Novelty decay by sequence position.** Whether the incident's reveal still feels surprising given where it falls in the five-incident sequence. A score computed in isolation can't capture this, but the sequencing document needed it and didn't have it.
- **Genericness risk.** Whether the underlying insight, once stated, sounds like a discovery about football or a restatement of a well-known idea about rules in general. This is the single dimension most responsible for VAR Judgment's and Suárez's actual vulnerability, and it isn't measured anywhere.

## Overvalued / undervalued incidents

**Overvalued:** Perišić, for the halo-effect reason above — once an incident is the frontrunner, adjacent soft-criteria scores tend to round up together (8/9/9/10/10/9/10 is a suspiciously consistent run of near-maximum scores for an incident with a real category-fit problem). VAR Judgment's Thesis Demo score is overvalued for the genericness reason above.

**Undervalued:** Zidane (69) is within noise of Suárez (71) and arguably has higher cross-cultural name recognition than the Ghana handball specifically — "Zidane headbutt" may be one of the most universally recognized single images in the sport's history, more so among non-diehard audiences than the Suárez incident, which leans more on football-insider memory. The two-point gap doesn't reflect that. Robben's "No Era Penal" meme-recognition score is uncertain in the other direction — it's largely Spanish-language internet culture, so for a non-Spanish-speaking judge panel it could be lower than scored on memorability, not higher.

---

## Ranking by judge type

**Technical judge** (cares whether Granite is structurally necessary, not decorative): would weight Judgment and Scope highest, since these require genuinely nested, multi-step contradictory reasoning that's hard to fake with a static lookup table. The cleaner binary-fact incidents (De Jong, Suárez) are easier to suspect of being scripted rather than reasoned. Likely order: VAR Judgment > Mbappé > Perišić > De Jong > Suárez.

**Product judge** (cares about flow, completion risk, single clean moment): would most reward the lowest-friction, fastest-to-payoff incidents. VAR Judgment is penalized hardest here for needing to borrow Perišić's setup — a dependency a product judge reads as fragility. Likely order: Perišić > De Jong > Suárez > Mbappé > VAR Judgment.

**Innovation judge** (cares about conceptual originality): most likely to reward Suárez and VAR Judgment for their meta-structure, but also the judge type most likely to independently spot the genericness problem in both — high variance, since recognizing the underlying jurisprudence point can flip the same incident from "original" to "derivative" in the judge's own head during the demo. Likely order: Suárez > VAR Judgment > Mbappé > Perišić > De Jong, with elevated risk of a negative swing on the top two.

**Casual viewer / generalist:** dominated by visceral, low-setup, high-recognition incidents. Likely order: De Jong > Perišić > Suárez > VAR Judgment ≈ Mbappé (bottom two roughly tied, order uncertain).

## The strategically important finding

The project's actual selection (Perišić, De Jong, Suárez favored; VAR Judgment and Mbappé weakest) matches the **product judge** and **casual viewer** rankings closely, and diverges most sharply from the **technical judge** ranking. That's a meaningful asymmetry: the two incidents the project is least confident in (VAR Judgment, Mbappé) are precisely the two a Granite-focused, AI-infrastructure-minded judge is most likely to value most, because they're the two requiring genuine multi-step contradictory reasoning rather than a clean pre-existing narrative. If the judging panel for this competition skews technical (plausible for an IBM-sponsored AI challenge), the incidents currently treated as the weakest links may be disproportionately important to exactly the audience that decides the outcome.
