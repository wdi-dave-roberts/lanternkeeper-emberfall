# Architecture Research

**Domain:** Calm/ritual mobile game — Expo + React Native
**Researched:** 2026-04-11
**Confidence:** HIGH (current codebase examined, patterns verified against official docs and community sources)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Route Layer                               │
│  app/index.tsx       app/first-lantern.tsx   app/(tabs)/          │
│  (onboarding gate)   (one-time scene)        (main navigation)    │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                         Screen Layer                              │
│  ┌──────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   HomeScreen     │  │ CheckInScreen   │  │  QuestScreen    │  │
│  │ (scene + check-  │  │ (emotion picker)│  │ (quest + done)  │  │
│  │  in entry point) │  │                 │  │                 │  │
│  └────────┬─────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼──────────────────────┼────────────────────┼──────────┘
            │                      │                    │
┌───────────▼──────────────────────▼────────────────────▼──────────┐
│                    Game Logic / Hook Layer                         │
│  ┌──────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ useHomeScene     │  │ useCheckIn      │  │ useQuest        │  │
│  │ (animation state,│  │ (emotion select,│  │ (quest select,  │  │
│  │  fog/leaf state) │  │  flow control)  │  │  completion)    │  │
│  └────────┬─────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼──────────────────────┼────────────────────┼──────────┘
            │                      │                    │
┌───────────▼──────────────────────▼────────────────────▼──────────┐
│                       Data Layer                                   │
│  ┌──────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  lib/storage.ts  │  │  src/data/      │  │ src/config/     │  │
│  │  (AsyncStorage   │  │  quests.ts      │  │ game.ts         │  │
│  │   world state,   │  │  feedback.ts    │  │ (tunable        │  │
│  │   daily log)     │  │  types.ts       │  │  parameters)    │  │
│  └──────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Route files (`app/`) | Navigation gates, onboarding redirect, tab structure | Storage (onboarding check), Screen layer |
| Screen components | Render UI, orchestrate sub-components, pass callbacks | Game Logic/Hook layer |
| Custom hooks (`use*`) | Own the "what is happening" logic — state, transitions, selections | Storage layer, data files |
| Animation components (`FogWisp`, `Leaf`, `Panda`) | Manage own animation values, receive cleared/position props | Parent screen via props only |
| `lib/storage.ts` | AsyncStorage reads/writes, world state, region unlock rules | AsyncStorage (no upward dependencies) |
| `src/data/` | Static quest/feedback data, type definitions | Nothing (pure data) |
| `src/config/game.ts` (to create) | Game parameter constants — thresholds, durations, counts | Imported by storage and logic layers |

## Recommended Project Structure

The current structure is sound. The key moves are: extract custom hooks, create a config file, and eliminate the dead code in `src/screens/` and `src/storage/`.

```
lanternkeeper-emberfall/
├── app/                          # Expo Router pages (routing only)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── first-lantern.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx             # HomeScreen — thin, delegates to useHomeScene
│       └── explore.tsx
│
├── src/
│   ├── config/
│   │   └── game.ts               # NEW: all tunable game parameters
│   │
│   ├── data/                     # Static data (no logic)
│   │   ├── types.ts
│   │   ├── quests.ts
│   │   └── feedback.ts
│   │
│   ├── hooks/                    # NEW: custom hooks for game logic
│   │   ├── use-home-scene.ts     # Fog/leaf state, animation triggers
│   │   ├── use-check-in.ts       # Emotion selection flow
│   │   └── use-quest.ts          # Quest selection, completion
│   │
│   └── components/               # Pure UI components (accept props, no storage calls)
│       ├── scene/
│       │   ├── FogWisp.tsx
│       │   ├── Leaf.tsx
│       │   └── WalkingPanda.tsx
│       └── ui/
│           └── EmotionButton.tsx
│
├── lib/
│   └── storage.ts                # Keep as-is; remove calculateStreak()
│
├── components/                   # Keep existing themed wrappers
│
├── constants/
│   └── theme.ts
│
└── hooks/                        # Keep existing color-scheme hooks
```

### Structure Rationale

