# Phase 4: Architecture Refactor — Research

**Researched:** 2026-04-12
**Domain:** React Native custom hooks, TypeScript discriminated unions, component extraction, React Native Animated API
**Confidence:** HIGH — this phase operates entirely within the existing codebase. No new libraries are being introduced. All patterns are verified directly from the source files.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**State Machine Design**
- D-01: Coarse phases — 5-7 high-level states: `idle`, `clearing`, `transitioning`, `check-in`, `quest`, `feedback`, `complete`, `returning`. Animation details internal to hooks, not app-level state
- D-02: Separate `returning` phase for "already checked in today"
- D-03: Discriminated union carries contextual data on phases that need it: `quest` carries `emotion` and `quest` text; `feedback` carries `emotion` and `line`

**Hook Boundaries**
- D-04: Screen owns `HomePhase` state machine — `app/(tabs)/index.tsx` holds `useState<HomePhase>` and passes phase + setPhase to hooks. Screen is orchestrator (~100 lines JSX)
- D-05: Three hooks: `useHomeScene` (fog/leaf clearing, walk animation, pan gesture), `useCheckIn` (emotion selection, daily visit recording), `useQuest` (quest selection, completion, feedback)
- D-06: Hooks set dialogue text via a `setDialogue` callback — dialogue is game logic co-located with action that triggers it
- D-07: Screen loads worldState once on mount, passes to hooks that need it. Hooks stay pure logic — they don't call storage directly for reads

**Animation Isolation**
- D-08: FogWisp → `src/components/scene/FogWisp.tsx`, Leaf → `src/components/scene/Leaf.tsx`. Keep prop interface (position + cleared + onClear), own animation state internally
- D-09: Components import `GAME_CONFIG` directly from `@/src/config/game`
- D-10: Pan gesture moves into `useHomeScene`. Screen wraps JSX in `<GestureDetector gesture={scene.panGesture}>`

**Readability for Allie**
- D-11: Flow comments at each phase transition and hook boundary — breadcrumbs, not JSDoc
- D-12: Delete inline QUESTS and FEEDBACK from home screen (lines 74-126). Import `getRandomQuest` and `getRandomFeedback` from `src/data/`
- D-13: Hooks in `hooks/` directory: `useHomeScene.ts`, `useCheckIn.ts`, `useQuest.ts`. Scene components in `src/components/scene/`. Home screen shrinks to ~100 lines JSX

**Dead Code Removal**
- D-14: Delete `src/screens/` directory (HomeScreen.tsx, CheckInScreen.tsx, QuestScreen.tsx, IdeaSeedScreen.tsx)
- D-15: Delete `app/modal.tsx`
- D-16: `src/storage/storage.ts` — ALREADY DELETED by Phase 3 (confirmed: directory not found)

### Claude's Discretion
- Internal animation state management within FogWisp/Leaf (Animated.Value patterns)
- Exact HomePhase union variant names (concepts locked, naming flexible)
- Whether `getSceneConfig()` stays as utility function or moves into useHomeScene
- Hook return type shapes (what each hook exposes to the screen)
- Whether to add a `types.ts` for HomePhase or co-locate it with the screen

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-01 | Extract `useHomeScene` custom hook — separate game logic from home screen layout | Hook boundary analysis, pan gesture extraction pattern documented below |
| ARCH-02 | Extract `useCheckIn` custom hook — encapsulate check-in flow logic | `onSelectEmotion` handler fully mapped; `recordDailyVisit` storage call identified |
| ARCH-03 | Extract `useQuest` custom hook — encapsulate quest selection and completion | `onDone` handler fully mapped; `saveDailyRitual` storage call identified |
| ARCH-04 | Formalize home screen state as TypeScript discriminated union (replace 5+ boolean flags) | Full discriminated union design documented in UI-SPEC and verified against current boolean flags |
| ARCH-05 | Isolate animation components (FogWisp, Leaf) into `src/components/scene/` | Prop interfaces extracted verbatim from source; animation internals verified |
| ARCH-06 | Remove dead code — unused `src/screens/`, `app/modal.tsx`, deprecated storage file | All three confirmed: src/screens/ has 4 files, app/modal.tsx exists, src/storage/ already gone |
| ARCH-07 | Ensure code is readable enough for Allie to learn from and contribute to | Flow comment strategy, hook naming, ~100-line home screen target |
</phase_requirements>

---

## Summary

Phase 4 is a pure refactor — no new behavior, no new libraries, no new data structures. The deliverable is the same working app with a codebase that fits in a human head.

The primary target is `app/(tabs)/index.tsx` — a 1296-line file containing 14 useState calls, inline FogWisp/Leaf components, duplicated quest/feedback data, a pan gesture, and all game logic. The file works but is impenetrable to Allie. After this phase: that file drops to roughly 100 lines of JSX that compose hook returns and render scene components.

