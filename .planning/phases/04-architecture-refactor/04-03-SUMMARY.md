---
phase: "04-architecture-refactor"
plan: "03"
subsystem: "home-screen-composition"
tags: ["home-screen", "refactor", "hooks", "composition", "typescript"]
dependency_graph:
  requires:
    - "04-01 — HomePhase type + useHomeScene, useCheckIn, useQuest hooks"
    - "04-02 — FogWisp and Leaf extracted to src/components/scene/"
  provides:
    - "app/(tabs)/index.tsx — refactored home screen composing all hooks and scene components"
    - "src/components/scene/Door.tsx — Door animation component"
    - "src/components/scene/RedPanda.tsx — Aetherling walking animation component"
    - "src/components/scene/SpeechBubble.tsx — Aetherling dialogue bubble component"
  affects:
    - "app/(tabs)/index.tsx — full rewrite from 1296 lines to 499 lines"
tech_stack:
  added: []
  patterns:
    - "Hook composition: screen invokes 3 hooks and passes phase/setPhase as callbacks"
    - "HomePhase discriminated union replaces 14 boolean state flags"
    - "Scene components imported from src/components/scene/ — no inline function components"
    - "D-07 screen-owns-load: mount effect loads worldState, hooks receive it as parameter"
key_files:
  created:
    - "src/components/scene/Door.tsx"
    - "src/components/scene/RedPanda.tsx"
    - "src/components/scene/SpeechBubble.tsx"
  modified:
    - "app/(tabs)/index.tsx"
decisions:
  - "Extracted Door, RedPanda, SpeechBubble to src/components/scene/ to meet the <500 line acceptance criterion (kept inline per plan guidance, but extracted as deviation to satisfy hard constraint)"
  - "Returning phase shows scene as completed: isReturning flag overlays cleared/doorOpen/pandaGone props rather than initializing useHomeScene state"
metrics:
  duration: "~30 minutes"
  completed_date: "2026-04-13"
  tasks_completed: 1
  tasks_total: 2
  files_created: 3
  files_modified: 1
---

# Phase 4 Plan 03: Home Screen Rewrite as Hook Composition Summary

**One-liner:** 1296-line home screen monolith rewritten to 499-line JSX composition using HomePhase discriminated union and three custom hooks, with all inline components extracted to src/components/scene/.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite home screen as hook composition | bc626a4 | app/(tabs)/index.tsx, src/components/scene/{Door,RedPanda,SpeechBubble}.tsx |
| 2 | Human verify ritual flow (checkpoint) | — | awaiting human verification |

## What Was Built

### Task 1: Home Screen Rewrite

`app/(tabs)/index.tsx` reduced from 1296 lines to 499 lines. The screen is now pure composition:

**Imports (what the screen delegates to):**
- `useHomeScene` — fog clearing, leaf sweeping, pan gesture, door open trigger, panda walk, fog persistence, reset
- `useCheckIn` — emotion selection, daily visit recording, quest picking, region unlock detection
- `useQuest` — quest completion, feedback selection, storage write
- `FogWisp`, `Leaf` — scene animation components (from Plan 02)
- `Door`, `RedPanda`, `SpeechBubble` — newly extracted scene components

**What the screen owns:**
- `getSceneConfig()` — rendering-only geometry (fog/leaf/path positions based on screen dimensions)
- `EMOTION_LABELS` — display labels for emotion chips
- `phase` / `dialogue` / `showDialogue` / `worldState` — top-level state
- Mount effect: loads `worldState` and `todayLog`, detects returning visits, sets phase
- `handleReset` — wires `scene.resetScene()` with phase/dialogue reset
- JSX render tree with flow comments
- StyleSheet for screen-level layout

**Phase-based rendering (HomePhase discriminated union):**

| Phase | Ritual Panel Content |
|-------|----------------------|
| `idle` / `clearing` | "Swipe to clear the path" + progress dots |
| `check-in` | Emotion chips ("How are you feeling?") |
| `returning` | "You've walked the path today." + day count |
| `quest` | Quest card + "Done" button |
| `feedback` / `complete` | Day count + "Walk again" button |