- **`src/config/game.ts`:** Allie can tune parameters without touching logic. Single source of truth for numbers that would otherwise be buried in storage.ts or index.tsx.
- **`src/hooks/`:** The current `app/(tabs)/index.tsx` is doing too much. Custom hooks pull the logic out so the screen file becomes readable — "what it shows" vs "how it works."
- **`src/components/scene/`:** Animation components are already written as standalone functions. Moving them to their own files makes each one findable and learnable in isolation.
- **Dead code removal:** `src/screens/` (unused legacy) and `src/storage/storage.ts` (deprecated) can be deleted. They confuse navigation.

## Architectural Patterns

### Pattern 1: Custom Hook as Logic Container

**What:** Extract all non-rendering logic from a screen into a `use*` hook that returns only what the screen needs to display and the callbacks it needs to call.

**When to use:** Any screen where the component function is longer than ~60 lines or mixes animation state, storage calls, and derived display values in the same function body.

**Trade-offs:** Adds a file. Makes each file shorter and single-purpose. Makes it much easier to explain to a learning developer: "the screen file is only about layout, the hook file is only about behavior."

**Example:**
```typescript
// src/hooks/use-home-scene.ts
export function useHomeScene() {
  const [clearedFog, setClearedFog] = useState<Set<number>>(new Set());
  const [clearedLeaves, setClearedLeaves] = useState<Set<number>>(new Set());
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [phase, setPhase] = useState<'scene' | 'emotion' | 'quest' | 'feedback'>('scene');

  useEffect(() => {
    loadWorldState().then(setWorldState);
  }, []);

  const clearFog = useCallback((id: number) => {
    setClearedFog(prev => new Set([...prev, id]));
  }, []);

  const clearLeaf = useCallback((id: number) => {
    setClearedLeaves(prev => new Set([...prev, id]));
  }, []);

  return { clearedFog, clearedLeaves, worldState, phase, setPhase, clearFog, clearLeaf };
}

// app/(tabs)/index.tsx — now a layout file
export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const scene = getSceneConfig(width, height, insets.top);
  const { clearedFog, clearedLeaves, phase, setPhase, clearFog, clearLeaf } = useHomeScene();

  return (
    // pure layout and component composition
  );
}
```

### Pattern 2: Game Config File

**What:** A single `src/config/game.ts` file containing all tunable parameters as named, typed constants. Storage rules and UI logic import from it — nothing hardcodes a number.

**When to use:** Any value that a non-developer might want to tune: thresholds, animation durations, counts, timing. In this codebase that means region unlock thresholds, fog/leaf counts, animation speeds.

**Trade-offs:** One more file. In exchange, Allie can find every tunable value in one place without reading through storage logic or animation code. Also makes the intent of each number legible ("this is `INSPIRED_UNLOCK_THRESHOLD`, not a magic `3`").

**Example:**
```typescript
// src/config/game.ts
export const REGION_UNLOCK_THRESHOLDS = {
  inspiredForWorkshopGlade: 3,
  stuckForFogValley: 3,
  frustratedForWarmRiver: 3,
  daysForObservatoryBalcony: 7,
  daysForTheLongPath: 14,
} as const;

export const SCENE_PARAMS = {
  fogWispCount: 3,
  leafCount: 3,
  pandaWalkDurationMs: 2000,
} as const;

export const ANIMATION_DURATIONS = {
  fogClearMs: 600,
  leafClearMs: 800,
  feedbackFadeMs: 400,
} as const;
```

### Pattern 3: Animation Component Isolation

**What:** Each animated element (FogWisp, Leaf, WalkingPanda) is its own file, manages its own `Animated.Value` refs, and receives only simple props: position, cleared state, and a callback. It does not read from storage, does not hold app state, does not know what a "world state" is.

**When to use:** Any element that has its own animation lifecycle — appears, reacts to user input, disappears. This is already the pattern for FogWisp and Leaf in the current code; it just needs to be formalized into separate files.

**Trade-offs:** More files. In exchange, each animation is completely self-contained and independently understandable. Allie can open `FogWisp.tsx` and see exactly what one fog wisp does.

**Performance note:** The current code uses `useNativeDriver: true` throughout — this is correct. Keep it. Moving to Reanimated 3 `useSharedValue`/`useAnimatedStyle` would give better performance for gesture-driven interactions, but the current `Animated` API with native driver is adequate for the calm, non-realtime interactions in this app. Do not migrate animations unless jank is observed.

### Pattern 4: Dumb Storage, Smart Hooks