The discriminated union (UI-SPEC approved) replaces the current boolean flag soup. The three hooks carve the monolith along natural seams that already exist in the code: scene/gesture logic, check-in flow, and quest completion flow. FogWisp and Leaf extract as-is — their prop interfaces are already clean, their animation logic is already self-contained.

**Primary recommendation:** Work in dependency order — discriminated union type first, then hooks (useHomeScene, useCheckIn, useQuest), then scene component extraction, then dead code deletion. Each step is independently testable via TypeScript compilation.

---

## Current State Inventory

This section documents exactly what exists today so the planner has precise targets.

### The Monolith: `app/(tabs)/index.tsx` (1296 lines)

**14 useState calls (the boolean flag soup):**
```typescript
const [clearedFog, setClearedFog] = useState<Set<number>>(new Set());
const [clearedLeaves, setClearedLeaves] = useState<Set<number>>(new Set());
const [pathCleared, setPathCleared] = useState(false);
const [isWalking, setIsWalking] = useState(false);
const [doorOpen, setDoorOpen] = useState(false);
const [pandaGone, setPandaGone] = useState(false);
const [emotion, setEmotion] = useState<Emotion | null>(null);
const [quest, setQuest] = useState<string>('');
const [questDone, setQuestDone] = useState(false);
const [dialogue, setDialogue] = useState('The path is blocked...');
const [showDialogue, setShowDialogue] = useState(true);
const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
const [worldState, setWorldState] = useState<WorldState | null>(null);
```

