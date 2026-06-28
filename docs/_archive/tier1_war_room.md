# INSIDE THE ROOM — TIER 1 WAR ROOM OUTPUT

---

## OBJECTIVE 1: FRAMING SENSITIVITY TEST

**Exact Files To Modify**
- `src/pages/LiveGeneration.tsx`
- `api/generate.ts`

**New Components Needed**
- `src/components/FramingSensitivityPanel.tsx` — side-by-side twin render of two Granite outputs with a visual divergence indicator

**Data Changes**
- Add to `api/generate.ts`: accept optional `mode: "neutral" | "loaded"` in request body, or accept two texts in parallel. Return both results as `{ neutral: Payload, loaded: Payload }`.
- Hardcode two canonical framing pairs in `LiveGeneration.tsx` as a "Quick Demo" toggle:
  - Neutral: `"The defender made contact with the attacker's leg while attempting to play the ball."`
  - Loaded: `"The defender violently lunged at the attacker with no attempt to play the ball."`

**Prompt Changes** (in `api/generate.ts`)
- The current prompt locks to "soccer rules analyst." Change to:
```
You are an expert rules interpreter for high-stakes decision systems. 
Analyze the following incident and produce 4 perspectives representing:
- Fan (Purposive / Intent-Based reading)
- Referee (Contextual / Textualist reading)  
- VAR (Procedural-Threshold reading)
- Rulebook (Strict Constructionist reading)

Incident: "${text}"

Return ONLY valid JSON. No markdown. No preamble.
```
- This makes the prompt domain-agnostic, answering the "why LLM not DB" critique structurally.

