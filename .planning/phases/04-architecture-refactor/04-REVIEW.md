---
phase: 04-architecture-refactor
reviewed: 2026-04-13T12:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - hooks/useHomeScene.ts
  - hooks/useCheckIn.ts
  - hooks/useQuest.ts
  - src/data/types.ts
  - src/components/scene/FogWisp.tsx
  - src/components/scene/Leaf.tsx
  - src/components/scene/Door.tsx
  - src/components/scene/RedPanda.tsx
  - src/components/scene/SpeechBubble.tsx
  - app/(tabs)/index.tsx
  - app/_layout.tsx
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-13
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

The Phase 4 architecture refactor is well-executed. The 1296-line monolith has been cleanly decomposed into a discriminated union type, three custom hooks, and five scene components. The hook extraction pattern is sound -- each hook owns a clear domain (scene interaction, check-in, quest completion) and the home screen composes them without duplicating logic.

The issues found are mostly around stale closure risks in gesture callbacks and a missing `await` on an async operation. No critical issues. The discriminated union for `HomePhase` is a strong improvement over boolean flags -- it makes impossible states unrepresentable and enables TypeScript narrowing throughout the flow.

## Warnings

### WR-01: Stale closure in pan gesture captures mutable `clearedFog` and `clearedLeaves`

**File:** `hooks/useHomeScene.ts:179-206`
**Issue:** The `Gesture.Pan().onUpdate()` callback captures `clearedFog`, `clearedLeaves`, `handleClearFog`, and `handleClearLeaf` from the closure, but `react-native-gesture-handler` v2 gesture objects are not automatically re-created when these values change. The `panGesture` object is returned from the hook and consumed by `GestureDetector` in the screen. If the gesture is not re-created when state changes, the `.has()` checks on lines 185 and 197 will use stale `Set` references, meaning already-cleared fog/leaves could trigger duplicate haptics and state updates.

In practice this is partially mitigated because `handleClearFog` and `handleClearLeaf` both check `prev.has(id)` inside the `setState` updater (lines 119 and 145), so the state mutation is safe. But the stale `.has()` guard in the gesture means unnecessary haptic triggers and `setDialogue` calls could fire on already-cleared items.

**Fix:** Wrap the gesture in `useMemo` with proper dependencies, or use `Gesture.Pan().onChange()` with a worklet and shared values. The simplest fix for now:
```ts
// Move the gesture creation into a useMemo so it rebuilds when deps change
const panGesture = useMemo(() =>
  Gesture.Pan()
    .onUpdate((event) => {
      // ... existing logic
    })
    .minDistance(0),
  [clearedFog, clearedLeaves, handleClearFog, handleClearLeaf, FOG_WISPS, LEAVES]
);
```

### WR-02: Nested `setTimeout` not cleaned up on unmount

**File:** `hooks/useHomeScene.ts:93-101`
**Issue:** The outer `setTimeout` (line 93) is cleaned up via the `useEffect` return, but the inner `setTimeout` on line 95 is not. If the component unmounts between the door opening and the walk starting (600ms window per `GAME_CONFIG.timing.doorOpenToWalkStartMs`), the inner callback will fire on unmounted state, calling `setIsWalking(true)` and `setShowDialogue(false)` after cleanup.

**Fix:** Track and clear both timeouts:
```ts
const doorTimer = setTimeout(() => {
  setDoorOpen(true);
  walkTimer = setTimeout(() => {
    setIsWalking(true);
    setShowDialogue(false);
  }, GAME_CONFIG.timing.doorOpenToWalkStartMs);
}, GAME_CONFIG.timing.pathClearedToDoorsOpenMs);

return () => {
  clearTimeout(doorTimer);
  clearTimeout(walkTimer);
};
```

### WR-03: `pathPoints` in RedPanda dependency array causes animation reset on every render

**File:** `src/components/scene/RedPanda.tsx:22-29`
**Issue:** The first `useEffect` depends on `pathPoints` (line 28), which is an array destructured from `sceneConfig` in the home screen. Since `sceneConfig` is `useMemo`'d on `[width, height, insets.top]`, it is stable across normal re-renders. However, if any of those values change (e.g., orientation change, keyboard appearance), this effect resets `posX`/`posY`/`opacity` to the initial path point, which would interrupt a walk animation in progress.