**Inline functions that become hooks:**
- Lines 517-545: `loadState()` async function in useEffect — becomes screen's mount effect calling hooks
- Lines 547-564: Path-cleared trigger useEffect — moves into `useHomeScene`
- Lines 566-572: `handleWalkComplete` callback — moves into `useHomeScene`
- Lines 574-605: `handleClearFog` + `handleClearLeaf` callbacks — move into `useHomeScene`
- Lines 607-612: Fog/leaf persistence useEffect — moves into `useHomeScene`
- Lines 615-642: `panGesture` — moves into `useHomeScene`
- Lines 644-652: `pickFeedback` / `pickQuest` inline functions — DELETE (replaced by `getRandomFeedback` / `getRandomQuest` imports)
- Lines 654-674: `onSelectEmotion` async callback — moves into `useCheckIn`
- Lines 676-701: `onDone` async callback — moves into `useQuest`
- Lines 703-716: `resetMorning` function — stays in screen or moves into `useHomeScene` (Claude's discretion)

**Inline components that extract:**
- Lines 130-194: `FogWisp` function — extract to `src/components/scene/FogWisp.tsx`
- Lines 197-279: `Leaf` function — extract to `src/components/scene/Leaf.tsx`
- Lines 282-387: `RedPanda` function — may stay or extract (discretion)
- Lines 389-450: `Door` function — may stay or extract (discretion)
- Lines 452-484: `SpeechBubble` function — may stay or extract (discretion)

**Duplicated data (delete from home screen, import instead):**
- Lines 74-103: `FEEDBACK` object — duplicates `src/data/feedback.ts`
- Lines 105-126: `QUESTS` object — duplicates `src/data/quests.ts`

**Keepers (stay in home screen):**
- Lines 29-65: `getSceneConfig()` utility — pure function, Claude's discretion on location
- Lines 67-72: `EMOTION_LABELS` constant — display concern, stays in home screen
- Lines 718-938: JSX render tree — shrinks to hook composition + component rendering
- Lines 941+: `StyleSheet.create()` — stays in its component file

### Dead Code (confirmed present, ready to delete)

| Path | Status | Action |
|------|--------|--------|
| `src/screens/HomeScreen.tsx` | Present | Delete |
| `src/screens/CheckInScreen.tsx` | Present | Delete |
| `src/screens/QuestScreen.tsx` | Present | Delete |
| `src/screens/IdeaSeedScreen.tsx` | Present | Delete |
| `app/modal.tsx` | Present | Delete |
| `src/storage/storage.ts` | ALREADY DELETED by Phase 3 | No action needed |

### Clean Foundation (Phase 3 output, no changes needed)

| File | Status |
|------|--------|
| `lib/storage.ts` | Clean single storage layer, rich DailyLog schema |
| `src/data/types.ts` | Canonical types, includes `Emotion`, `Quest`, `DailyLog` |
| `src/data/quests.ts` | Clean, exports `getRandomQuest`, `getAnotherQuest` |
| `src/data/feedback.ts` | Clean, exports `getRandomFeedback` |
| `src/config/game.ts` | GAME_CONFIG with all tunable parameters |
| `lib/storage.test.ts` | Round-trip tests green, Jest infrastructure installed |

---

## Standard Stack

### Core (no new installs required)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React Native `Animated` | built-in | FogWisp/Leaf/Door/SpeechBubble animations | Already in use |
| `react-native-gesture-handler` | ~2.28.0 | Pan gesture (`Gesture.Pan()`) | Already in use |
| `react-native-reanimated` | ~4.1.1 | Available for Phase 5; do NOT migrate in Phase 4 | Already installed |
| TypeScript discriminated unions | 5.9.2 | `HomePhase` type | Language feature, no install |
| Jest + jest-expo | ^29.7.0 | Hook unit tests | Already configured |

**No new packages.** Phase 4 is a pure code reorganization within the existing dependency set.

[VERIFIED: package.json inspection, jest.config.js inspection]

---

## Architecture Patterns

### Pattern 1: TypeScript Discriminated Union for Phase State

**What:** Replace 14 useState flags with a single `HomePhase` union where each variant carries exactly the data that phase needs.

**Locked design (from UI-SPEC):**
```typescript
// Source: .planning/phases/04-architecture-refactor/04-UI-SPEC.md
// Place in: src/data/types.ts (or co-located with home screen — Claude's discretion)
type HomePhase =
  | { phase: 'idle' }
  | { phase: 'clearing' }
  | { phase: 'transitioning' }
  | { phase: 'check-in' }
  | { phase: 'quest'; emotion: Emotion; quest: string }
  | { phase: 'feedback'; emotion: Emotion; line: string }
  | { phase: 'complete' }
  | { phase: 'returning' }
```

**Phase transition map (from UI-SPEC):**
| From | To | Trigger |
|------|----|---------|
| `idle` | `clearing` | User swipes first fog/leaf |
| `clearing` | `transitioning` | All fog + leaves cleared |
| `transitioning` | `check-in` | Walk complete + panda gone |
| `check-in` | `quest` | User selects emotion |
| `quest` | `feedback` | User taps "Done" |
| `feedback` | `complete` | Feedback displayed |
| `idle` | `returning` | `lastVisitDate === today` on mount |

**Why this replaces the booleans:** The current flags are coupled — `pathCleared && pandaGone` implies `check-in`, `emotion !== null && !questDone` implies `quest`, etc. The union makes those relationships explicit and TypeScript-enforced.

**Existing booleans that collapse into the union:**
- `pathCleared`, `pandaGone`, `isWalking` → transitioning / check-in phase boundary
- `alreadyCheckedIn` → `returning` phase
- `questDone` → feedback / complete phase boundary
- `emotion` (nullable) → quest phase variant carries it as required field
- `quest` (string) → quest phase variant carries it as required field

**Surviving non-phase state (stays in screen):**
- `clearedFog: Set<number>` — animation/scene state, lives in useHomeScene
- `clearedLeaves: Set<number>` — animation/scene state, lives in useHomeScene
- `doorOpen: boolean` — visual state derived from phase, lives in useHomeScene
- `dialogue: string` — display text, screen holds it, hooks set it via callback
- `showDialogue: boolean` — display toggle, screen holds it
- `worldState: WorldState | null` — loaded on mount, passed to hooks
- `newUnlocks: string[]` — intermediate unlock tracking, lives in useCheckIn or useQuest

[VERIFIED: source inspection of app/(tabs)/index.tsx lines 497-514]

### Pattern 2: Screen as Orchestrator (~100 lines JSX)

**What:** The screen file holds `HomePhase` state and three hook instances. It passes phase + setPhase to hooks and renders what they return.

**Screen responsibility after refactor:**
```typescript
// Source: derived from CONTEXT.md D-04, D-07
export default function HomeScreen() {
  const [phase, setPhase] = useState<HomePhase>({ phase: 'idle' });
  const [dialogue, setDialogue] = useState('The path is blocked...');
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Load world state once on mount — screen owns the load
  useEffect(() => { loadWorldState().then(setWorldState); }, []);

  // Hooks receive phase, setPhase, setDialogue, worldState
  const scene = useHomeScene({ phase, setPhase, setDialogue });
  const checkIn = useCheckIn({ phase, setPhase, setDialogue, worldState });
  const quest = useQuest({ phase, setPhase, setDialogue });

  return (/* ~80 lines of JSX composing scene, UI zone, ritual panel */);
}
```

**What each hook returns to the screen:**
- `useHomeScene` → `{ panGesture, clearedFog, clearedLeaves, doorOpen }` (or similar scene state for rendering)
- `useCheckIn` → `{ onSelectEmotion }` (handler function)
- `useQuest` → `{ onDone }` (handler function)

[ASSUMED: Hook return type shapes are Claude's discretion per CONTEXT.md. The above is a reasonable design but not locked.]

### Pattern 3: useHomeScene Hook

**What:** Owns all scene interaction logic — fog/leaf state, pan gesture, walk animation trigger, fog persistence.

**Inputs:** `phase`, `setPhase`, `setDialogue`, plus scene config (width/height/insets from screen)

**Responsibilities (extracted from index.tsx):**
1. `clearedFog` and `clearedLeaves` state (Set<number>)
2. `handleClearFog(id)` and `handleClearLeaf(id)` — haptics + dialogue via setDialogue
3. Pan gesture construction (`Gesture.Pan().onUpdate(...)`)
4. Path-cleared detection → transition to `transitioning` phase
5. `handleWalkComplete` callback → transition to `check-in` phase
6. `doorOpen` derived state
7. Fog/leaf persistence calls to `saveFogState`
8. Mount-time fog restore from `loadFogState`

**Key internal logic to preserve (from index.tsx lines 547-564):**
```typescript
// Source: app/(tabs)/index.tsx lines 547-564
// When all cleared and not yet transitioning:
const timer = setTimeout(() => {
  setDoorOpen(true);
  setTimeout(() => {
    setIsWalking(true);
    setShowDialogue(false);
  }, GAME_CONFIG.timing.doorOpenToWalkStartMs);
}, GAME_CONFIG.timing.pathClearedToDoorsOpenMs);
```
This timing logic moves into `useHomeScene` and drives phase transitions instead of boolean flags.

### Pattern 4: useCheckIn Hook

**What:** Owns emotion selection and daily visit recording.

**Inputs:** `phase`, `setPhase`, `setDialogue`, `worldState`

**Responsibilities (from onSelectEmotion, index.tsx lines 654-674):**
1. Accept emotion selection from screen
2. Call `recordDailyVisit(emotion)` — the one storage write in this hook
3. Track newly unlocked regions (compare before/after worldState)
4. Set phase to `{ phase: 'quest', emotion, quest: getRandomQuest(emotion).text }`
5. Call `setDialogue` to hide dialogue during transition

**Key: `getRandomQuest` is called here**, not in useQuest — the quest text is embedded in the phase variant so useQuest can read it from `phase.quest` without needing its own state.

[VERIFIED: onSelectEmotion logic at index.tsx lines 654-674; getRandomQuest from src/data/quests.ts]

### Pattern 5: useQuest Hook

**What:** Owns quest completion and feedback selection.

**Inputs:** `phase`, `setPhase`, `setDialogue`

**Responsibilities (from onDone, index.tsx lines 676-701):**
1. Accept "Done" tap from screen
2. Call `getRandomFeedback(emotion)` to get feedback line
3. Call `saveDailyRitual(emotion, quest)` — the one storage write in this hook
4. Handle new unlock display (show region name if unlocked)
5. Set phase to `{ phase: 'feedback', emotion, line: feedbackText }`

**Region name display (from index.tsx lines 681-688):**
```typescript
// Source: app/(tabs)/index.tsx lines 681-688
const regionNames: Record<string, string> = {
  'workshop-glade': 'Workshop Glade',
  'fog-valley': 'Fog Valley',
  'warm-river': 'Warm River',
  'observatory-balcony': 'Observatory Balcony',
  'the-long-path': 'The Long Path',
};
```
This map stays in the hook logic or moves to a shared constant. It is NOT duplicating game config — these are display strings for a one-time notification.

### Pattern 6: FogWisp Component Extraction

**Target:** `src/components/scene/FogWisp.tsx`

**Locked prop interface (from UI-SPEC):**
```typescript
// Source: .planning/phases/04-architecture-refactor/04-UI-SPEC.md
interface FogWispProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}
```

**Animation internals (from index.tsx lines 130-194) — copy as-is:**
- `opacity`, `scale`, `translateY` Animated.Values
- Reads `GAME_CONFIG.animation.fogClearDurationMs`, `fogClearScale`, `fogClearLiftPx` directly
- When `cleared` becomes true: parallel animate opacity→0, scale→1.5, translateY→-40
- When `cleared` becomes false: reset all values synchronously (`.setValue()`)

**Style values locked by UI-SPEC:**
- Fog color: `rgba(180, 200, 220, 0.12)` (background) — preserve exactly
- zIndex: 20

[VERIFIED: source inspection of index.tsx lines 130-194, UI-SPEC scene element colors]

### Pattern 7: Leaf Component Extraction

**Target:** `src/components/scene/Leaf.tsx`

**Locked prop interface (from UI-SPEC):**
```typescript
// Source: .planning/phases/04-architecture-refactor/04-UI-SPEC.md
interface LeafProps {
  x: number;
  y: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}
```

**Animation internals (from index.tsx lines 197-279) — copy as-is:**
- `opacity`, `translateX`, `translateY`, `spin` Animated.Values
- Reads GAME_CONFIG animation values directly
- Random direction on clear (`Math.random() > 0.5 ? 1 : -1`)
- `spin.interpolate` for rotation: `[-2, 2]` → `['-360deg', '360deg']`
- Touch target: `leafTouchArea` with padding 15px (PRESERVATION-CONTRACT — do not change)

**Style values locked by UI-SPEC:**
- Leaf body color: `#8B6914`
- Leaf stem color: `#5D4A1A`
- zIndex: 25

[VERIFIED: source inspection of index.tsx lines 197-279, UI-SPEC preservation contract]

### Pattern 8: Hooks Directory Convention

**Existing pattern:**
```
hooks/
├── use-color-scheme.ts       # re-export from 'react-native'
├── use-color-scheme.web.ts   # web fallback
└── use-theme-color.ts        # theme-aware color lookup
```

**After Phase 4:**
```
hooks/
├── use-color-scheme.ts       # unchanged
├── use-color-scheme.web.ts   # unchanged
├── use-theme-color.ts        # unchanged
├── useHomeScene.ts           # scene + gesture logic (new)
├── useCheckIn.ts             # emotion selection + daily visit (new)
└── useQuest.ts               # quest completion + feedback (new)
```

**File naming:** Existing hooks use `use-kebab-case.ts`. New game hooks could follow the same convention (`use-home-scene.ts`) OR use `useHomeScene.ts` (camelCase). Either is valid — convention file says hook files use camelCase prefixed with `use-`. **Claude's discretion to choose and apply consistently.**

[VERIFIED: hooks/ directory inspection, CONVENTIONS.md hook naming section]

### Pattern 9: Scene Component Directory Convention

**New directory:** `src/components/scene/`

This is a new subdirectory under `src/`. The `components/` directory at root contains reusable generic components (ThemedText, HapticTab, etc.). Game-specific scene components go under `src/components/scene/` to keep them co-located with other `src/` game code.

```
src/components/scene/
├── FogWisp.tsx    # Interactive fog wisp with animation
└── Leaf.tsx       # Interactive falling leaf with animation
```

RedPanda, Door, and SpeechBubble may also extract here (Claude's discretion per CONTEXT.md). If extracted:
- `src/components/scene/RedPanda.tsx`
- `src/components/scene/Door.tsx`
- `src/components/scene/SpeechBubble.tsx`

[ASSUMED: src/components/ directory does not currently exist — no `src/components/` found in STRUCTURE.md. The directory needs to be created.]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Discriminated union exhaustiveness | Custom switch helpers | TypeScript `never` type + exhaustive switch | Built into the language |
| Quest randomization | Custom weighted picker | `getRandomQuest(emotion)` from `src/data/quests.ts` | Already built, tested |
| Feedback selection | Custom random logic | `getRandomFeedback(emotion)` from `src/data/feedback.ts` | Already built |
| Scene position calculation | Ad-hoc arithmetic | `getSceneConfig(width, height, insets.top)` | Already built in index.tsx |
| Animation orchestration | Custom animation manager | React Native `Animated.parallel`, `Animated.sequence` | Already in use, proven |
| Gesture detection | Custom touch hit-testing | `Gesture.Pan()` from gesture-handler | Already in use |

**Key insight:** Almost everything being "extracted" already exists as working code. This phase moves code, it does not write new code. The primary new artifact is the `HomePhase` discriminated union type.

---

## Common Pitfalls

### Pitfall 1: Breaking the Render-Order Contract

**What goes wrong:** When FogWisp and Leaf extract to their own files, their StyleSheet definitions extract with them. If z-index values change or render order shifts in JSX, the scene breaks visually.

**Why it happens:** The UI-SPEC z-order is: stars → path → door → FogWisp (zIndex 20) → Leaf (zIndex 25) → RedPanda (zIndex 50). Easy to accidentally reorder during file reorganization.

**How to avoid:** Copy the exact StyleSheet values from index.tsx verbatim. Do not "clean up" or "normalize" styles during extraction. Reference UI-SPEC z-index table.

**Warning signs:** FogWisps appearing behind the door, leaves appearing on top of the panda.

### Pitfall 2: Losing the `cleared` Animation Reset

**What goes wrong:** The FogWisp and Leaf components have a branch in their useEffect that resets animation values when `cleared` is false (the `resetMorning` path). Missing this reset causes visual glitches when the user taps "Walk again."

**Why it happens:** Developer reads the "cleared = true" animation path, copies it, forgets the `else` branch that calls `.setValue(1)` to reset.

**Why it matters:** `resetMorning` sets all cleared states back to false. The components receive `cleared=false` as a prop. If the reset branch is missing, fog wisps stay invisible after reset.

**How to avoid:** Copy the full `useEffect` body including the `else` branch from index.tsx lines 168-173 (FogWisp) and 241-246 (Leaf).

[VERIFIED: index.tsx lines 149-174, 215-247]

### Pitfall 3: Pan Gesture State Closure Over Stale Sets

**What goes wrong:** The `panGesture` in `useHomeScene` references `clearedFog` and `clearedLeaves` inside `.onUpdate()`. If the gesture is created outside a `useMemo` or `useCallback` that tracks these dependencies, it captures stale Set references and fails to detect already-cleared items.

**Why it happens:** `Gesture.Pan()` creates an object with event handlers. If defined at hook top level without memoization, it captures the initial empty Set values.

**How to avoid:** The current implementation in index.tsx (lines 615-642) defines `panGesture` at the component body level, which re-runs on every render — so it always has current state. When moving to `useHomeScene`, either keep this approach (re-create gesture each render, acceptable cost) or use `useMemo` with `[clearedFog, clearedLeaves]` dependencies.

[VERIFIED: index.tsx lines 615-642]

### Pitfall 4: Hook Calling Storage for Reads (violates D-07)

**What goes wrong:** A hook calls `loadWorldState()` internally instead of receiving it as a prop from the screen.

**Why it happens:** It feels natural for `useCheckIn` to own its own data loading.

**Why it violates the design:** D-07 specifies screen loads worldState once on mount, passes to hooks. This keeps the data flow visible at screen level (Allie can see where data comes from without diving into hooks) and avoids multiple concurrent storage reads.

**How to avoid:** Hooks receive `worldState` as a parameter, not a return value of their own `useEffect`. Only `useEffect` in the screen body calls `loadWorldState()`.

### Pitfall 5: Splitting the `quest` Text from the Quest Object

**What goes wrong:** The home screen currently stores `quest` as a plain string (`useState<string>('')`). The phase variant `{ phase: 'quest'; quest: string }` also uses a plain string. But `saveDailyRitual` needs a `Quest` object (`{ id, emotion, text }`).

**Why it matters:** If `useQuest.onDone` only has the quest text string, it cannot construct the full `Quest` object for `saveDailyRitual`.

**How to avoid:** When `useCheckIn` transitions to the quest phase, store the full `Quest` object. Either:
- Phase variant carries the full object: `{ phase: 'quest'; emotion: Emotion; quest: Quest }`
- Or useCheckIn stores the Quest object in a ref and useQuest reads it via a shared ref

The simplest solution is to store `Quest` (not just the text string) in the phase variant. The display text is `phase.quest.text`. This is Claude's discretion but the constraint is real.

[VERIFIED: saveDailyRitual signature in lib/storage.ts line 171-184; Quest type in src/data/types.ts]

### Pitfall 6: Orphaned Import of Deleted Data

**What goes wrong:** After deleting the inline `QUESTS` and `FEEDBACK` from home screen, the `pickFeedback` and `pickQuest` functions (lines 644-652) also need deletion. If only the data objects are removed without removing the picker functions, TypeScript errors appear.

**How to avoid:** Remove the picker functions and the data objects together in the same step. Replace their call sites with `getRandomQuest(emotion)` and `getRandomFeedback(emotion)` imports before or during hook extraction.

[VERIFIED: index.tsx lines 644-652]

---

## Code Examples

### Verified: Current State Mount Logic (moves to screen + hooks)
```typescript
// Source: app/(tabs)/index.tsx lines 517-545
// After refactor: screen calls loadWorldState(), passes result to hooks
// useHomeScene handles loadFogState() and restoring cleared state
useEffect(() => {
  async function loadState() {
    const [state, fogState] = await Promise.all([
      loadWorldState(),
      loadFogState(),
    ]);
    setWorldState(state);
    if (fogState) {
      setClearedFog(new Set(fogState.clearedFogIds));
      setClearedLeaves(new Set(fogState.clearedLeafIds));
    }
    const today = getTodayKey();
    if (state.lastVisitDate === today) {
      // Transition to 'returning' phase
    }
  }
  loadState();
}, [FOG_WISPS, LEAVES]);
```

### Verified: FogWisp Animation Pattern (copy verbatim to FogWisp.tsx)
```typescript
// Source: app/(tabs)/index.tsx lines 145-174
useEffect(() => {
  if (cleared) {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: GAME_CONFIG.animation.fogClearDurationMs,
        useNativeDriver: true,
      }),
      // scale and translateY animations...
    ]).start();
  } else {
    // CRITICAL: reset on un-clear (used by resetMorning)
    opacity.setValue(1);
    scale.setValue(1);
    translateY.setValue(0);
  }
}, [cleared, opacity, scale, translateY]);
```

### Verified: Pan Gesture Pattern (moves to useHomeScene)
```typescript
// Source: app/(tabs)/index.tsx lines 615-642
const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    const touchX = event.x;
    const touchY = event.y;
    FOG_WISPS.forEach((wisp) => {
      if (!clearedFog.has(wisp.id)) {
        const dx = touchX - wisp.x;
        const dy = touchY - wisp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < wisp.size / 2 + GAME_CONFIG.scene.fogTouchRadiusBuffer) {
          handleClearFog(wisp.id);
        }
      }
    });
    // Same pattern for LEAVES...
  })
  .minDistance(0);
```

### Verified: GAME_CONFIG Import Pattern (scene components use this directly)
```typescript
// Source: app/(tabs)/index.tsx line 25; lib/storage.ts line 2
import { GAME_CONFIG } from '@/src/config/game';
```

### Verified: Storage Write Pattern (stays in hooks, not screen)
```typescript
// Source: app/(tabs)/index.tsx lines 662-663 (useCheckIn)
const updatedState = await recordDailyVisit(e);
setWorldState(updatedState); // → setPhase({ phase: 'quest', ... })

// Source: app/(tabs)/index.tsx lines 696-700 (useQuest)
await saveDailyRitual(emotion!, {
  id: `${getTodayKey()}-${emotion}`,
  emotion: emotion!,
  text: quest,
});
```

**Note on the quest ID pattern:** Current code uses `getTodayKey()-emotion` as quest ID (not the actual Quest.id from the data). This should be corrected to use `getRandomQuest(emotion).id` or the Quest object directly. Flag for planner — minor correctness improvement within scope.

[VERIFIED: index.tsx lines 694-700, src/data/quests.ts quest ID patterns]

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo |
| Config file | `jest.config.js` (project root) |
| Quick run command | `npm test` |
| Full suite command | `npm test -- --coverage` |
| AsyncStorage mock | Configured via `moduleNameMapper` in jest.config.js |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARCH-01 | useHomeScene clears fog, transitions phase | unit | `npm test hooks/useHomeScene.test.ts` | No — Wave 0 |
| ARCH-02 | useCheckIn selects emotion, calls recordDailyVisit | unit | `npm test hooks/useCheckIn.test.ts` | No — Wave 0 |
| ARCH-03 | useQuest completes quest, calls saveDailyRitual | unit | `npm test hooks/useQuest.test.ts` | No — Wave 0 |
| ARCH-04 | HomePhase type compiles exhaustively | TypeScript compile | `npx tsc --noEmit` | No — implicit |
| ARCH-05 | FogWisp/Leaf props accepted without error | TypeScript compile | `npx tsc --noEmit` | No — implicit |
| ARCH-06 | Deleted paths no longer importable | TypeScript compile | `npx tsc --noEmit` | No — implicit |
| ARCH-07 | n/a — human assessment | manual | n/a | n/a |

**Note on hook testing:** `renderHook` from `@testing-library/react-native` is the standard pattern for testing custom hooks. The Phase 3 test infrastructure installed `@testing-library/react-native` but hook tests have not been written yet.

[VERIFIED: jest.config.js, package.json devDependencies, lib/storage.test.ts as reference pattern]

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (type safety gate, no runtime needed)
- **Per wave merge:** `npm test` (all tests green)
- **Phase gate:** Full suite green + TypeScript clean before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `hooks/useHomeScene.test.ts` — covers ARCH-01 (fog clearing, phase transitions)
- [ ] `hooks/useCheckIn.test.ts` — covers ARCH-02 (emotion selection, storage write)
- [ ] `hooks/useQuest.test.ts` — covers ARCH-03 (quest done, storage write)
- [ ] Framework note: `react-hooks-testing-library` may be needed — check if `renderHook` is available in current `@testing-library/react-native` version

---

## Runtime State Inventory

> Step 2.5: SKIPPED — this is NOT a rename/refactor of persistent data identifiers. Phase 4 reorganizes TypeScript source files only. AsyncStorage keys (`world-state`, `daily-log:*`, `fog-cleared-state`, `first-lantern-seen`) are unchanged. No stored data migration required.

---

## Environment Availability

> Step 2.6: No new external dependencies. All required tools are already present in the development environment.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm scripts | Assumed | — | — |
| npm | Package scripts | Assumed | — | — |
| TypeScript | Type safety gate | Yes | ~5.9.2 | — |
| Jest + jest-expo | Hook unit tests | Yes | ^29.7.0 | — |

[VERIFIED: package.json, jest.config.js]

---

## Open Questions

1. **Quest object in phase variant vs. plain string**
   - What we know: `saveDailyRitual` requires `Quest` object; current code stores quest as `string`; phase variant `{ phase: 'quest'; quest: string }` only stores text
   - What's unclear: Whether to update the phase variant to carry the full Quest object, or have useCheckIn store it separately (ref or additional state)
   - Recommendation: Carry the full Quest object in the variant: `{ phase: 'quest'; emotion: Emotion; quest: Quest }`. Display with `phase.quest.text`. Pass to `saveDailyRitual` directly. Cleaner than a ref.

2. **`getSceneConfig` placement**
   - What we know: It's a pure function (no hooks, no side effects). It takes width/height/insets and returns scene positions. Currently defined in index.tsx lines 29-65.
   - What's unclear: Whether it belongs in `useHomeScene`, stays in index.tsx as a file-level utility, or moves to a separate utility file
   - Recommendation: Move into `useHomeScene` — it's called once per hook render with hook-owned dimensions, and it's scene-specific logic.

3. **RedPanda, Door, SpeechBubble — extract or leave in screen?**
   - What we know: These are already clean components with clear prop interfaces. They're specified in the UI-SPEC but CONTEXT.md marks them as "may stay or extract"
   - What's unclear: Whether the ~100-line target requires their extraction
   - Recommendation: Extract RedPanda, Door, and SpeechBubble to `src/components/scene/` to maximize home screen clarity and provide Allie with clear, individually readable components. The planner should include these extractions — they follow the same pattern as FogWisp/Leaf and the home screen won't approach 100 lines without them.

4. **`resetMorning` function ownership**
   - What we know: Currently in the screen component (lines 703-716). It sets multiple state pieces back to initial values. After hooks own state, resetting requires coordinating across hook boundaries.
   - What's unclear: Whether the screen calls reset functions on each hook, or there's a single reset path
   - Recommendation: useHomeScene owns the scene reset (clearedFog, clearedLeaves, doorOpen), and the screen drives it by resetting `phase` to `{ phase: 'idle' }`. Hooks observe the phase change and reset their state accordingly. The "Walk again" button just calls `setPhase({ phase: 'idle' })`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `src/components/` directory does not currently exist under `src/` | Architecture Patterns (Pattern 9) | Low risk — just means the directory already exists; no behavior change |
| A2 | Hook return type shapes are as described (Claude's discretion) | Architecture Patterns (Pattern 2) | Low risk — these are design recommendations, not locked decisions |
| A3 | `@testing-library/react-native` installed in Phase 3 includes `renderHook` | Validation Architecture | Medium risk — if not available, need to add `react-hooks-testing-library` separately |

---

## Project Constraints (from CLAUDE.md)

The following directives from the project's CLAUDE.md apply to Phase 4:

| Directive | Implication for Phase 4 |
|-----------|------------------------|
| `make one small change at a time` | Plans must be granular — one hook per plan, not all hooks in one task |
| `never refactor the whole project without permission` | Phase scope is locked: home screen + FogWisp/Leaf + dead code only |
| `stop after each major step and ask for confirmation` | Planner should include verification checkpoints between waves |
| `keep visuals simple until the logic is solid` | No visual changes in Phase 4 — preservation contract enforced |
| TypeScript strict mode | HomePhase union must be exhaustively handled in every switch |
| No `any` types | Hook type signatures must be fully typed |
| Named exports for utilities, default exports for screens | Hooks export named functions; screen keeps `export default function HomeScreen` |
| Import path alias `@/*` resolves to project root | New hook imports: `@/hooks/useHomeScene`, scene components: `@/src/components/scene/FogWisp` |
| Hook files: camelCase prefixed with `use-` | File naming: `use-home-scene.ts` pattern (or `useHomeScene.ts` per Claude's discretion — choose one and be consistent) |

[VERIFIED: CLAUDE.md Conventions section, CONVENTIONS.md]

---

## Sources

### Primary (HIGH confidence)
- `app/(tabs)/index.tsx` — Direct source inspection, all current state/handler logic verified
- `lib/storage.ts` — Direct source inspection, storage API verified
- `src/data/types.ts`, `src/data/quests.ts`, `src/data/feedback.ts` — Direct source inspection
- `src/config/game.ts` — Direct source inspection, GAME_CONFIG structure verified
- `.planning/phases/04-architecture-refactor/04-CONTEXT.md` — Locked decisions source
- `.planning/phases/04-architecture-refactor/04-UI-SPEC.md` — Locked visual contract and state machine
- `jest.config.js`, `lib/storage.test.ts` — Test infrastructure verified

### Secondary (MEDIUM confidence)
- `.planning/codebase/CONVENTIONS.md` — Convention analysis (April 2026)
- `.planning/codebase/STRUCTURE.md` — Structure analysis (April 2026)
- `.planning/codebase/ARCHITECTURE.md` — Architecture analysis (April 2026)

### Tertiary (LOW confidence)
- None — all claims verified from codebase inspection

---

## Metadata

**Confidence breakdown:**
- Current state inventory: HIGH — verified by direct source inspection
- Hook boundaries: HIGH — locked by CONTEXT.md decisions
- Animation patterns: HIGH — copied verbatim from index.tsx
- Test infrastructure: HIGH — verified from jest.config.js and package.json
- Hook return shapes: LOW (ASSUMED) — Claude's discretion, not locked

**Research date:** 2026-04-12
**Valid until:** Until Phase 4 execution begins — this research reflects the codebase state after Phase 3 completion