**What:** `lib/storage.ts` stays as pure read/write with no UI knowledge. It does not know what phase the app is in, what screen is showing, or how to sequence transitions. That sequencing lives in hooks.

**When to use:** Always. This is the line between "data persists" and "app does things."

**Trade-offs:** None. This is the right separation. Violating it (e.g., having storage functions know about navigation or phases) creates tight coupling that makes both sides harder to change.

## Data Flow

### Check-In Flow

```
User taps "Check In"
    ↓
useHomeScene.setPhase('emotion')
    ↓
HomeScreen renders CheckInScreen (inline or modal)
    ↓
User selects emotion → useCheckIn.selectEmotion(emotion)
    ↓
storage.recordDailyVisit(emotion) → saves world state, returns updated regions
    ↓
data/quests.getRandomQuest(emotion) → returns Quest
    ↓
useCheckIn returns { selectedEmotion, currentQuest } to screen
    ↓
HomeScreen renders QuestScreen
    ↓
User taps "Done" → useQuest.complete(questId)
    ↓
storage.completeQuest(questId) → saves daily log
    ↓
data/feedback.getRandomFeedback(emotion) → returns string
    ↓
HomeScreen renders feedback line
    ↓
User navigates back → useHomeScene.setPhase('scene')
```

### State Management

App state is intentionally simple. No global state library is needed or recommended.

```
AsyncStorage (persisted)
    ↓ (read on mount)
useState in custom hooks (ephemeral, per-session)
    ↓ (passed as props)
Screen components → Animation components
    ↓ (user interactions)
Callbacks → hooks → storage writes
```

The current pattern (no Redux, no Context, no Zustand — direct storage reads into local state) is appropriate for this app's scale. If WorldState needs to be shared across multiple screens simultaneously, a single React Context wrapping the tab layout is the right next step — not Zustand or Redux. The performance difference between Context and Zustand is negligible at this interaction frequency (~1-2 state updates per session).

### Key Data Flows

1. **Scene parameters:** `useWindowDimensions()` → `getSceneConfig()` → props to animation components. Scene positions are always derived from screen size, never hardcoded.
2. **World state:** `loadWorldState()` on mount → local state → drives which regions show as unlocked on Explore screen.
3. **Quest selection:** Pure function from `src/data/quests.ts`. No storage read needed. Emotion in → quest out.
4. **Feedback selection:** Same pattern as quests — pure function, emotion in → string out.

## Refactoring: Vibe-Coded to Well-Structured

These are the concrete moves, in dependency order. Each is a self-contained improvement.

### Step 1: Create `src/config/game.ts`

Extract all magic numbers from `lib/storage.ts` and `app/(tabs)/index.tsx` into named constants. This is the safest first step — no behavior changes, only naming.

Targets: region unlock thresholds in `checkRegionUnlocks()`, fog/leaf counts in `getSceneConfig()`, animation durations in `FogWisp` and `Leaf`.

### Step 2: Delete dead code

Remove `src/screens/` (HomeScreen.tsx is a template, CheckInScreen and QuestScreen are not routed), `src/storage/storage.ts` (deprecated), and `app/modal.tsx` (unused template). This reduces confusion about where things live.

### Step 3: Move animation components to `src/components/scene/`

Extract `FogWisp`, `Leaf`, and the walking Panda SVG from `app/(tabs)/index.tsx` into individual files. Each file should be under ~80 lines. This is where Allie learns React components — small, self-contained, one job.

### Step 4: Extract `useHomeScene` hook

Pull all non-rendering logic from `app/(tabs)/index.tsx` into `src/hooks/use-home-scene.ts`. The screen file should be left with: imports, one hook call, and JSX layout. The hook file should be: state declarations, effects, callbacks, return object.

### Step 5: Remove `calculateStreak()` from storage

This function walks 365 days of AsyncStorage keys and violates the "Less Pressured" design pillar. It should not exist. Delete it before it gets wired to UI.

### Step 6: Fix the `Emotion` type duplication

`app/(tabs)/index.tsx` redeclares `type Emotion` locally. The canonical definition is in `src/data/types.ts`. The local re-declaration should be removed and the import used.

## Anti-Patterns

### Anti-Pattern 1: Logic in Screen Files