**Fix:** Guard the reset against `isWalking`:
```ts
useEffect(() => {
  if (!isWalking && pathPoints[0]) {
    posX.setValue(pathPoints[0].x);
    posY.setValue(pathPoints[0].y);
    opacity.setValue(1);
    bobble.setValue(0);
  }
}, [pathPoints, isWalking, posX, posY, opacity, bobble]);
```

### WR-04: `pathPoints` missing from walk animation `useEffect` dependencies

**File:** `src/components/scene/RedPanda.tsx:31-56`
**Issue:** The walk animation effect on line 31 uses `pathPoints` (lines 32, 40-46) but does not include it in the dependency array (line 56). ESLint's `react-hooks/exhaustive-deps` rule would flag this. If `pathPoints` changed while `isWalking` was true (unlikely but possible during orientation change), the animation would use stale coordinates.

**Fix:** Add `pathPoints` to the dependency array:
```ts
}, [isWalking, pathPoints, posX, posY, opacity, bobble, onWalkComplete]);
```

### WR-05: `useCheckIn` accepts `phase` and `setDialogue` in params but never uses them

**File:** `hooks/useCheckIn.ts:13-14, 22-27`
**Issue:** The `UseCheckInParams` interface declares `phase` and `setDialogue` as required parameters, but the destructured function on line 23 does not include them. This means callers must pass values that are never read, creating a confusing API contract. If a future change adds usage, the hook will silently start depending on values that callers thought were unused.

**Fix:** Remove unused params from the interface, or destructure them if they are needed for future use:
```ts
interface UseCheckInParams {
  setPhase: (phase: HomePhase) => void;
  setShowDialogue: (show: boolean) => void;
  worldState: WorldState | null;
  setWorldState: (state: WorldState) => void;
}
```

## Info

### IN-01: Duplicate type definitions for `DailyLog`

**File:** `src/data/types.ts:16-22` and `lib/storage.ts:139-142`
**Issue:** `DailyLog` is defined in both `src/data/types.ts` (with `emotion`, `quest`, `completed`, `completedAt` fields) and `lib/storage.ts` (with just `date` and `completedQuests`). These are structurally different types with the same name. The storage version is the one actually used at runtime. The types.ts version appears to be legacy from a prior design.

**Fix:** Remove or rename the unused `DailyLog` in `src/data/types.ts` to avoid confusion. If both are needed, give them distinct names (e.g., `DailyLogEntry` vs `DailyLogSummary`).

### IN-02: Redundant phase guard on quest rendering

**File:** `app/(tabs)/index.tsx:298`
**Issue:** Line 298 checks `isQuest && phase.phase === 'quest'`. The variable `isQuest` is defined on line 152 as `phase.phase === 'quest'`, making the second check redundant. This is harmless but adds noise.

**Fix:** Simplify to just `{isQuest && (` -- TypeScript narrows `phase` through `isQuest` already. Or if the intent is to help TypeScript narrow the discriminated union for `phase.quest` access on line 302, use a local guard:
```tsx
{phase.phase === 'quest' && (
  <View style={styles.questSection}>
    <Text style={styles.questText}>{phase.quest}</Text>
    ...
  </View>
)}
```

### IN-03: `React` import not needed in newer React/RN versions

**File:** `src/components/scene/FogWisp.tsx:3`, `Leaf.tsx:3`, `Door.tsx:6`, `RedPanda.tsx:7`, `SpeechBubble.tsx:6`
**Issue:** All five scene components import `React` explicitly. With React 19 and the new JSX transform (enabled in this project via Expo 54 and `reactCompiler: true`), the `React` import is unnecessary for JSX. It is needed only when using `React.useEffect`, `React.useRef`, etc. -- but these components import hooks directly from `'react'`.

**Fix:** Remove `import React from 'react'` from all five files. The named imports (`useEffect`, `useRef`) are already present and sufficient.

### IN-04: `currentQuest` state in `useCheckIn` is set but never exposed meaningfully

**File:** `hooks/useCheckIn.ts:29, 44, 69`
**Issue:** `currentQuest` is stored in state (line 29), set during `onSelectEmotion` (line 44), and returned (line 69). It is passed to `useQuest` as a parameter but `useQuest` never reads it (the `currentQuest` param on line 26 of `useQuest.ts` is declared but unused in the hook body). This suggests `currentQuest` was part of an earlier design that routed quest data through the hook rather than through the `HomePhase` discriminated union.

**Fix:** If quest data is now carried in the phase (`{ phase: 'quest', emotion, quest: questObj.text }`), consider removing `currentQuest` from both hooks to reduce dead state.

---

_Reviewed: 2026-04-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
