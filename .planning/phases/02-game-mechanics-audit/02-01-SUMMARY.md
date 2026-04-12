---
phase: 02-game-mechanics-audit
plan: 01
subsystem: config
tags: [config, refactor, fog-persistence, maintainability]
dependency_graph:
  requires: []
  provides: [src/config/game.ts, fog-persistence-modes]
  affects: [lib/storage.ts, app/(tabs)/index.tsx]
tech_stack:
  added: []
  patterns: [centralized-config, as-const-typescript, fog-persistence-mode-switcher]
key_files:
  created:
    - src/config/game.ts
  modified:
    - lib/storage.ts
    - app/(tabs)/index.tsx
decisions:
  - All game-feel numbers live in src/config/game.ts; logic files import, never hardcode
  - Fog persistence mode is a config switch (reset/persist/hybrid), defaulting to reset so current behavior is unchanged
  - Convention comment in game.ts documents the no-magic-numbers rule; lint enforcement deferred to Phase 3-4
metrics:
  duration: ~15 minutes
  completed: 2026-04-12
  tasks_completed: 2
  files_modified: 3
---

# Phase 2 Plan 1: Centralized Game Config + Fog Persistence Summary

Centralized all hardcoded game parameters into `src/config/game.ts` with a typed `GAME_CONFIG as const` object. Updated both consumers (`lib/storage.ts` and `app/(tabs)/index.tsx`) to import from config. Added three-mode fog persistence (reset/persist/hybrid) with storage functions, defaulting to `reset` so current behavior is unchanged.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create src/config/game.ts | bb68282 | src/config/game.ts |
| 2 | Update consumers + fog persistence | a1015e0 | lib/storage.ts, app/(tabs)/index.tsx |

## What Was Built

**src/config/game.ts** — New file. Single `GAME_CONFIG` object with four groups:
- `regionUnlocks` — thresholds for all five region unlocks (workshopGlade, fogValley, warmRiver, observatoryBalcony, theLongPath) plus `defaultRegion`
- `scene` — heightRatio, safeOffsetMultiplier, fog wisp sizes, touch radii, and `fogPersistence` mode switcher
- `animation` — fog and leaf clear durations, lift distance, scale, horizontal/vertical travel ranges
- `timing` — pathClearedToDoorsOpen and doorOpenToWalkStart delays

**lib/storage.ts** — Updated to import `GAME_CONFIG`. All five `checkRegionUnlocks()` comparisons now reference config values. `DEFAULT_WORLD_STATE.unlockedRegions` uses `GAME_CONFIG.regionUnlocks.defaultRegion`. Added `FogState` interface and `loadFogState`/`saveFogState` functions implementing all three persistence modes.

**app/(tabs)/index.tsx** — Updated to import `GAME_CONFIG` and the new fog storage functions. Scene height ratio, safe offset multiplier, fog wisp sizes, touch radii all reference config. Animation durations, lift, scale, leaf travel ranges, and timing delays all reference config. `loadFogState` called on mount; `saveFogState` called via useEffect when cleared sets change.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The fog persistence functions are fully implemented. They are dormant in `reset` mode (the default), which means the new code paths exist but produce no behavior change until `GAME_CONFIG.scene.fogPersistence` is changed. This is intentional per D-12: all three modes are built so Allie can switch and evaluate each one.

## Threat Surface Scan

No new trust boundaries. `saveFogState` writes a small JSON object to AsyncStorage (same trust boundary as all other storage writes). Silent failure on AsyncStorage error per existing project error-handling convention.

## Self-Check: PASSED

- src/config/game.ts: FOUND
- lib/storage.ts: FOUND
- app/(tabs)/index.tsx: FOUND
- SUMMARY.md: FOUND
- commit bb68282: FOUND
- commit a1015e0: FOUND
