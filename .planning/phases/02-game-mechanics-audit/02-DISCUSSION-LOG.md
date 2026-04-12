# Phase 2: Game Mechanics Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 02-game-mechanics-audit
**Areas discussed:** Audit document format, Region unlock redesign, Config extraction scope, Fog/leaf persistence

---

## Audit Document Format

| Option | Description | Selected |
|--------|-------------|----------|
| Docs site page | New page under Game Design on MkDocs site. Versioned, browser-accessible | ✓ |
| Standalone markdown in repo | File in docs/ but not wired into nav | |
| Planning artifact only | Lives in .planning/ as phase output | |

**User's choice:** Docs site page
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| By mechanic | One section per mechanic. Each covers: what it does, parameters, risks, remediation | ✓ |
| By risk level | Critical / Warning / Safe grouping | |
| By design pillar | Under Understood / Inspired / Less Pressured | |

**User's choice:** By mechanic
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Traffic light | Green/Yellow/Red per pillar. Simple, scannable | ✓ |
| Narrative only | Written prose per pillar | |
| Scorecard table | Numeric 1-5 scores per pillar | |

**User's choice:** Traffic light
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Inline per mechanic | Each mechanic section ends with remediation subsection | ✓ (with additions) |
| Separate appendix | All remediation collected at end | |
| You decide | Claude picks format | |

**User's choice:** Inline — with strength indicator, justification, and 3rd party source references
**Notes:** User expanded beyond the options: remediation should include how strong the recommendation is, why it's recommended, and external references for learning more

---

## Region Unlock Redesign

| Option | Description | Selected |
|--------|-------------|----------|
| Flag and defer to Allie | Document bias, present 2-3 options with tradeoffs, let Allie decide | ✓ |
| Recommend emotion-neutral | Remove emotion-specific gates, all visit-count-based | |
| Recommend equal contribution | Every emotion contributes equally to all unlocks | |
| Recommend themed but equal | Keep themes, add alright region, same threshold | |

**User's choice:** Flag and defer to Allie
**Notes:** Region unlock redesign is Allie's creative territory

---

| Option | Description | Selected |
|--------|-------------|----------|
| Separate finding | Missing alright region gets its own section and pillar ratings | ✓ |
| Fold into emotion-gating | Treat as symptom of same root issue | |

**User's choice:** Separate findings — after requesting explanation of the difference
**Notes:** User asked for clarification. Two distinct issues explained: (1) mechanics bias in unlock conditions (code fix), (2) content gap where alright has no world space (creative decision). User agreed they're separate after seeing the distinction.

---

## Config Extraction Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Gameplay thresholds only | Unlock thresholds, fog/leaf counts, gesture radius to config | |
| Gameplay + animation timing | Also include animation durations | |
| Everything tunable | All hardcoded numbers in one place | |
| You decide | Claude determines boundary | |

**User's choice:** Other — major expansion of scope
**Notes:** User identified this as a "major issue" requiring a multi-step approach: (1) determine how tunables are managed, (2) extract all magic numbers, (3) analysis with interaction documentation and balancing tools, (4) exploration of missing tunables, (5) enforcement against new magic numbers. Significantly broader than MECH-07's original scope.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 2 audits, later phases build | Audit produces inventory and architecture recommendation | |
| Phase 2 includes extraction | Audit AND extract all magic numbers to config | ✓ |
| Split: audit + minimal extraction | Audit plus just gameplay thresholds | |

**User's choice:** Phase 2 includes extraction
**Notes:** User views extraction as a maintainability refactor with zero gameplay impact — "adjust the codebase to a more maintainable form." Values stay identical, they just centralize. This reframes Phase 2 from "audit only, no code" to "audit + structural refactor."

---

## Fog/Leaf Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Reset each visit | Fog returns fresh every time. Ritual feel | |
| Persist across visits | Cleared fog stays cleared. Progress meter feel | |
| Hybrid — partial reset | Some fog returns but less. Softer accumulation | |
| Flag for Allie to decide | Document tradeoffs, Allie decides | ✓ |

**User's choice:** Flag for Allie to decide
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| All options with tradeoffs | Present reset, persist, hybrid with full pillar ratings | ✓ |
| Recommend reset, note alternatives | Lead with reset as recommended default | |

**User's choice:** All options with tradeoffs
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Config parameter | fogPersistence mode toggle in config. Build all three modes | ✓ |
| Design decision only | Allie picks one, build only that | |
| You decide | Claude determines if config param warranted | |

**User's choice:** Config parameter — after requesting further explanation
**Notes:** User asked for explanation of the difference. Key insight: feel-driven decisions benefit from hands-on experimentation on a real device rather than committing from description alone. Config toggle lets Allie switch modes and live with each one.

---

## Claude's Discretion

- Specific mechanic sections and ordering in audit document
- Internal structure of src/config/game.ts (grouping, naming, docs format)
- Which 3rd party references are most relevant per remediation

## Deferred Ideas

- Lint rule / CI enforcement for magic numbers (Phase 3-4)
- Balancing/experimentation tooling (future milestone)
- Config hot-reload (not needed now)