**Returning phase implementation:**
`isReturning = phase.phase === 'returning'` is passed as an overlay to scene props:
- `cleared={scene.clearedFog.has(wisp.id) || isReturning}` — fog appears cleared
- `cleared={scene.clearedLeaves.has(leaf.id) || isReturning}` — leaves appear cleared
- `isOpen={scene.doorOpen || isReturning}` — door appears open
- `!showPandaGone` gate — panda hidden when returning

**Newly extracted scene components:**
- `src/components/scene/Door.tsx` — door open/close animation with glow effect
- `src/components/scene/RedPanda.tsx` — Aetherling walking path animation with bobble and fade-out
- `src/components/scene/SpeechBubble.tsx` — Aetherling's dialogue with fade-in/fade-out

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extracted Door, RedPanda, SpeechBubble to meet <500 line acceptance criterion**
- **Found during:** Task 1 verification
- **Issue:** Plan said "keep RedPanda, Door, SpeechBubble inline" but also set a hard acceptance criterion of `< 500` lines. With all three inline (combined ~205 lines) plus StyleSheet (~200 lines) plus HomeScreen function (~130 lines) plus imports/getSceneConfig (~80 lines), the file exceeded 500 lines at 824.
- **Fix:** Extracted the three rendering-only components to `src/components/scene/`. This aligns with the plan's own note: "These could be extracted to scene/ but that's discretionary." The acceptance criterion is not discretionary.
- **Files modified/created:** app/(tabs)/index.tsx, src/components/scene/Door.tsx, src/components/scene/RedPanda.tsx, src/components/scene/SpeechBubble.tsx
- **Commit:** bc626a4

## Verification

Task 1 automated verification:
- `npx tsc --noEmit` exits 0
- All 15 acceptance criteria pass (see below)

### Acceptance Criteria Results

| Criterion | Status |
|-----------|--------|
| `import.*useHomeScene.*from.*hooks` | PASS |
| `import.*useCheckIn.*from.*hooks` | PASS |
| `import.*useQuest.*from.*hooks` | PASS |
| `import.*FogWisp.*from.*scene` | PASS |
| `import.*Leaf.*from.*scene` | PASS |
| `useState<HomePhase>` | PASS |
| No `const FEEDBACK: Record<Emotion` | PASS |
| No `const QUESTS: Record<Emotion` | PASS |
| No `function FogWisp(` | PASS |
| No `function Leaf(` | PASS |
| No `const [pathCleared` | PASS |
| No `const [questDone` | PASS |
| Contains `Welcome back, Lanternkeeper` | PASS |
| Contains `loadWorldState` | PASS |
| Line count < 500 (actual: 499) | PASS |

## Task 2: Awaiting Human Verification

Task 2 is a `checkpoint:human-verify` gate. Human must verify the full ritual flow works identically on device or simulator before this plan is marked complete.

**What to verify:**
1. `npx expo start` — app loads
2. Scene shows fog wisps, leaves, Aetherling, door
3. Swipe clears fog/leaves with haptic feedback
4. All cleared -> door opens -> Aetherling walks -> disappears
5. Emotion chips appear -> tap emotion -> quest appears
6. Tap "Done" -> feedback line appears -> "Walk again" button
7. Tap "Walk again" -> resets to initial state
8. Close and reopen same day -> "Welcome back, Lanternkeeper"
9. `app/(tabs)/index.tsx` reads as composition, not a monolith

## Known Stubs

None — this plan composes real hooks (useHomeScene, useCheckIn, useQuest) with real scene components. All data flows are wired.

## Threat Flags

None — pure refactor. No new network endpoints, auth paths, file access patterns, or schema changes.

## Self-Check: PASSED

- `app/(tabs)/index.tsx` — FOUND (499 lines)
- `src/components/scene/Door.tsx` — FOUND
- `src/components/scene/RedPanda.tsx` — FOUND
- `src/components/scene/SpeechBubble.tsx` — FOUND
- Commit bc626a4 — FOUND
- `npx tsc --noEmit` — exits 0
- All acceptance criteria — PASS
