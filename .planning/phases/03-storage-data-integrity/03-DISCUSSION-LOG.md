# Phase 3: Storage & Data Integrity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 03-storage-data-integrity
**Areas discussed:** DailyLog schema resolution, Data migration strategy, Test infrastructure scope

---

## DailyLog Schema Resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Simple schema | { date, completedQuests[] } — minimalist, emotion derivable from quest IDs | |
| Rich schema | { date, emotion, quest, completed, completedAt } — full context per ritual entry | ✓ |
| Simple + emotion | { date, completedQuests[], emotion } — explicit emotion without full quest snapshot | |

**User's choice:** Rich schema
**Notes:** User asked for detailed explanation of differences and risks between options. Key considerations discussed: emotion tracking anti-feature risk, stale quest text in inline objects, completedAt timing signals, multiple vs single quest completions per day. User ultimately chose rich schema after understanding that structural prevention is weak in a local-only app — design pillars and team understanding are the real protection.

---

## Data Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Fresh start | No migration code. Old keys orphaned (harmless). Pre-release, no real data at risk. | ✓ |
| Migrate on first load | One-time migration reads old keys, converts to new schema, writes new, deletes old | |
| Clear and reset | Explicitly clear all old keys on first launch post-update | |

**User's choice:** Fresh start (Recommended)
**Notes:** Straightforward selection. Pre-release app with no production user data makes migration code unnecessary overhead.

---

## Test Infrastructure Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal for storage | Jest + AsyncStorage mock only. Expand later. | |
| Full foundation | Jest + AsyncStorage mock + @testing-library/react-native + react-test-renderer. Config for all, only storage tests in Phase 3. | ✓ |
| You decide | Claude determines scope | |

**User's choice:** Full foundation
**Notes:** User asked about downsides of full foundation. Only concern is scope creep (temptation to write more tests than STOR-04 requires) and potential peer dependency conflicts with Expo 54. Both are manageable. Decision: install everything, configure everything, but only write storage tests in this phase.

---

## Claude's Discretion

- Storage key design pattern
- Internal structure of consolidated lib/storage.ts
- Test file organization pattern (__tests__/ vs co-located)
- Whether App.tsx is dead code (determine from Expo Router setup)

## Deferred Ideas

None — discussion stayed within phase scope
