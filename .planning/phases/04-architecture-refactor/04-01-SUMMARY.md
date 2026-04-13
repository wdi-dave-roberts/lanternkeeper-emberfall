---
phase: 04-architecture-refactor
plan: "01"
subsystem: home-screen-logic
tags: [hooks, state-machine, refactor, typescript]
dependency_graph:
  requires: []
  provides: [HomePhase type, useHomeScene hook, useCheckIn hook, useQuest hook]
  affects: [app/(tabs)/index.tsx, src/data/types.ts]
tech_stack:
  added: []
  patterns: [discriminated-union state machine, custom hooks with callback injection, D-06 dialogue-as-callback, D-07 worldState-as-parameter]
key_files:
  created:
    - hooks/useHomeScene.ts
    - hooks/useCheckIn.ts
    - hooks/useQuest.ts
  modified:
    - src/data/types.ts
decisions:
  - "Used completeQuest (actual storage API) instead of saveDailyRitual (plan spec was ahead of implementation)"
  - "HomePhase appended to types.ts rather than co-located with screen — matches plan guidance and centralizes types"
  - "getSceneConfig stays in index.tsx — hook receives SceneConfig interface as parameter per plan"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-13"
  tasks_completed: 3
  files_changed: 4
---

# Phase 4 Plan 01: HomePhase Type and Logic Extraction Hooks Summary

HomePhase 8-variant discriminated union + three custom hooks (useHomeScene, useCheckIn, useQuest) extracted from the 1296-line home screen monolith, with all game logic now in isolated, testable hook files.

## What Was Built

### Task 1: HomePhase Type (src/data/types.ts)

Added the `HomePhase` discriminated union type to `src/data/types.ts`. Eight phase variants model the full ritual flow:

- `idle` — initial state, path is blocked
- `clearing` — user is swiping fog/leaves
- `transitioning` — path cleared, door opening, panda walking
- `check-in` — panda arrived, user selects emotion
- `quest` — carries `emotion` and `quest` text
- `feedback` — carries `emotion` and feedback `line`
- `complete` — ritual done for today
- `returning` — user already checked in today

Contextual data on `quest` and `feedback` variants means the screen can render without additional state lookups.

### Task 2: useHomeScene (hooks/useHomeScene.ts)

Owns all scene interaction logic:

- **Pan gesture**: `Gesture.Pan()` with hit detection for fog wisps (radius + buffer) and leaves (radius). Screen wraps JSX in `<GestureDetector gesture={scene.panGesture}>` per D-10.
- **Fog/leaf clearing**: `handleClearFog` / `handleClearLeaf` with haptic feedback. Sets dialogue via `setDialogue` callback per D-06.
- **Path cleared trigger**: `useEffect` watching cleared sets. When all cleared in `clearing` phase: sets dialogue, transitions to `transitioning`, opens door after `pathClearedToDoorsOpenMs`, starts walk after `doorOpenToWalkStartMs`.
- **Walk complete**: `handleWalkComplete` sets `pandaGone = true`, sets dialogue, transitions to `check-in`.
- **Fog persistence**: `loadFogState` on mount, `saveFogState` effect when sets change. No-op in reset mode.
- **Reset**: `resetScene` clears all state for "Walk again".

Hook does NOT call `loadWorldState` (screen owns that load per D-07).

### Task 3: useCheckIn + useQuest (hooks/useCheckIn.ts, hooks/useQuest.ts)

**useCheckIn:**
- `onSelectEmotion(emotion)`: records daily visit via `recordDailyVisit`, detects newly unlocked regions, picks random quest via `getRandomQuest`, transitions to `quest` phase
- Returns `currentQuest` (full Quest object) so useQuest can use it for storage writes
- Returns `newUnlocks` array and `clearNewUnlocks` for handoff to useQuest

**useQuest:**
- `onDone()`: reads emotion from current `quest` phase (type-safe discriminated union access), gets feedback via `getRandomFeedback`, shows region unlock name if `newUnlocks` present, calls `completeQuest` for storage write, transitions to `feedback` phase
- Region name map: `workshop-glade`, `fog-valley`, `warm-river`, `observatory-balcony`, `the-long-path`

Both hooks set dialogue via `setDialogue` callback per D-06. Neither calls `loadWorldState` per D-07.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan spec referenced `saveDailyRitual` — function does not exist in lib/storage.ts**
- **Found during:** Task 3
- **Issue:** Plan interface specified `saveDailyRitual(emotion: Emotion, quest: Quest): Promise<DailyLog>` but lib/storage.ts only has `completeQuest(questId: string): Promise<DailyLog>`. The plan was written ahead of the actual storage implementation.
- **Fix:** Used `completeQuest(questId)` where `questId = \`${getTodayKey()}-${emotion}\`` — matching the exact pattern used in index.tsx line 702.
- **Files modified:** hooks/useQuest.ts
- **Commit:** 1bd48a7

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 848d2ce | feat(04-01): add HomePhase discriminated union to types.ts |
| 2 | 9b62d1e | feat(04-01): create useHomeScene hook |
| 3 | 1bd48a7 | feat(04-01): create useCheckIn and useQuest hooks |

## Self-Check: PASSED

All created files exist. All commits verified in git log. TypeScript compiles with no errors (`npx tsc --noEmit` exits 0).

- FOUND: hooks/useHomeScene.ts
- FOUND: hooks/useCheckIn.ts
- FOUND: hooks/useQuest.ts
- FOUND: src/data/types.ts (modified — HomePhase appended)
- HomePhase has exactly 8 phase variants
- No hook calls loadWorldState

## Known Stubs

None. All hooks contain real logic connected to actual storage APIs and data functions.

## Threat Flags

None. This plan moves existing code into new files without changing behavior or introducing new trust boundaries. No new network endpoints, auth paths, file access patterns, or schema changes.