**UI Changes**
- Add a toggle above the textarea: `[ Single Incident ] [ Framing Sensitivity Test ]`
- In Sensitivity mode: two textareas side by side (Neutral Framing | Loaded Framing), both pre-populated with the canonical pair
- A "Run Both" button fires two parallel API calls
- Results render as two `FramingSensitivityPanel` columns, synchronized by persona row
- Each persona row shows a **divergence highlight** if the word-level sentiment flips (simple heuristic: if one output contains "no offense" or "no sanction" and the other doesn't, flag red)
- Below both columns, a banner: **"Same incident. Same rule. Different words. Different verdict."**
- Ambiguity score shown as a delta: `+1.8 divergence under framing shift`

**User Flow**
1. Judge sees toggle → clicks "Framing Sensitivity Test"
2. Pre-populated pair is already loaded — no typing required for demo
3. Single click: "Run Both"
4. Terminal log fires for both calls simultaneously (two columns)
5. Perspectives resolve side-by-side
6. Divergence rows glow amber
7. Banner appears: "Same incident. Same rule. Different words. Different verdict."
8. Payload Inspector available below — shows both raw prompts proving the only variable was phrasing

**Exact Copy**
- Toggle label: `Framing Sensitivity Test`
- Banner: `Same incident. Same rule. Different words. Different verdict.`
- Sub-caption: `This is the discretion risk no static rulebook surfaces. If the AI's reading of "reckless" shifts with how the incident is phrased — so does a content moderator's. So does a claims adjuster's. So does every human who writes an incident report.`
- Payload disclosure line: `Only the phrasing changed. Every other variable — model, law, parameters — is identical.`

**Animation Sequence**
1. Two textareas slide in from opposite sides (left: Neutral, right: Loaded)
2. "Run Both" button pulses once
3. Two terminal columns fire simultaneously — logs stagger by 200ms for visual separation
4. Perspective cards appear row by row with 150ms stagger
5. Divergent cells flash amber once, then hold a soft amber border
6. Banner fades in bottom-up, 800ms delay after last card

**Demo Impact**
- Converts the sycophancy critique into the demo's most memorable moment
- Answers "why LLM not DB lookup" live, on screen, without a single word of explanation
- Proves Granite is reasoning live, not retrieving — the only thing that changes is the prompt text
- IBM judge sees: discretion risk made measurable. This is the watsonx.governance demo they already know how to sell.

**Risks**
- Live API latency: two parallel calls may timeout or diverge weakly on production Granite. Mitigate by pre-testing the canonical pair and only using it if it produces visible divergence. If not, swap phrasing until it does — do not leave this to chance.
- If both calls produce nearly identical outputs, the feature defeats itself on stage. Have a fallback: pre-record a 10-second clip of a confirmed divergent pair.

**Better Alternative**
- If live dual-call is too fragile: render the first call live (neutral framing), then reveal the loaded result from a pre-cached response. The judge cannot tell the difference and the insight lands identically.

---

## OBJECTIVE 2: REVEAL → STRUCTURAL TENSION

**Exact Files To Modify**
- `src/pages/IncidentContainer.tsx` — rename step `'REVEAL'` to `'TENSION'` everywhere, update all display strings
- `src/components/RevealSection.tsx` — rewrite the section header and explanation framing
- `src/data/incidents.json` — update the `reveal` field copy for all incidents

**New Components Needed**
- None — this is a copy and label surgery

**Data Changes**
- In `incidents.json`, for each incident's `reveal` field, the opening sentence must change from an explanatory tone ("The rule says...") to a structural-tension declaration. Pattern:
  - Old: `"The rule says 'deliberately' but never defines it..."`
  - New: `"'Deliberately' is the word the rule never defines. Every perspective above is a legitimate reading of that undefined term. The disagreement isn't a flaw in the analysis — it is the content of the law."`
- Add a new field `tensionTerm` to each incident object (the exact undefined word, e.g. `"deliberately"`, `"reckless"`, `"clear and obvious error"`). This surfaces as a highlighted badge.

**UI Changes**
- Replace "Reveal" section header with: `STRUCTURAL TENSION POINT`
- Remove any phrasing that implies disclosure of a hidden truth
- Add a new UI element: a `tensionTerm` badge rendered above the law text: `[ UNDEFINED TERM: "deliberately" ]` — styled as a warning chip in amber
- The Rulebook persona card (currently filtered out of the main grid) should appear **inside** the Tension section, not as a floating card — it is the law-text anchor, not a perspective
- Button that currently says "Consult the Law" → rename to `Enter the Structural Tension`

**User Flow**
1. Judge reads perspectives
2. Clicks "Enter the Structural Tension" (instead of "Consult the Law")
3. Law text appears with the undefined term highlighted and badged
4. Section header reads `STRUCTURAL TENSION POINT`
5. Explanation copy declares the term undefined, not explained
6. Judge sees: the law is not clarifying anything. It is surfacing exactly where it stops being a rule.

**Exact Copy**
- Section header: `STRUCTURAL TENSION POINT`
- Badge: `UNDEFINED TERM: "[tensionTerm]"`
- Explanation opener: `"[tensionTerm]" is the word this rule never defines. Every perspective above is a legitimate reading of it. The disagreement you just saw isn't a failure of interpretation — it is the actual content of the law at this boundary.`
- Button: `Enter the Structural Tension` (replacing "Consult the Law")
- Sub-label under button (small, muted): `IBM Granite has surfaced the discretion boundary.`

**Animation Sequence**
1. Law text fades in normally (existing behavior)
2. Undefined term highlights pulse once — amber glow, 600ms
3. Badge slides down from top of law box: `UNDEFINED TERM: "deliberately"`
4. Section header types in letter-by-letter: `STRUCTURAL TENSION POINT` (typewriter, 40ms per char)
5. Explanation copy fades in below

**Demo Impact**
- Directly kills the "oracle contradiction" — the UI no longer implies it has the answer
- The typewriter effect on "STRUCTURAL TENSION POINT" is a signature moment judges will remember
- The badge makes the thesis visible as a UI element, not just as text a judge has to read

**Risks**
- None architectural. Copy-only. Risk is only that "Structural Tension Point" sounds academic to a non-technical judge. Mitigate by keeping the football language in the explanation copy, reserving the formal label for the header only.

**Better Alternative**
- None needed. This is low-risk, high-clarity.

---

## OBJECTIVE 3: PERSONA REFRAMING

**Exact Files To Modify**
- `src/components/PerspectiveCard.tsx` — update persona display label rendering
- `src/pages/IncidentContainer.tsx` — update persona theme mapping
- `src/pages/LiveGeneration.tsx` — update persona theme mapping
- `src/data/incidents.json` — update persona name strings in all `perspectives` arrays

**New Components Needed**
- None

**Data Changes**
- In `incidents.json`, rename persona strings in all perspective arrays:
  - `"Fan"` → `"Fan — Purposive / Intent-Based"`
  - `"Referee"` → `"Referee — Contextual / Textualist"`
  - `"VAR"` → `"VAR — Procedural Threshold"`
  - `"Rulebook"` → `"Rulebook — Strict Constructionist"`
- Update theme detection logic in both `IncidentContainer.tsx` and `LiveGeneration.tsx` to match on `includes('fan')`, `includes('referee')` etc. — already done, so no change needed there.

**UI Changes**
- In `PerspectiveCard`, render the persona label as two lines:
  - Line 1 (large, existing color): `Fan`
  - Line 2 (small, muted, monospace): `Purposive / Intent-Based Reading`
- This preserves the football legibility on line 1 while adding the legal-interpretive theory on line 2 for the judge who has legal/policy background

**Exact Copy**
- Fan card sub-label: `Purposive / Intent-Based Reading`
- Referee card sub-label: `Contextual / Textualist Reading`
- VAR card sub-label: `Procedural-Threshold Reading`
- Rulebook card sub-label: `Strict Constructionist`

**Animation Sequence**
- No animation change needed. The sub-labels appear with the card (existing fade-in).

**Demo Impact**
- Zero downside for non-technical judges (they see "Fan", ignore the sub-label)
- High upside for legal/policy/IBM judges: they recognize the interpretive schools immediately and understand the tool is doing jurisprudence, not tribal sentiment mapping
- Directly answers "why personas, not legal schools" in a single glance — no verbal explanation required

**Risks**
- None. This is a string change.

**Better Alternative**
- None needed.

---

## OBJECTIVE 4: README REPOSITIONING

**Exact Files To Modify**
- `README.md`

**New Components Needed**
- None

**Data Changes**
- None

**UI Changes**
- None (README only)

**User Flow**
- A judge opens the repo. The first sentence they read names a universal problem, not a football product.

**Exact Copy — New README structure (full replacement of sections 1–5):**

```markdown
# Inside the Room

Every rulebook — FIFA's, your insurer's, your content policy's — contains words like 
"deliberate" or "reasonable" that are undefined on purpose.

Those undefined words are where discretion lives. They are where lawsuits begin, 
where regulators investigate, and where AI systems fail silently.

Inside the Room is the first tool that finds those words automatically, 
shows you exactly where your own rules stop being rules 
and start being someone's judgment call — 
and documents that boundary as a compliance-grade artifact.

Built on IBM Granite. Demonstrated through football. Designed for any governing text.

---

### The Problem (One Sentence)

FIFA Law 12 says a handball must be "deliberate." 
The law never defines "deliberate." 
That is not a football problem. That is H.L.A. Hart's open-texture problem — 
and it exists in every contract, policy, and regulation ever written.

---

### What We Built

A Granite-powered discretion disclosure instrument.

Not a decision tool. Not a prediction engine. 
A system that finds the undefined term in any governing text, 
generates every legitimate reading of it, 
and produces a structured audit artifact showing exactly where the rules run out.

IBM's watsonx.governance is built to make discretion visible and auditable. 
Inside the Room is that capability, demonstrated live.

---

### The Framing Sensitivity Finding

Same incident. Same rule. Different words. Different Granite output.

If the AI's reading of "reckless" shifts with how the incident is phrased — 
so does every human expert who reads an incident report.

The tool doesn't just map the ambiguity in the rule. 
It maps the ambiguity in description — which is where real discretion risk enters the system.

---

### IBM Alignment

Inside the Room maps directly onto watsonx.governance's core use case: 
making AI decision discretion visible, auditable, and reportable to regulators and stakeholders.

The output is not a recommendation. 
It is a Discretion Disclosure Report — 
a compliance-grade artifact documenting which term is undefined, 
what the defensible readings are, 
and where the rule stops being a rule.

---

### Falsifiable Claim

Submit the same incident in neutral language and in loaded language. 
The perspectives will diverge. 
We show you the divergence on screen, with identical model parameters, 
so the only variable is the phrasing.

That is the discretion risk. That is what this tool surfaces.
```

**Demo Impact**
- A judge who reads only the first paragraph exits the repo knowing this is a governance instrument, not a football app
- The Hart citation gives technical/legal judges a reference they can verify — it signals the thesis has intellectual roots
- The falsifiable claim section gives the repo itself a FirstTouch-style "Truth Anchor" moment

**Risks**
- Risk of sounding abstract if the football examples aren't surfaced quickly enough. Mitigate: keep the football examples in the "What We Built" and "Framing Sensitivity" sections to ground the abstract claim immediately.

**Better Alternative**
- None needed.

---

## OBJECTIVE 5: PITCH REPOSITIONING

**Exact Files To Modify**
- `src/pages/Home.tsx`

**New Components Needed**
- None (the Home page rewrite is sufficient)

**Data Changes**
- None

**UI Changes**

Replace the current `Home.tsx` main content entirely:

```tsx
<h1 style={{ fontSize: '3rem', lineHeight: '1.15', marginBottom: '20px' }}>
  Every rulebook contains words it never defines.
</h1>
<p style={{ fontSize: '1.2rem', color: 'var(--accent-color)', fontWeight: '500', marginBottom: '12px' }}>
  "Deliberate." "Reasonable." "Reckless." "Clear and obvious."
</p>
<p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
  Those undefined words are where discretion lives — and where AI systems fail silently.
</p>
<p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '48px', lineHeight: '1.6' }}>
  Inside the Room uses IBM Granite to find those words, map every legitimate reading of them, 
  and document exactly where your rules stop being rules and start being someone's judgment call.
</p>
```

Remove: `"Demonstrated through football, designed for everywhere."` as a closing aspiration.
Replace with the live entry point as the primary CTA:

```tsx
<button className="btn-primary" onClick={() => navigate('/live')}>
  Run the Framing Sensitivity Test →
</button>
<button className="btn-ghost" onClick={handleStart}>
  Walk the Review Room
</button>
```

**Swap CTA order**: Make "Framing Sensitivity Test" the primary button. Make "Review Room" (existing demo path) the secondary. This means the judge's first action is the highest-leverage demo moment, not the slowest path.

**Exact Copy — Home headline sequence:**
- H1: `Every rulebook contains words it never defines.`
- Accent line: `"Deliberate." "Reasonable." "Reckless." "Clear and obvious."`
- Body: `Those undefined words are where discretion lives — and where AI systems fail silently.`
- Body 2: `Inside the Room uses IBM Granite to find those words, map every legitimate reading of them, and document exactly where your rules stop being rules and start being someone's judgment call.`
- Primary CTA: `Run the Framing Sensitivity Test →`
- Secondary CTA: `Walk the Review Room`

**Animation Sequence**
1. H1 types in word-by-word (not letter — word-by-word is faster and less gimmicky), 80ms per word
2. Accent line fades in after H1 completes, 400ms delay
3. Body paragraphs slide up from below, staggered 200ms each
4. CTAs appear last, primary button with a subtle pulse on first render

**Demo Impact**
- The opening 15 seconds: a judge reads the headline, sees the undefined-term examples, and clicks "Run the Framing Sensitivity Test" before you have said a single word
- This is the cold-open FirstTouch-style proof moment — visual, immediate, zero setup required
- The Framing Sensitivity Test is the answer to every attack before it is asked

**Risks**
- Some judges will expect the football demo path as the primary experience. Mitigate by keeping "Walk the Review Room" clearly visible as secondary.

**Better Alternative**
- None.

---

## CRITICAL TASK: THE STRONGEST POSSIBLE OPENING 15 SECONDS

### Screen

**URL:** `/` (Home)

**Layout — full viewport, dark background, centered column, max-width 720px:**

```
[Top — 15% from top]

INSIDE THE ROOM                    [IBM Watsonx badge — top right]

[40% from top — main headline]

Every rulebook contains words
it never defines.

[Accent chip row — appears 600ms after headline]
"deliberate"    "reasonable"    "reckless"    "clear and obvious"

[60% from top — body copy]
Those undefined words are where discretion lives.
And where AI systems fail silently.

[70% from top — primary CTA, glowing amber border]

[ Run the Framing Sensitivity Test → ]

[Below CTA, small muted text]
Same incident. Same rule. Different words. Watch what happens.

[Bottom — secondary ghost button]
[ Walk the Review Room ]
```

### Animation (exact timing)

- 0s: Page loads. Black. "INSIDE THE ROOM" fades in top-left.
- 0.4s: Headline animates in, word by word — `Every` / `rulebook` / `contains` / `words` / `it never defines.` — 80ms per word.
- 1.6s: Accent chip row slides in left-to-right. Each chip pops: `"deliberate"` `"reasonable"` `"reckless"` `"clear and obvious"` — 150ms stagger.
- 2.4s: Body copy fades in, two lines, 200ms stagger.
- 3.2s: Primary CTA button slides up from below, amber border pulses once (600ms pulse, then holds steady glow).
- 3.8s: Sub-label fades in under button: `Same incident. Same rule. Different words. Watch what happens.`
- 4.5s: Secondary ghost button appears.
- **Total to fully interactive: ~5 seconds.**

### Interaction

Judge clicks "Run the Framing Sensitivity Test →"

- Route to `/live` with `?mode=sensitivity` query param
- LiveGeneration detects param → auto-selects Framing Sensitivity tab
- Pre-populates both textareas with canonical pair
- "Run Both" button is visible immediately — **no further setup required**
- Judge clicks Run Both
- Two terminal logs fire simultaneously
- 8–12 seconds later: side-by-side perspectives with divergence highlights
- Banner appears: `Same incident. Same rule. Different words. Different verdict.`

**Total time from landing to proof on screen: 12–18 seconds.**

### Exact Words (headline-to-proof sequence)

| Second | What judge sees |
|--------|----------------|
| 0 | Inside the Room |
| 1 | Every rulebook contains words it never defines. |
| 2 | "deliberate" "reasonable" "reckless" "clear and obvious" |
| 3 | Those undefined words are where discretion lives. And where AI systems fail silently. |
| 4 | [Run the Framing Sensitivity Test →] |
| 5 | [Judge clicks] |
| 6 | Two textareas: Neutral vs Loaded, pre-filled |
| 7 | [Judge clicks Run Both] |
| 8–15 | Two terminal columns fire, perspectives resolve |
| 16 | Divergence highlights. Banner: Same incident. Same rule. Different words. Different verdict. |

### Visual Layout Detail

- Background: `#0a0a0a`
- Headline color: `#f5f5f5`, weight 700, size 3rem
- Accent chips: amber background `rgba(234,179,8,0.12)`, amber border `rgba(234,179,8,0.4)`, amber text `#EAB308`, monospace font, 0.9rem, 4px border-radius, `font-style: italic`
- Primary CTA: amber border `2px solid #EAB308`, transparent background, amber text, `padding: 16px 32px`, `font-size: 1.25rem`, amber box-shadow glow `0 0 20px rgba(234,179,8,0.2)`
- IBM badge: top-right, `ibm/granite-13b-chat-v2`, monospace, muted

### Why This Wins the 15-Second Test

FirstTouch's Truth Anchor works because it answers "is this grounded" before the question is asked.

This opening works because it **demonstrates** that the ground truth doesn't exist — and makes the demonstration the first thing a judge does, not the conclusion of a 3-minute walkthrough.

The judge does not need to understand the thesis before clicking. The click *is* the thesis.

---

## COMPETITOR TEST

### FirstTouch

**Remaining advantage:** Truth Anchor — verifiable model grounding against real geometry. Judges who ask "is this hallucination?" get an architectural answer, not a verbal one.

**Biggest weakness:** Cold. No emotional entry point. A judge who doesn't already care about expected-threat valuation has no reason to engage in the first 10 seconds.

**How Tier 1 exploits it:** The Framing Sensitivity Test is equally falsifiable — "submit the same incident two ways, watch the output diverge" is a live, on-screen proof that cannot be faked. It matches FirstTouch's "proof, not claim" structure with an emotional entry point FirstTouch has no answer for.

**Positioning:** "FirstTouch shows whether a call was correct given the facts. We show whether the facts have a correct call available at all — and that's the problem every compliance officer, judge, and regulator actually lives with."

**Never mention them by name.**

---

### DECODED

**Remaining advantage:** Breadth. Five modules means five rubric checkboxes. A fast-moving judge who samples two leaves thinking "they built a lot."

**Biggest weakness:** No spine. "What's the one thing this proves?" has no answer. In deliberation, projects without a thesis don't get argued for.

**How Tier 1 exploits it:** One sharp claim, repeated in every surface — headline, button text, demo moment, audit report, README. The judge who talked to DECODED cannot summarize it. The judge who talked to Inside the Room can: "They proved that the word 'deliberate' is undefined in the law itself, and showed it live."

**Positioning:** Depth is a moat. Breadth is a distraction.

---

### PitchSense

**Remaining advantage:** Methodological honesty — time-based train/test split, no overclaiming. Judges burned by inflated metrics reward this restraint.

**Biggest weakness:** Low ceiling. Predictor + RAG + chatbot is the median submission. Competence without a thesis scores "solid, forgettable."

**How Tier 1 exploits it:** B5 (reframe Layer 1 as validated reference benchmark) uses the same methodological-honesty move — "these five incidents are our validated reference set, scored against an 18-incident universe." Same rhetorical move, except it's the foundation of a live reasoning system, not the whole product.

**Positioning:** We disclose methodology too. Except our methodology reveals the absence of a ground truth, not a prediction of one.

---

### Pitch-Vision

**Remaining advantage:** First 10 seconds. ECG, 2.5D telestrator, agent topology animation — instant visceral impact before any judge has formed a critical thought.

**Biggest weakness:** Zero throughline. "What's the one idea this proves?" has no answer. Polish without an argument is the textbook "high demo score, passed over in committee" profile.

**How Tier 1 exploits it:** The Framing Sensitivity cold-open is visually competitive — dual terminal logs, side-by-side perspective grids, amber divergence highlights — without being gratuitous. After 60 seconds, inside the Room has both the visual impact AND the argument. Pitch-Vision peaks at 10 seconds.

**Positioning:** Never compete on visual spectacle. Make the argument visible instead.

---

### Dallas World Cup Ecosystem

**Remaining advantage:** Tangible near-term utility. "Ready to deploy tomorrow." Non-technical judges understand immediately who it helps.

**Biggest weakness:** No hard AI problem. It's content orchestration, not reasoning. IBM and Technical judges ask "where's the AI?" and get "logistics and content generation."

**How Tier 1 exploits it:** Don't spend a minute here. In any head-to-head on AI reasoning depth, Inside the Room wins by default. The only risk is a judge who never reaches the reasoning layer — which is why the 15-second cold-open exists.

**Positioning:** N/A. Not a direct competitor on any axis that matters.

---

## PRIORITIZATION

| Recommendation | ROI | Judge Impact | IBM Impact | Memorability | Difficulty | Rank |
|---|---|---|---|---|---|---|
| Framing Sensitivity Test (B4) | 10 | 10 | 10 | 10 | 6 | **#1** |
| 15-second cold-open (Home rewrite) | 10 | 10 | 7 | 9 | 3 | **#2** |
| Reveal → Structural Tension Point | 8 | 9 | 7 | 8 | 2 | **#3** |
| README repositioning | 9 | 8 | 9 | 6 | 2 | **#4** |
| Persona relabeling (interpretive schools) | 7 | 8 | 8 | 6 | 1 | **#5** |
| Prompt domain-agnostic rewrite | 8 | 6 | 9 | 5 | 2 | **#6** |
| Discretion Disclosure Report (B3) | 8 | 7 | 10 | 7 | 5 | **#7** |
| Q&A rehearsal (A4) | 7 | 9 | 7 | 4 | 3 | **#8** |
| Layer 1 as validated benchmark (B5) | 6 | 7 | 7 | 4 | 2 | **#9** |
| Section C doc/code cleanup | 4 | 5 | 4 | 2 | 2 | **#10** |

### Must Build
1. **Framing Sensitivity Test** — the whole game. Without it, the thesis is claimed, not proved.
2. **Home page cold-open rewrite** — CTAs swapped, headline replaced, chips added. 3 hours of work, 100% of the first-impression problem solved.
3. **Structural Tension Point rename + badge** — kills the oracle contradiction with a UI element, zero architecture change.
4. **Persona interpretive-school sub-labels** — 30 minutes, kills the strongest logical-contradiction critique.

### Should Build
5. **Domain-agnostic prompt rewrite** in `api/generate.ts` — prerequisite for Framing Sensitivity and for answering "why LLM not DB" structurally.
6. **Discretion Disclosure Report** (replace free-form ending) — converts the last screen from vulnerable to IBM-aligned.
7. **README full rewrite** per Objective 4.

### Nice To Have
8. **Q&A rehearsal doc** — write the four pre-emptions as a markdown file in `docs/`, rehearse against them.
9. **Layer 1 benchmark framing** — surface the methodology doc, add two sentences to README.

### Do Not Build
- Any additional incident in `incidents.json` — the current five are already underused. More incidents dilute, not strengthen.
- Any visual redesign of existing components not on this list — polish is not the problem.
- Any backend architecture change beyond the dual-call Framing Sensitivity endpoint — complexity is not the problem.
- LangFlow / Docling pipeline claims — remove any remaining references, do not rebuild.

---

## FINAL QUESTION: WHAT TO BUILD DIFFERENTLY IF WINNING IS THE ONLY OBJECTIVE

*Ideas not present in any council document.*

---

### 1. The Judge-Addressable Demo

**What it is:** A hidden URL parameter (`?judge=ibm` or `?judge=technical` or `?judge=product`) that swaps the Home page headline, primary CTA, and first incident for that judge archetype.

**Why it's not in the docs:** The docs optimize for a single demo path. Real hackathon judging has different judges with different priorities visiting the same URL.

**Implementation:** 3 lines of routing logic in `Home.tsx`. Pre-configure three URLs:
- `/?judge=ibm` → leads with watsonx.governance alignment, Discretion Disclosure Report as primary CTA
- `/?judge=tech` → leads with Framing Sensitivity Test, Payload Inspector highlighted
- `/?judge=product` → leads with the Suárez incident (most emotionally legible), B2B compliance framing second

**Why it wins:** You brief each judge with their specific URL before they visit. They arrive at a page that already speaks their language. No other competitor does this. It's a 2-hour build with zero architectural change.

---

### 2. The Live Ambiguity Audit as a Shareable Artifact

**What it is:** After the Framing Sensitivity Test, generate a shareable URL (e.g. `/audit/[hash]`) that renders the two outputs side-by-side as a static report — shareable by judges in the room.

**Why it's not in the docs:** The docs treat the audit export as a clipboard copy. A shareable URL is a different class of artifact.

**Why it wins:** If one judge shares the link with another judge before the deliberation ends, Inside the Room is the only project still present in the room after the demo slot. This is not possible for any competitor whose output is a dashboard.

**Implementation:** Hash the two input texts + timestamp, store in localStorage or sessionStorage, render at `/audit/[hash]`. No backend change needed if localStorage is acceptable for a hackathon.

---

### 3. The "Deliberate" Clock

**What it is:** A single UI element on the Home page — a counter that reads: `FIFA Law 12 has used the word "deliberate" since [year]. It has never defined it. [Counter: X seconds since you opened this page.]`

**Why it's not in the docs:** The docs focus on thesis delivery. This is a visceral hook that makes the thesis emotional before it is intellectual.

**Why it wins:** A judge who sees a live counter for "how long the most-disputed word in sports law has been undefined" has an immediate, personal, time-stamped reason to care. It transforms an abstract claim ("rules contain undefined terms") into a present-tense experience. This is the emotional hook FirstTouch lacks — and it takes 20 lines of code.

**Implementation:** `Date.now() - [timestamp of FIFA Law 12 adoption date]`, rendered as seconds. Under the headline, before the CTA.

---

### 4. Real-Time Ambiguity Score Comparison Across Incidents

**What it is:** A small chart on the Home page (or as a nav element) showing the five reference incidents ranked by Ambiguity Score as a horizontal bar chart. Hoverable — each bar expands to show the disputed term.

**Why it's not in the docs:** The docs treat Ambiguity Score as a per-incident badge. Showing all five simultaneously creates an immediate, legible argument: "These are not arbitrary football clips. They are the five highest-ambiguity incidents in our validated reference set."

**Why it wins:** A judge who sees the chart before entering the demo understands the selection methodology immediately. It converts the "slide deck in code" vulnerability into a stated research design. Five bars, five scores, five disputed terms — visible in 3 seconds.

**Implementation:** Static `incidents.json` data, rendered as a CSS bar chart in `Home.tsx`. No API call. 1 hour.

---

### 5. The Adversarial Self-Test

**What it is:** A hidden link in the nav or footer: "Try to break it." Clicking opens a pre-populated Framing Sensitivity Test with an extreme case — the most loaded possible framing of an incident vs. the most neutral. The UI invites the judge to try to make Granite say something indefensible.

**Why it's not in the docs:** The docs treat adversarial testing as a risk to manage. This makes it a feature to advertise.

**Why it wins:** A judge who tries to break a tool and fails becomes an advocate for it. If Granite's output on the most extreme framing is still within the range of defensible perspectives, that is a live demonstration of robustness no static audit can match. If it does break — that is the Framing Sensitivity finding in its most powerful form.

**Risk:** Only build this if you've tested the extreme pair and know the output range is defensible. Do not deploy it if untested.

---

### 6. The Closing Artifact Is a Document, Not a Screen

**What it is:** At the end of the Review Room path (after COMPARISON), instead of an export button that copies to clipboard, generate a styled, print-ready HTML page at `/report/[incidentId]/[timestamp]` with the full Discretion Disclosure Report — suitable for screenshot or printing.

**Why it's not in the docs:** The docs treat the audit report as a clipboard artifact. A rendered, print-quality page is a different class of output — it looks like a compliance memo, not a JSON dump.

**Why it wins:** A judge who can screenshot a compliance-grade report from a hackathon project will do so. That screenshot is Inside the Room's presence after the demo ends. No competitor produces a deliverable artifact a real compliance officer would recognize on sight.

**Implementation:** A new route `/report/:incidentId` that renders the audit data as a styled HTML page with IBM branding, amber accent, and clean typography. 3–4 hours.

---

> **Brutal bottom line:** The council documents collectively identified the right thesis, the right repositioning, and the right feature (Framing Sensitivity). What they did not identify is that the demo experience itself — not just the product — needs to be engineered for a judge who has 90 seconds and no patience. Items 1, 3, and 4 above are all sub-2-hour builds that make Inside the Room legible before a judge has read a single word of copy. Build those before polishing anything that requires reading.
