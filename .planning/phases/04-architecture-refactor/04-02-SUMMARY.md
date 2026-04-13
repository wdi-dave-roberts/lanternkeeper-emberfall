---
phase: "04-architecture-refactor"
plan: "02"
subsystem: "scene-components"
tags: ["component-extraction", "dead-code-removal", "react-native", "animation"]
dependency_graph:
  requires: []
  provides:
    - "src/components/scene/FogWisp.tsx — extracted fog wisp animation component"
    - "src/components/scene/Leaf.tsx — extracted leaf animation component"
  affects:
    - "app/(tabs)/index.tsx — consumers of the new components"
tech_stack:
  added: []
  patterns:
    - "Named export component pattern: export function FogWisp(...)"
    - "Self-contained animation: component owns Animated.Values, imports GAME_CONFIG directly"
key_files:
  created:
    - "src/components/scene/FogWisp.tsx"
    - "src/components/scene/Leaf.tsx"
  modified:
    - "app/_layout.tsx — removed dead modal Stack.Screen route"
  deleted:
    - "src/screens/HomeScreen.tsx"
    - "src/screens/CheckInScreen.tsx"
    - "src/screens/QuestScreen.tsx"
    - "src/screens/IdeaSeedScreen.tsx"
    - "app/modal.tsx"
    - "src/storage/storage.ts (untracked — confirmed deleted)"
    - "App.tsx (untracked legacy — confirmed deleted, Rule 1 fix)"
decisions:
  - "Extracted FogWisp and Leaf as named exports per D-08/D-09, importing GAME_CONFIG directly"
  - "Deleted App.tsx (Expo Go legacy entry) as Rule 1 auto-fix — it imported deleted files causing tsc errors; main is expo-router/entry so App.tsx was always dead"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-04-13"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
  files_deleted: 7
---

# Phase 4 Plan 02: Scene Component Extraction and Dead Code Removal Summary

**One-liner:** FogWisp and Leaf extracted as standalone named-export components with direct GAME_CONFIG access; five dead code files deleted and legacy App.tsx removed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extract FogWisp and Leaf to src/components/scene/ | 00bd2b7 | src/components/scene/FogWisp.tsx, src/components/scene/Leaf.tsx |
| 2 | Delete dead code — src/screens/, app/modal.tsx, src/storage/ | f5bbf64 | 6 files deleted, app/_layout.tsx modified |

## What Was Built

### Task 1: Component Extraction

`src/components/scene/FogWisp.tsx` and `src/components/scene/Leaf.tsx` are verbatim copies of the inline components from `app/(tabs)/index.tsx`, with:
- Named export functions (`export function FogWisp`, `export function Leaf`)
- Locked prop interfaces from the UI-SPEC preservation contract
- Direct `GAME_CONFIG` import from `@/src/config/game`
- Preserved `else` branch in `useEffect` for Walk Again animation reset path
- Locked style values (fog rgba color, leaf body color, zIndex values, 15px touch area padding)

### Task 2: Dead Code Deletion

All four `src/screens/` files deleted — confirmed no live imports (only App.tsx referenced them, which is itself dead). `app/modal.tsx` deleted and its `Stack.Screen` route removed from `app/_layout.tsx`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Deleted App.tsx (dead Expo Go legacy entry point)**
- **Found during:** Task 2 verification
- **Issue:** After deleting src/screens/ and src/storage/, `npx tsc --noEmit` showed 5 broken import errors in App.tsx. App.tsx is a pre-Expo-Router entry that is superseded by the `app/` directory. `package.json` main field is `expo-router/entry` — App.tsx is never loaded.
- **Fix:** Deleted App.tsx. TypeScript compilation passes with zero errors.
- **Files modified:** App.tsx (deleted)
- **Commit:** f5bbf64

## Verification

- `src/components/scene/FogWisp.tsx` contains `export function FogWisp`, `GAME_CONFIG.animation.fogClearDurationMs`, `rgba(180, 200, 220, 0.12)`, `zIndex: 20`, `opacity.setValue(1)`
- `src/components/scene/Leaf.tsx` contains `export function Leaf`, `GAME_CONFIG.animation.leafClearDurationMs`, `#8B6914`, `zIndex: 25`, `padding: 15`, `opacity.setValue(1)`
- `src/screens/` directory does not exist
- `app/modal.tsx` does not exist
- `src/storage/` directory does not exist
- `npx tsc --noEmit` exits 0
- `npx jest --passWithNoTests` exits 0

## Known Stubs

None — this plan contains only extraction and deletion. No new behavior introduced.

## Threat Flags

None — pure file extraction and dead code deletion. No new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- `src/components/scene/FogWisp.tsx` — FOUND
- `src/components/scene/Leaf.tsx` — FOUND
- Commit 00bd2b7 — FOUND
- Commit f5bbf64 — FOUND
