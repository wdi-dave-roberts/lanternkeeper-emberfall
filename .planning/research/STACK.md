# Stack Research

**Domain:** Calm/ritual mobile game — Expo + React Native refinement and evaluation
**Researched:** 2026-04-11
**Confidence:** MEDIUM-HIGH (core tools HIGH, some supporting libraries MEDIUM)

## Context

This is NOT a greenfield stack recommendation. The base stack is locked: Expo 54 + React Native 0.81.5 + TypeScript + Reanimated 4.1.1 + Gesture Handler 2.28 + AsyncStorage. New Architecture is already enabled (`newArchEnabled: true`). React Compiler is already enabled.

This research answers: what additional tooling is needed to evaluate, diagnose, and refine this specific app?

---

## Recommended Stack

### Performance Profiling

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React Native DevTools | Built into RN 0.76+ | JS profiling, heap snapshots, component render timing, console | Official Flipper replacement since React Universe Conf 2024. Press `j` in Expo dev server. Zero install. Includes React Profiler tab for identifying unnecessary re-renders. HIGH confidence — official docs confirmed. |
| Expo Developer Menu | Built-in | Toggle Performance Monitor overlay (FPS, JS/UI thread usage) | Zero-config, ships with every Expo project. Shows frame drops in real time while interacting with fog/leaf gestures. Access via `m` in terminal. |
| Xcode Instruments (iOS) | macOS only | Time Profiler, Core Animation FPS | The authoritative tool for iOS animation frame drops. Use when React Native DevTools can't isolate native-side jank. Not required until RNDT points to native layer. |
| Android Studio CPU Profiler | macOS/Windows | Frame pacing, thread scheduling | Same role as Xcode Instruments but for Android. Use when targeting Android specifically. |

