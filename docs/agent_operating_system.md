# Agent Operating System (AOS)

Version: 1.0

Purpose:

This document defines how AI models, autonomous agents, coding assistants, reviewers, and contributors should reason about, modify, validate, improve, and maintain this project.

This document exists to:

* reduce hallucinations
* prevent context drift
* prevent strategy drift
* reduce repetitive analysis
* improve implementation quality
* improve demo reliability
* maximize challenge performance
* accelerate development velocity

---

# Mission

The objective is not to build the largest project.

The objective is to maximize:

* judge recall
* emotional impact
* trust
* transparency
* demo reliability
* challenge score

Every decision must support these outcomes.

---

# Frozen Decisions

The following are frozen.

Agents must not revisit them unless explicitly instructed.

## Strategy

* Core thesis is frozen.
* Project concept is frozen.
* Incident selection is frozen.
* Taxonomy is frozen.
* User journey is frozen.
* Demo structure is frozen.

## Forbidden Behaviors

Do not:

* redesign the project
* propose alternative concepts
* re-open competitor analysis
* suggest new core mechanics
* restart ideation
* generate feature bloat

---

# Development Hierarchy

When tradeoffs occur:

Demo Reliability

>

Judge Recall

>

Emotional Impact

>

Trust & Transparency

>

UX Polish

>

Feature Count

>

Technical Complexity

Always choose the higher item.

---

# Review Philosophy

Assume:

* all obvious findings have already been discovered
* all basic recommendations have already been made
* previous reviews have already covered common issues

Do not repeat existing findings.

Search for:

* contradictions
* hidden risks
* hidden strengths
* failure modes
* leverage points

Only report findings that materially affect:

* winning probability
* demo quality
* trust
* reliability
* emotional impact
* judge recall

Ignore everything else.

---

# High Signal Review Rules

Before reporting a finding ask:

1. Is it non-obvious?
2. Is it high impact?
3. Does it change outcomes?
4. Is it actionable?

If not:

Do not report it.

Maximum 5 findings per review.

Prioritize quality over quantity.

---

# Contradiction Detection

Continuously search for contradictions between:

* implementation
* UI
* content
* narration
* demo flow
* documentation
* product behavior

Contradictions are higher priority than feature requests.

---

# Improvement Framework

Improvements must fall into one of:

## P0

Can break:

* demo
* reveal
* trust
* submission

Fix immediately.

## P1

Can reduce:

* judge recall
* emotional impact
* clarity
* perceived quality

Fix before polish.

## P2

Polish only.

Fix after P0 and P1.

---

# Automatic Fix Policy

When a clear P0 issue is found:

Agent should:

1. Identify root cause.
2. Propose fix.
3. Implement fix if authorized.
4. Validate fix.
5. Re-test affected flows.
6. Verify no regression.

Do not stop after identification.

---

# Testing Philosophy

Testing is mandatory.

Never assume a feature works because code compiles.

Always verify:

## Functional

* routing
* navigation
* reveals
* assets
* animations
* state transitions

## Content

* perspective text
* reveal text
* highlight logic
* narration alignment

## Demo

* timing
* pacing
* transitions
* emotional flow

---

# Demo Protection Rules

The demo is the product.

Any issue affecting the demo is critical.

Examples:

* broken reveal
* failed highlight
* missing asset
* placeholder content
* dead transition
* empty state
* loading failure

These take priority over all other work.

---

# Implementation Review Mode

When reviewing code:

Act as:

* senior engineer
* QA lead
* demo judge
* product designer

Do not generate:

* generic best practices
* textbook advice
* architecture essays

Only report:

* P0 issues
* P1 issues
* leverage opportunities

---

# Autonomous Improvement Rules

Agents may proactively:

* fix bugs
* improve reliability
* improve test coverage
* improve accessibility
* improve loading behavior
* improve state handling
* improve resilience

Agents must not proactively:

* redesign UX
* change strategy
* change thesis
* add major features
* modify demo flow

without approval.

---

# Output Format

Default review output:

## Critical Findings

Only findings that materially affect outcomes.

## High-Leverage Improvements

Highest ROI improvements.

## Things To Protect

Elements that should not change.

## Immediate Action Plan

P0
□ item

P1
□ item

P2
□ item

No scores.

No filler.

No repetition.

No generic advice.

---

# Success Metric

A successful contribution:

* improves reliability
* improves emotional impact
* improves trust
* improves demo quality
* improves judge recall

without increasing unnecessary complexity.

If an improvement does not advance one of these outcomes, it should not be made.
