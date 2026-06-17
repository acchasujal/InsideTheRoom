# Component Registry

**Status:** CANONICAL. 
This document defines the React/UI components required for the VAR Room to ensure consistency and speed of implementation. 

*Note: This registry outlines the structural contracts. Do NOT generate code.*

---

## 1. Core Structural Components

### 1.1 `Layout`
- **Purpose:** The main shell of the application, managing global styles, fonts, color themes, and the hidden reset mechanism for judges.
- **Props:** `children` (ReactNode).
- **State:** None.
- **Dependencies:** Global CSS, Router.
- **Scope:** Reusable (Global).
- **Priority:** High.

### 1.2 `IncidentContainer`
- **Purpose:** Manages the state, sequencing, and linear progression within a single incident cycle. It ensures the user cannot skip ahead.
- **Props:** `incidentData` (JSON object containing all static data for the incident).
- **State:** 
  - `currentStep` (Setup, Decision1, Perspectives, Reveal, Decision2).
  - `userDecision1` (string | null).
  - `userDecision2` (string | null).
- **Dependencies:** `incidentData` (from `incidents.json`).
- **Scope:** Reusable per incident cycle.
- **Priority:** Critical.

---

## 2. Incident Flow Components

### 2.1 `IncidentCard`
- **Purpose:** Displays the neutral physical reality of the incident before any legal context is provided.
- **Props:** 
  - `title` (string).
  - `mediaUrl` (string).
  - `mediaType` (enum: 'video', 'gif', 'image').
  - `description` (string).
- **State:** None.
- **Dependencies:** Video/Image rendering primitives.
- **Scope:** Reusable.
- **Priority:** High.

### 2.2 `DecisionPanel`
- **Purpose:** Renders the options for the user to make their judgment and locks it in.
- **Props:** 
  - `options` (array of strings).
  - `onSelect` (function).
  - `title` (string - e.g., "What is the correct call?").
- **State:** 
  - `isSelecting` (boolean - for brief visual feedback/delay before progressing to the next step).
- **Dependencies:** None.
- **Scope:** Reusable.
- **Priority:** High.

### 2.3 `PerspectiveCard`
- **Purpose:** Displays a single Granite-generated persona perspective, grounding its argument in evidence.
- **Props:** 
  - `persona` (string - e.g., "Referee", "Fan").
  - `argument` (string).
  - `conclusion` (string).
  - `colorTheme` (enum/string - maps to the design system's subtle tints).
- **State:** None.
- **Dependencies:** None.
- **Scope:** Reusable.
- **Priority:** High.

### 2.4 `PerspectiveCarousel` (or `PerspectiveStack`)
- **Purpose:** Manages the display of multiple `PerspectiveCard` components, focusing on the sharpest divergence without overwhelming the user visually.
- **Props:** 
  - `perspectives` (array of perspective objects).
- **State:** 
  - `currentIndex` (integer).
- **Dependencies:** `PerspectiveCard`.
- **Scope:** Reusable.
- **Priority:** Medium (A simple side-by-side flexbox is acceptable for MVP).

### 2.5 `LawViewer`
- **Purpose:** Renders the exact, canonical FIFA Law text in a monospace, unimpeachable style.
- **Props:** 
  - `lawText` (string).
  - `lawCitation` (string - e.g., "Law 12, Section 3").
- **State:** None.
- **Dependencies:** None.
- **Scope:** Reusable.
- **Priority:** High.

### 2.6 `RevealModal` (or `RevealSection`)
- **Purpose:** The emotional core of the cycle. Dramatically highlights the undefined term or deliberate silence within the `LawViewer`.
- **Props:** 
  - `lawText` (string).
  - `undefinedTerm` (string).
  - `explanation` (string).
  - `isVisible` (boolean).
- **State:** 
  - `hasAnimated` (boolean).
- **Dependencies:** `LawViewer`, Animation Library (e.g., Framer Motion, or CSS transitions).
- **Scope:** Reusable.
- **Priority:** Critical (Must nail the demo impact).

### 2.7 `ReflectionPanel`
- **Purpose:** Forces the user to confront their shifting certainty by comparing Decision 1 with reality.
- **Props:** 
  - `decision1` (string).
  - `decision2` (string).
  - `reflectionPrompt` (string).
- **State:** None.
- **Dependencies:** None.
- **Scope:** Reusable.
- **Priority:** Medium.

---

## 3. Layer 2 (Live Generation) Components

*These components are strictly for the Judge-Facing Layer 2 proof-of-concept and should not delay the Layer 1 MVP.*

### 3.1 `GraniteGenerationPanel`
- **Purpose:** The interface for a judge to input a novel incident and trigger the live LangFlow pipeline.
- **Props:** 
  - `onSubmit` (function).
- **State:** 
  - `inputText` (string).
  - `status` (enum: 'Idle', 'Generating', 'Complete', 'Error').
  - `pipelineLogs` (array of strings - showing "Retrieving Law...", "Agent Analyzing...", etc.).
- **Dependencies:** LangFlow API Client.
- **Scope:** Page-specific (Layer 2).
- **Priority:** Medium (Build only after Layer 1 is flawless).

### 3.2 `EvidenceViewer`
- **Purpose:** Dynamically displays the retrieved law and the live generated perspectives side-by-side.
- **Props:** 
  - `retrievedLaw` (string).
  - `generatedPerspectives` (array of objects).
- **State:** None.
- **Dependencies:** `LawViewer`, `PerspectiveCard`.
- **Scope:** Page-specific (Layer 2).
- **Priority:** Low.
