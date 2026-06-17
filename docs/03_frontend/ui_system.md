# UI System & Design Philosophy

**Status:** CANONICAL.
This document translates the project thesis and demo strategy into an actionable UI and design system.

## 1. Visual Design Philosophy
**Stark, Premium, Minimalistic.**
The VAR Room is not a dashboard; it is a legal and philosophical experience. The design must reflect the gravity of a courtroom combined with the intensity of a high-stakes sports review room.
- **Content is King:** UI elements must never compete with the text or the incident video/imagery.
- **Absence over Clutter:** Use negative space to force focus. Remove superfluous details (match clocks, scorelines, player stats, referee names unless specifically relevant).
- **The "Reveal" is the Core:** The visual transition to the Reveal screen must feel dramatic, instantly drawing the eye to the undefined word or deliberate silence.

## 2. Typography
Typography must feel authoritative, legible, and objective.
- **Primary Font:** A grotesque or neo-grotesque sans-serif (e.g., Inter, Helvetica Neue, Roboto, or SF Pro) for clinical neutrality and modern premium feel.
- **Monospace Font (Law/Evidence):** A clear monospace font (e.g., IBM Plex Mono, Fira Code, or Roboto Mono) to represent the "raw data" and exact FIFA Law text, giving it a technical, unimpeachable feel.
- **Hierarchy:**
  - `H1`: Large, stark, high contrast for thesis statements and major incident names.
  - `H2/H3`: Subtle, muted colors to act as signposts without distracting.
  - `Body`: Highly readable, optimized for long-form reading (perspectives and reasoning).

## 3. Spacing System
- **Generous and Intentional:** Use a standard 8px grid system.
- **Macro Spacing:** Massive margins between distinct sections (e.g., 64px, 96px, or even 128px) to give ideas room to breathe and slow the user down.
- **Micro Spacing:** Tight grouping (4px or 8px) for related metadata or button groups to show structural relationship.

## 4. Color System
- **Background:** True Black (`#000000`) or very dark charcoal (`#111111`) to simulate the literal "VAR Room" environment, forcing focus onto the lit elements.
- **Primary Text:** Stark White (`#FFFFFF`) or off-white (`#F3F4F6`) for maximum contrast and readability.
- **Muted Text:** Cool Gray (`#9CA3AF`) for secondary information or guiding prompts.
- **Accent Color:** A vibrant, alarming color (e.g., a toxic yellow `#EAB308` or stark red `#EF4444`) used *exclusively* for the Reveal—highlighting the undefined word or deliberate silence.
- **Perspective Colors:** Subtle, distinct color coding for different persona perspectives (e.g., a slight tint of blue for the referee, a tint of orange for the fan) to aid rapid visual scanning and emphasize divergence.

## 5. Information Hierarchy
1. **The Incident / The Decision:** Front and center. Everything else is secondary.
2. **The Perspectives:** Presented clearly, allowing comparison without feeling like an overwhelming spreadsheet.
3. **The Reveal (FIFA Law text):** Must visually dominate the screen when activated.

## 6. Interaction Philosophy
- **Experience Before Explanation:** Interactions are sequential and irreversible within a cycle. The user must commit to a decision before proceeding.
- **No "Back" Button:** To maintain the narrative flow and emotional weight, users cannot undo their decisions. They must live with their judgment.
- **Linear Progression:** The flow is a single track forward, mirroring the inexorable flow of time in a football match.

## 7. Animation Philosophy
- **Purposeful, Not Decorative:** Animations exist to direct attention, not to show off.
- **Fade Ins:** Use slow fade-ins (300-500ms) for new text to create a sense of unfolding revelation and gravity.
- **The Reveal Impact:** A sharp, immediate highlight animation (e.g., background color swipe, glowing text) when the undefined word is exposed.
- **No Distracting Motions:** Avoid bouncy, playful, or continuous background animations.

## 8. Judge-Facing Design Decisions
- **Instant Reset:** A hidden/unobtrusive "Reset" trigger (e.g., clicking the main logo or pressing a hotkey like `Escape` 3 times) to instantly clear state and return to the start for a seamless restart during judging.
- **Precomputed Feel:** Ensure loading states for Layer 1 are instantaneous. It should feel robust, instant, and bulletproof.

---

## Screen-by-Screen Emotional & Visual Guide

### 1. Home / Hook Screen
- **Emotion:** Curiosity, gravity, re-evaluating expectations.
- **Visual Focus:** The core thesis statement ("Football's biggest controversies aren't about what happened. They're about what a word means.") in large, stark typography.
- **Avoid:** Any mention of "AI", "Analytics", or dashboards. No futuristic tropes.

### 2. Incident Setup Screen
- **Emotion:** Neutrality, focus on physical reality.
- **Visual Focus:** The incident video, GIF, or high-res image.
- **Avoid:** Scorelines, match minutes, player stats, commentator quotes. Pure physical action only.

### 3. Decision 1 Screen
- **Emotion:** Certainty, judgment, bias.
- **Visual Focus:** The decision buttons (e.g., Penalty / No Penalty). Make them large and unavoidable.
- **Avoid:** Leading questions, any hint that it's a trick. Present it as a straightforward call.

### 4. Perspectives Screen
- **Emotion:** Confusion, realization of complexity, intellectual tension.
- **Visual Focus:** The stark contrast between two or three opposing AI-generated arguments.
- **Avoid:** Presenting all 5 perspectives simultaneously in a dense wall of text. Use a clean card stack or side-by-side comparison.

### 5. Reveal Screen
- **Emotion:** Shock, sudden clarity, "a-ha" moment.
- **Visual Focus:** The exact FIFA Law text, styled in monospace, with the undefined word glaringly highlighted in the Accent Color.
- **Avoid:** Any UI elements that distract from the highlighted word. The rest of the screen should dim or disappear.

### 6. Decision 2 Screen
- **Emotion:** Reflection, humility, shifting certainty.
- **Visual Focus:** The juxtaposition of their first choice vs. their new understanding.
- **Avoid:** Making the user feel "wrong"; frame it as the law being broken, not their judgment.

### 7. Climax / Suárez Screen
- **Emotion:** Injustice, emotional weight, the inadequacy of the law.
- **Visual Focus:** The outcome text: "The law defines procedure. Ghana still went home."
- **Avoid:** Complex UI; let the story and the stark text carry the entire weight.

### 8. Live Generation Screen (Layer 2)
- **Emotion:** Awe at the technology, trust in the architecture, validation of Granite.
- **Visual Focus:** The LangFlow pipeline execution steps (real-time feedback) leading to the generated perspectives.
- **Avoid:** Looking like a standard ChatGPT prompt box; it must look like an industrial, structured reasoning pipeline.
