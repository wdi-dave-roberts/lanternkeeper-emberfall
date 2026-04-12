---
phase: 03-storage-data-integrity
plan: "02"
subsystem: storage
tags: [storage, types, tdd-green, schema, deduplication]
one_liner: "Rich DailyLog schema wired end-to-end with Emotion type deduplication and passing round-trip tests"
dependency_graph:
  requires:
    - 03-01 (Jest infrastructure, dead code removal, failing tests)
  provides:
    - Consolidated storage with rich DailyLog schema (STOR-02)
    - Single Emotion type source of truth (STOR-05)
    - Passing round-trip unit tests (STOR-04)
  affects:
    - lib/storage.ts
    - app/(tabs)/index.tsx
tech_stack:
  patterns:
    - TDD green phase (tests written in 03-01 now pass)
    - Type-only imports for shared interfaces
    - WorldState.lastVisitDate as single source of truth for "already checked in"
key_files:
  modified:
    - lib/storage.ts
    - app/(tabs)/index.tsx
decisions:
  - "loadTodayLog returns DailyLog | null; alreadyCheckedIn derived from WorldState.lastVisitDate instead"
  - "saveDailyRitual replaces completeQuest; receives full ritual context (emotion + quest object)"
  - "Emotion type import-only in index.tsx; no local type alias"
metrics:
  duration: ~25 minutes
  completed: 2026-04-12
  tasks_completed: 3
  files_modified: 2
---

# Phase 03 Plan 02: DailyLog Schema Rewrite and Type Deduplication Summary

Rich DailyLog schema wired end-to-end with Emotion type deduplication and passing round-trip tests.

## What Was Built

This plan completed the TDD green phase begun in Plan 01. Three tasks brought the storage layer to a unified, tested state:

1. **lib/storage.ts** — Added `import type { Emotion, Quest, DailyLog }` from canonical source. Replaced `completeQuest(questId)` with `saveDailyRitual(emotion, quest)` which captures the full ritual context. `loadTodayLog` now returns `DailyLog | null` instead of a fake thin-schema default.

2. **app/(tabs)/index.tsx** — Removed inline `type Emotion` alias, replaced with `import type { Emotion }` from `src/data/types`. Updated storage imports (`saveDailyRitual` replaces `completeQuest`, `loadTodayLog` removed). `loadState` useEffect now derives `alreadyCheckedIn` from `WorldState.lastVisitDate` instead of calling `loadTodayLog`.

3. **Tests green** — All 4 round-trip tests pass: saves/retrieves unchanged, null on miss, independent dates, `saveDailyRitual` round-trip with persistence verification.

## STOR Requirements Verified

| Requirement | Status | Evidence |
|-------------|--------|----------|
| STOR-01: Single storage file | PASS | `test ! -f src/storage/storage.ts` exits 0 |
| STOR-02: Rich DailyLog schema in use | PASS | `saveDailyRitual` stores `{ emotion, quest, completed, completedAt }` |
| STOR-03: calculateStreak gone | PASS | `grep -r calculateStreak lib/ app/ src/` returns empty |
| STOR-04: Round-trip test passes | PASS | `npm test` — 4/4 tests pass |
| STOR-05: Emotion in one place | PASS | `grep -rn "type Emotion" app/ src/ lib/` returns only `src/data/types.ts:6` |

## Decisions Made

- **`loadTodayLog` returns null** — The rich schema has required fields (`emotion`, `quest`) with no sensible defaults, so returning a fake shell would cause TypeScript type confusion. Callers check for null or use `WorldState.lastVisitDate` for presence detection.
- **`saveDailyRitual` over `completeQuest`** — The new function receives full ritual context from the caller, removing the need for any lookup inside storage. This is simpler and more explicit.
- **`alreadyCheckedIn` from WorldState** — `WorldState.lastVisitDate` is already set by `recordDailyVisit` during quest completion. Using it as the single source of truth removes a redundant AsyncStorage read and eliminates the now-incompatible `completedQuests` field check.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed untracked dead files from worktree**
- **Found during:** Task 3 (STOR-01 verification)
- **Issue:** `src/storage/storage.ts` and `App.tsx` were physically present on disk in the worktree as untracked files, even though Plan 01 had deleted them from git tracking. This caused `test ! -f src/storage/storage.ts` to fail.
- **Fix:** Deleted the untracked files (they had no git presence and were dead code).
- **Files modified:** `src/storage/storage.ts` (deleted), `App.tsx` (deleted), `src/storage/` directory (removed)
- **Commit:** No additional commit needed — files were untracked

### Known Pre-existing Lint Issues (Deferred)

These lint warnings/errors existed before this plan and are not caused by our changes:

| Issue | File | Lines | Note |
|-------|------|-------|------|
| `react/no-unescaped-entities` | `app/(tabs)/index.tsx` | 900, 908 | "You've" and "Today's" apostrophes in JSX text |
| `@typescript-eslint/no-unused-vars` | `app/(tabs)/index.tsx` | 17 | `FogState` imported but only used implicitly |
| `react-hooks/exhaustive-deps` | `app/(tabs)/index.tsx` | 356, 701 | Missing `pathPoints` and `quest` deps |

These are out of scope per deviation scope boundary. Logged to deferred items.

## Threat Flags

No new trust boundaries introduced. All changes are within the existing AsyncStorage persistence boundary documented in the plan's threat model.

T-03-05 (old thin-schema data): Callers now check for null from `loadTodayLog` and do not access `completedQuests`. Old data stored under `daily-log:` keys will be orphaned per D-04.

## Self-Check: PASSED

- `lib/storage.ts` — contains `saveDailyRitual`, `import type { Emotion, Quest, DailyLog }`, no `completeQuest`, no `interface DailyLog`
- `app/(tabs)/index.tsx` — contains `import type { Emotion }`, no `type Emotion =`, no `completeQuest`, no `loadTodayLog`
- `npm test` — 4/4 tests pass
- Commits: `54671bf` (Task 1), `e7e83a1` (Task 2)
