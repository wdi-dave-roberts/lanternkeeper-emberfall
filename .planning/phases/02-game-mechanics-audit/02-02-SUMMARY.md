---
phase: 02-game-mechanics-audit
plan: "02"
subsystem: docs
tags: [mechanics, audit, game-design, documentation]
dependency_graph:
  requires: []
  provides: [mechanics-audit-doc, nav-entry]
  affects: [docs-site]
tech_stack:
  added: []
  patterns: [mkdocs-admonitions, traffic-light-ratings]
key_files:
  created:
    - docs/game-design/mechanics-audit.md
  modified:
    - mkdocs.yml
decisions:
  - "Traffic-light admonitions used for pillar ratings (success/warning/danger)"
  - "Emotion-gating bias and missing alright region documented as separate findings per D-05/D-06"
  - "calculateStreak() labeled as design pillar violation, flagged for removal in Phase 3"
  - "Fog persistence options (reset/persist/hybrid) presented with pillar impact table; decision deferred to Allie"
  - "Quest pool exhaustion documented with Strong Recommendation to fix truncated 3-quest home screen pool"
metrics:
  duration: "~3 minutes"
  completed: "2026-04-12"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 02 Plan 02: Mechanics Audit Document Summary

Human-readable mechanics audit covering all 8 game mechanics with traffic-light pillar ratings, inline remediation, strength indicators, and 3rd party references — published to the MkDocs docs site under Game Design.

## What Was Built

Created `docs/game-design/mechanics-audit.md` — a complete audit of every game mechanic in the Lanternkeeper: Emberfall prototype, written for both Dave and Allie to share understanding of what the prototype does and where it diverges from the design pillars.

Added the page to `mkdocs.yml` nav under Game Design > Mechanics Audit.

## Mechanics Covered

| Mechanic | Understood | Inspired | Less Pressured | Priority |
|----------|-----------|----------|----------------|----------|
| Region Unlock System | Red | Yellow | Yellow | High — emotion-gating bias |
| Emotion Selection UX | Yellow | Green | Green | Low — make order intentional |
| Quest Tone Parity | Green | Green | Green | No action needed |
| Quest Pool Exhaustion | Yellow | Green | Green | High — fix truncated pool |
| Fog / Leaf Clearing | Green | Yellow | Green | Allie decides persistence mode |
| Visit Tracking | Green | Green | Yellow | Low — consider hiding day count |
| Feedback Lines | Green | Green | Green | No action needed |
| Streak Function | Green | Green | Red | High — remove in Phase 3 |

## Key Findings

**1. Emotion-Gating Bias (Red — Understood):** Three emotion-gated regions reward stuck, frustrated, and inspired — but not alright. The healthiest emotional state has no world space and no unlock pathway. Three redesign options presented; decision deferred to Allie.

**2. Missing "Alright" Region (separate from gating bias):** Not just a mechanics problem — a content and narrative gap. What would a world space for "I'm okay today" look like? Documented as For Discussion with Allie as creative director.

**3. Truncated Quest Pool (Strong Recommendation):** The home screen uses a local 3-quest copy per emotion instead of the canonical 40-quest dataset. This appears unintentional. Switching to the canonical pool is a direct improvement with no tradeoffs — Phase 4 code change.

**4. calculateStreak() (Red — Less Pressured):** The function exists at `lib/storage.ts:145`, is never called in production, and is a direct design pillar violation. Removal scheduled as STOR-03 in Phase 3.

**5. Fog Persistence Decision (deferred to Allie):** Three modes documented — reset (current), persist, hybrid — with pillar impact comparison table. All three modes will be config-switchable (`src/config/game.ts`) so Allie can test on device before committing.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write mechanics audit document | 1b872fd | docs/game-design/mechanics-audit.md (created, 399 lines) |
| 2 | Add mechanics audit to docs site navigation | c88644f | mkdocs.yml (1 line added) |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. This plan creates documentation only. No data sources, no UI components, no stubs.

## Threat Flags

None. Documentation and YAML config changes only. No trust boundaries, no security-relevant surface introduced.

## Self-Check: PASSED

- `docs/game-design/mechanics-audit.md` — FOUND
- `mkdocs.yml` nav entry — FOUND
- Commit 1b872fd — verified
- Commit c88644f — verified
- mkdocs build passes without errors