**What to profile first:** With Reanimated 4 + New Architecture already enabled, the most likely sources of jank are: (a) animated components on the JS thread (should be in worklets), (b) layout-affecting style animations (`top`/`left` vs `transform`), (c) too many simultaneous animated nodes (>500 iOS, >100 Android is Reanimated's documented limit).

### Animation Optimization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-native-reanimated | ~4.1.1 (already installed) | All gesture-driven animations | Already in use. Reanimated 4 exclusively uses New Architecture (Fabric), which is already enabled. All animations run on UI thread — JS thread can be fully blocked without dropping frames. Verified in official Reanimated docs. |
| react-native-skia | 2.2.3 (Expo SDK 54 compatible) | GPU-rendered 2D graphics for particle effects, fog, atmospheric visuals | Use this if fog/leaf animations currently run as many animated View components. Skia renders 500 particles in a single draw call via GPU. Expo confirmed version 2.2.3 for SDK 54. Install: `npx expo install @shopify/react-native-skia`. MEDIUM confidence — version confirmed, adoption in calm-game context confirmed via Callie app case study. |

**Reanimated 4 rules already verified:**
- Keep animations off JS thread (worklets run on UI thread — already correct with Reanimated 4)
- Animate `transform` and `opacity`, not `top`/`left`/`width`/`height` (layout-triggering)
- Wrap `useFrameCallback` in `useCallback` to prevent re-registration on every render
- Read shared values only from UI thread worklets, not from React components
- Enable feature flags `DISABLE_COMMIT_PAUSING_MECHANISM` and `USE_COMMIT_HOOK_ONLY_FOR_REACT_COMMITS` if seeing scroll-related frame drops with New Architecture (RN 0.80+ fix)

**React Compiler already enabled:** The app has `reactCompiler: true` in app.json. This provides automatic memoization at build time — 20-30% render time reduction reported in production. No manual `useMemo`/`useCallback` needed for component rendering. Do not add manual memoization on top of the compiler without profiling to confirm it helps.

### Game Loop Patterns

| Approach | Use Case | Implementation |
|----------|----------|----------------|
| `useFrameCallback` (Reanimated) | Continuous per-frame updates on UI thread (fog drift, ambient particle movement) | Preferred over `requestAnimationFrame` — runs on UI thread, not blocked by JS. Receives `FrameInfo` with timestamp and duration. Wrap in `useCallback`. |
| `requestAnimationFrame` (RN built-in) | One-shot or infrequent JS-thread updates | Use only for state changes that need to hit React (e.g., unlocking a region after animation). Do not use for per-frame visual updates. |
| Reanimated `withRepeat` / `withSequence` | Declarative ambient animations (walking cycle, floating wisps) | No game loop needed. Declarative CSS-style approach from Reanimated 4 handles state-driven looping animations cleanly. |
| React Native Game Engine | Full game loop + entity-component system | Overkill for this app. Heavy abstraction layer not justified for a ritual companion with light animation. Do not use. |

**Pattern recommendation for this app:** Aetherling's walking cycle and ambient fog should use Reanimated's declarative `withRepeat` — no frame loop needed. Gesture-driven fog/leaf clearing should stay on UI thread via worklets. A `useFrameCallback` is only justified if you add continuous particle drift that can't be expressed declaratively.

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | 5.0.12 | Game state store with AsyncStorage persistence | Current architecture uses direct AsyncStorage reads/writes scattered across screens. Zustand centralizes this into a typed store with `persist` middleware. 2KB bundle vs Redux ~20KB. `persist` middleware handles AsyncStorage serialization automatically. Compatible with React 19 and New Architecture. Install: `npm install zustand`. |
| React `useState` (existing) | — | Ephemeral UI state (animation phases, modal visibility) | Keep for local component state that doesn't need persistence. Not everything needs a global store. |

**Why Zustand over the current pattern:** The existing architecture has no shared state layer — each screen calls AsyncStorage directly. This creates race conditions (two screens loading world state independently), makes the region unlock logic harder to test, and means Allie has no single place to see what "game state" is. Zustand with `persist` replaces the AsyncStorage abstraction in `lib/storage.ts` with a typed store that auto-persists.

**Why not Jotai:** Atomic model adds complexity without benefit here. State isn't highly interdependent — there's one WorldState object and daily logs. Zustand's simpler flat store model is more readable for a learning developer.

**Why not Context API:** Re-renders on every state change. Performance degrades as world state updates during check-in flow.

**Zustand + AsyncStorage wiring:**
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useGameStore = create(
  persist(
    (set, get) => ({ /* WorldState shape here */ }),
    {
      name: 'lanternkeeper-world',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

### Game Parameter Configuration

| Approach | Purpose | Why Recommended |
|----------|---------|-----------------|
| `src/config/game.config.ts` (new file) | Single source of truth for all tunable values | Centralizes magic numbers currently scattered in components and storage logic. Allie can find and adjust thresholds without reading business logic code. TypeScript ensures type safety. Exported as a const object. |

**What goes in game.config.ts:**
```typescript
export const GAME_CONFIG = {
  regionUnlocks: {
    workshopGladeInspiredCount: 3,
    fogValleyStuckCount: 3,
    warmRiverFrustratedCount: 3,
    observatoryDaysVisited: 7,
    longPathDaysVisited: 14,
  },
  storage: {
    maxLogEntries: 100,
    maxIdeaSeeds: 200,
  },
  animation: {
    aetherlingWalkCycleMs: 800,
    fogClearSwipeThreshold: 50,
    leafBrushVelocityThreshold: 200,
  },
} as const
```

This is not a library install — it's a file to create. The pattern is a TypeScript const object with `as const` for deep readonly typing. No dependencies needed.

**No JSON config file in production builds:** Keeping config in TypeScript keeps it type-checked and refactoring-safe. JSON files in the bundle can drift from code expectations silently.

### Development Tooling

| Tool | Purpose | Notes |
|------|---------|-------|
| React Native DevTools | Primary JS profiler + component inspector | Press `j` in Expo CLI. No install. Use for render profiling before optimizing. |
| Reactotron | Desktop app for AsyncStorage inspection, state debugging, network monitoring | Useful for inspecting AsyncStorage values during development (and later Zustand store state). Maintained by Infinite Red. Requires `npm install reactotron-react-native` + config file. MEDIUM confidence — active in 2025 per multiple sources. |
| ESLint + eslint-plugin-react-hooks | Catch worklet/hook violations | Already installed (`eslint-config-expo`). Ensure `react-hooks/exhaustive-deps` rule is active — catches missing Reanimated worklet dependencies that cause subtle animation bugs. |

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Zustand | Redux Toolkit | Only if the team already knows Redux or needs Redux DevTools ecosystem. Overkill for this state shape. |
| Zustand | Jotai | If state were highly interdependent atoms (e.g., 50+ derived values). This app has one flat WorldState — Zustand is simpler. |
| `game.config.ts` TypeScript const | JSON file loaded at runtime | If config needs to change without a rebuild (e.g., remote config). Out of scope — this is a local app. |
| Reanimated `withRepeat` declarative | Custom `useFrameCallback` game loop | If adding continuous physics-based particle systems. Not needed for current animation scope. |
| react-native-skia | Many animated Views | If current fog/leaf animations are implemented as multiple RN Views. Skia is not needed unless profiling shows View-based particles are dropping frames. Do not add pre-emptively. |
| React Native DevTools | Flipper | Flipper is deprecated. Do not install. |
| React Native DevTools | Standalone React Native Debugger app | Incompatible with Hermes + RN 0.73+. Do not use with this stack. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Flipper | Officially deprecated. React Native templates no longer include it. Incompatible with New Architecture. | React Native DevTools (built-in) |
| Standalone React Native Debugger | Requires Remote JS debugging, deprecated in RN 0.73+. Incompatible with Hermes (which this app uses). | React Native DevTools |
| Redux / Redux Toolkit | Massive boilerplate for a local-only game with one state shape. ~20KB bundle. | Zustand 5 |
| React Native Game Engine | Entity-component architecture designed for arcade-style games. Heavy abstraction creates complexity not needed for a ritual companion. | Reanimated 4 declarative + `useFrameCallback` when needed |
| `requestAnimationFrame` for visual updates | Runs on JS thread — can be blocked by React renders and storage operations. | Reanimated `useFrameCallback` (UI thread) |
| Manual `useMemo` / `useCallback` everywhere | React Compiler (already enabled) handles memoization automatically. Manual calls add noise and can interfere with the compiler's analysis. | Trust React Compiler; add manual memoization only after profiling confirms specific hotspot |
| MMKV (react-native-mmkv) | 30x faster than AsyncStorage but requires a native module rebuild. Overkill for this data volume (100 log entries, 200 seeds). AsyncStorage performance at this scale is not a bottleneck. | Keep AsyncStorage (already installed, correct for scope) |

---

## Version Compatibility

| Package | Version | Compatibility Notes |
|---------|---------|---------------------|
| react-native-reanimated | ~4.1.1 | Requires New Architecture (already enabled). Reanimated 4 drops support for old Paper renderer. |
| @shopify/react-native-skia | 2.2.3 | Expo SDK 54 compatible version. Install via `npx expo install` to get correct version. |
| zustand | 5.0.12 | Compatible with React 19.1.0. No peer dependency conflicts expected. |
| react-native-reanimated | ~4.1.1 | Feature flags for New Architecture scroll jank: requires RN 0.80+ (this app is 0.81.5 — compatible) |

---

## Installation

```bash
# State management (replaces direct AsyncStorage pattern)
npm install zustand

# Skia for GPU rendering (only if profiling shows View-based animation is the bottleneck)
npx expo install @shopify/react-native-skia

# Development inspection (optional, useful during audit phase)
npm install reactotron-react-native --save-dev
```

No new installs needed for profiling — React Native DevTools and Expo Developer Menu are built in.

---

## Stack Patterns by Variant

**If fog/leaf clearing shows frame drops on Android low-end devices:**
- Profile with Android Studio CPU Profiler first
- If animated Views are the cause, migrate to react-native-skia canvas rendering
- Because Skia renders all particles in one GPU draw call vs N separate View animatables

**If region unlock logic becomes more complex:**
- Keep it in the Zustand store action, not in storage.ts
- Because business logic in the store is testable without mocking AsyncStorage

**If Allie needs to tune parameters without editing TypeScript:**
- Add a hidden dev screen that reads/writes `GAME_CONFIG` overrides from AsyncStorage
- Because TypeScript is the right source of truth at build time; a dev screen can override at runtime for playtesting

---

## Sources

- Expo Debugging docs (docs.expo.dev/debugging/tools/) — React Native DevTools confirmation, Expo Developer Menu features. HIGH confidence.
- Reanimated Performance docs (docs.swmansion.com/react-native-reanimated/docs/guides/performance/) — Worklet rules, component limits, New Architecture flags. HIGH confidence.
- SW Mansion blog (swmansion.com/blog/best-react-native-debugging-tools-in-2025) — Tool landscape, Flipper deprecation timeline. HIGH confidence.
- Expo SDK 54 Skia version (docs.expo.dev/versions/latest/sdk/skia/) — Version 2.2.3 for SDK 54. HIGH confidence.
- WebSearch: Zustand npm (npmjs.com/package/zustand) — Version 5.0.12, React 19 compatibility. MEDIUM confidence (npm page, not official docs).
- WebSearch: React Compiler 1.0 (react.dev/blog/2025/10/07/react-compiler-1) — Production-ready, automatic memoization, 20-30% render reduction reported. HIGH confidence.
- WebSearch: react-native-mmkv vs AsyncStorage comparison — Multiple sources agree on 30x speed delta. MEDIUM confidence (community benchmarks, not official).
- WebSearch: calm game + Skia pattern — Callie app case study on expo.dev blog. MEDIUM confidence (single source, but official Expo blog).

---

*Stack research for: Lanternkeeper Emberfall — evaluation and refinement milestone*
*Researched: 2026-04-11*
