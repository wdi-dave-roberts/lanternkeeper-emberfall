# Phase 2: Game Mechanics Audit - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce a human-readable audit of every game mechanic and parameter, surface unintended pressure signals, extract all magic numbers to a centralized config layer, and build shared understanding between Dave and Allie. This phase includes code changes (config extraction) but does not alter gameplay behavior — values move from scattered literals to `src/config/game.ts` with identical behavior.

</domain>

<decisions>
## Implementation Decisions

### Audit Document Format
- **D-01:** Audit lives on the docs site as a new page under Game Design (MkDocs, versioned, accessible to Allie in browser)
- **D-02:** Organized by mechanic — one section per mechanic (region unlocks, emotion selection, quest system, fog/leaves, visit tracking, etc.). Each section covers: what it does, parameters, pillar impact, risks, remediation
- **D-03:** Pillar impact uses traffic light rating per pillar (Green/Yellow/Red) for scannability. Example: Region Unlocks — Understood: Green, Inspired: Yellow, Less Pressured: Red
- **D-04:** Remediation is inline per mechanic (not a separate appendix). Each remediation includes:
  - Strength indicator (e.g., Strong Recommendation / Suggestion / For Discussion)
  - Justification for the recommendation
  - References to 3rd party sources where Dave and Allie can learn more about the pattern or principle

### Region Unlock Redesign
- **D-05:** The audit flags the emotion-gating bias (inspired/stuck/frustrated unlock regions, alright does not) clearly with pillar impact ratings. Does NOT prescribe a specific redesign — presents 2-3 options with tradeoffs and defers to Allie as creative director
- **D-06:** Missing "alright" region is a SEPARATE finding from the emotion-gating bias. Two distinct issues: (1) the mechanics problem of unequal contribution (fixable with code), and (2) the content/narrative gap of the healthiest emotional state having no world space (needs Allie's creative input)

### Config Extraction (Structural Refactor)
- **D-07:** Phase 2 includes extracting ALL magic numbers from code to `src/config/game.ts`. This is a maintainability refactor, not a gameplay change — values stay identical, they just move to a centralized, documented location
- **D-08:** The config extraction is a multi-step effort within Phase 2:
  1. Inventory every magic number with location, current value, and what it controls
  2. Design the config access pattern (typed constants, documented)
  3. Extract all magic numbers to `src/config/game.ts`
  4. Update all code to read from config instead of hardcoded values
- **D-09:** Parameter interaction analysis (MECH-11) and calibration assessment (MECH-12) are part of the audit document, informed by the now-centralized config
- **D-10:** Enforcement mechanism to prevent new magic numbers (lint rule or convention) is documented as a recommendation but implementation may extend into Phase 3-4

### Fog/Leaf Persistence
- **D-11:** Current behavior (reset each visit) is documented. The audit presents all three options (reset, persist, hybrid) with full tradeoffs and pillar impact ratings. Deferred to Allie to decide
- **D-12:** Fog persistence mode is a config parameter in `src/config/game.ts` (e.g., `fogPersistence: 'reset' | 'persist' | 'hybrid'`). All three modes built so Allie can switch and live with each one before committing. This is a feel-driven decision that benefits from hands-on experimentation

### Claude's Discretion
- Claude determines the specific mechanic sections and their ordering in the audit document
- Claude determines the internal structure of `src/config/game.ts` (grouping, naming, documentation format)
- Claude determines which 3rd party references are most relevant for each remediation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Game Content (source of truth for current parameters)
- `lib/storage.ts` — Region unlock logic (lines 75-95), world state schema, daily visit tracking, calculateStreak() (line 145, flagged for removal)
- `src/data/quests.ts` — 40 micro-quests, 10 per emotion, random selection logic
- `src/data/feedback.ts` — 20 feedback lines, 5 per emotion, random selection logic
- `src/data/types.ts` — Emotion type, Quest interface, DailyLog interface (note: DailyLog conflicts with lib/storage.ts version)

### Design Constraints
- `docs/game-design/pillars.md` — Design pillars (Understood, Inspired, Less Pressured) — the audit filter
- `docs/game-design/voice.md` — Aetherling voice rules
- `docs/game-design/core-loop.md` — Core loop definition

### Codebase Analysis
- `.planning/codebase/CONCERNS.md` — Known bugs, tech debt, performance bottlenecks, fragile areas (pre-existing analysis)
- `.planning/codebase/ARCHITECTURE.md` — Current architecture patterns
- `.planning/codebase/STRUCTURE.md` — File organization

### Project Artifacts
- `.planning/PROJECT.md` — Game mechanics concern noted in Context section
- `.planning/REQUIREMENTS.md` — MECH-01 through MECH-12 requirements with full descriptions

</canonical_refs>

<code_context>
## Existing Code Insights

### Magic Numbers Identified (preliminary inventory)
- Region unlock thresholds: `inspired >= 3`, `stuck >= 3`, `frustrated >= 3`, `totalDaysVisited >= 7`, `>= 14` (`lib/storage.ts:78-91`)
- Default unlocked region: `'lantern-clearing'` (`lib/storage.ts:39`)
- Fog wisp and leaf counts, clearing radius — in home screen component (`app/(tabs)/index.tsx`)
- Animation durations — scattered throughout home screen and first-lantern
- Storage limits: 100 logs, 200 seeds (`src/storage/storage.ts` — dead code, but documents original intent)
- Quest pool: 10 per emotion (implicit from array length in `src/data/quests.ts`)
- Feedback pool: 5 per emotion (implicit from array length in `src/data/feedback.ts`)

### Key Mechanic Patterns
- Quest selection is pure `Math.random()` — no dedup, no tracking of seen quests (MECH-09 relevance)
- Emotion counts accumulate forever with no ceiling or decay
- `calculateStreak()` exists at `lib/storage.ts:145` — flagged as design pillar violation (MECH-08)
- DailyLog type mismatch between `src/data/types.ts` (richer schema) and `lib/storage.ts` (simpler schema)

### Integration Points
- Config file (`src/config/game.ts`) is net-new — no existing config pattern to follow
- Home screen (`app/(tabs)/index.tsx`) is the primary consumer of most parameters
- `lib/storage.ts` owns unlock logic and will need to import from config
- Docs site (MkDocs) already has Game Design section — audit page adds to existing nav

</code_context>

<specifics>
## Specific Ideas

- Config extraction is explicitly a **maintainability refactor** with zero gameplay impact — values stay identical. Frame it this way in planning so scope stays clean
- Allie is the creative director for all design decisions (region unlock redesign, fog persistence, alright region). The audit presents options with tradeoffs; she decides
- Remediation quality matters for learning: strength indicators, justifications, and 3rd party references make this a teaching document, not just a findings list
- Fog persistence as a config toggle enables Allie to experiment with feel on a real device before committing — critical for a game built around daily ritual

</specifics>

<deferred>
## Deferred Ideas

- **Lint rule / CI enforcement for magic numbers** — Documented as a recommendation in the audit. Implementation belongs in Phase 3-4 when codebase conventions are formalized
- **Balancing/experimentation tooling** — Utilities for developers to experiment with different parameter values. Deferred to future milestone; config extraction is the prerequisite
- **Config hot-reload** — Ability to change config values without rebuilding. Not needed now; standard rebuild workflow is fine for experimentation

</deferred>

---

*Phase: 02-game-mechanics-audit*
*Context gathered: 2026-04-12*