**What people do:** Put storage calls, state derivation, quest selection, and animation orchestration directly in the screen component function.

**Why it's wrong:** The screen file becomes unreadable. Allie cannot see where the layout ends and the behavior begins. Changes to logic require editing the same file as layout, increasing the chance of accidental UI breakage.

**Do this instead:** Custom hook owns all logic. Screen file calls one hook, receives a data object, renders JSX. The separation is visible in the file structure.

### Anti-Pattern 2: Shared State Driving Animation Values

**What people do:** Store animation progress (opacity, scale, translateY) in React state (`useState`) and use them to control animated components.

**Why it's wrong:** Every animation frame triggers React reconciliation, causing unnecessary re-renders of the entire component tree. On older devices, this causes visible jank.

**Do this instead:** Animation values live in `useRef(new Animated.Value(...))`. They are never React state. Components that animate own their own refs. The cleared/active condition that triggers an animation is React state (a boolean), but the animation values themselves are not.

### Anti-Pattern 3: Magic Numbers in Storage Logic

**What people do:** Write `if (state.emotionCounts.inspired >= 3)` directly in `checkRegionUnlocks()`.

**Why it's wrong:** When the threshold needs tuning, the editor has to find the right `3` among other `3`s in storage code. Allie has no way to know what's tunable without reading all the logic.

**Do this instead:** Import from `src/config/game.ts`. The code reads: `if (state.emotionCounts.inspired >= REGION_UNLOCK_THRESHOLDS.inspiredForWorkshopGlade)`.

### Anti-Pattern 4: Streak Tracking

**What people do:** `calculateStreak()` already exists in `lib/storage.ts`.

**Why it's wrong:** Streaks create implicit pressure — the exact feeling this app is designed to prevent. Even if not shown in UI yet, its presence invites the mistake of wiring it to a display.

**Do this instead:** Delete it. If longitudinal engagement data is needed for design purposes, track visit counts and last-visit dates (already done in WorldState), not streaks.

### Anti-Pattern 5: Inline QUESTS and FEEDBACK in Screen Files

**What people do:** `QUESTS` and `FEEDBACK` constants are duplicated in `app/(tabs)/index.tsx` alongside the same data that already lives in `src/data/quests.ts` and `src/data/feedback.ts`.

**Why it's wrong:** Two sources of truth for content. Allie adds a quest to `quests.ts`, it doesn't appear because the screen file uses its own copy.

**Do this instead:** Import from `src/data/`. Delete the inline duplicates.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Rule |
|----------|---------------|------|
| Screen → Hook | Hook call + returned object | Screen never imports storage directly |
| Hook → Storage | Direct function calls | Hooks are the only storage callers |
| Hook → Data | Direct imports of pure functions | No async needed; data is static |
| Animation Component → Parent | Props (position, cleared, onClear callback) | Animation components never call storage |
| Config → Everything | Import only | `game.ts` has no imports; it is the bottom of the dependency graph |

### External Services

None. Local-only is correct and intentional for this app.

## Scaling Considerations

This is a single-user, local-only app. Traditional scaling concerns do not apply. The relevant "scale" question is code complexity as features are added.

| Milestone | Architecture Adjustment |
|-----------|------------------------|
| Current (audit + refine) | Extract hooks, create config, delete dead code |
| Next features (new regions, more quests) | Add content to `src/data/` and `src/config/` — no structural changes |
| Onboarding variants or new scenes | New files in `src/components/scene/` — no structural changes |
| If shared state between tabs becomes needed | Add a single `WorldStateContext` wrapping the tab layout — not Zustand |

## Sources

- React Native Performance: https://reactnative.dev/docs/performance
- React Native Reanimated useSharedValue: https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue/
- React Native Reanimated useAnimatedStyle: https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle/
- Custom Hooks for business logic separation: https://react.dev/learn/reusing-logic-with-custom-hooks
- State Management in 2025 (Context vs Zustand): https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k
- React Native architecture patterns 2025: https://reactnativeexample.com/react-native-app-architecture-patterns-complete-guide-2025/
- Avoiding re-renders in React Native: https://medium.com/react-native-journal/avoiding-re-renders-in-react-native-components-proven-strategies-for-2025-1083226dd446

---
*Architecture research for: calm/ritual companion mobile game (Expo + React Native)*
*Researched: 2026-04-11*
