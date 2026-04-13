# Phase 4: Architecture Refactor - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Decompose the 1296-line home screen monolith into composable hooks and scene components, formalize the home screen state as a TypeScript discriminated union, isolate FogWisp/Leaf into `src/components/scene/`, remove dead code, and delete duplicated data — making the codebase navigable for Allie to learn from and contribute to. No gameplay behavior changes.

</domain>

<decisions>
## Implementation Decisions

### State Machine Design
- **D-01:** Coarse phases — 5-7 high-level states modeling the ritual flow: `idle`, `clearing`, `transitioning`, `check-in`, `quest`, `feedback`, `complete`, `returning`. Animation details (door opening, panda walking progress) are internal to hooks, not app-level state
- **D-02:** Separate `returning` phase for "already checked in today" — self-documenting for Allie, matches the ritual intent (Aetherling saying "welcome back" is a distinct moment), and makes it trivial to differentiate the return experience later
- **D-03:** The discriminated union carries contextual data on phases that need it: `quest` phase carries `emotion` and `quest` text, `feedback` phase carries `emotion` and `line`

### Hook Boundaries
- **D-04:** Screen owns the HomePhase state machine — `app/(tabs)/index.tsx` holds `useState<HomePhase>` and passes phase + setPhase to hooks. Screen is the orchestrator (~100 lines of JSX composing hook returns). Allie reads one file to see the full flow
- **D-05:** Three hooks as specified: `useHomeScene` (fog/leaf clearing, walk animation, pan gesture), `useCheckIn` (emotion selection, daily visit recording), `useQuest` (quest selection, completion, feedback)
- **D-06:** Hooks set dialogue text — dialogue is game logic co-located with the action that triggers it. Each hook calls a setDialogue callback when state transitions happen (e.g., "The fog begins to lift..." set inside handleClearFog)
- **D-07:** Screen loads worldState once on mount, passes to hooks that need it. Single load, single source of truth. Hooks stay pure logic — they don't call storage directly for reads

### Animation Isolation
- **D-08:** FogWisp and Leaf move to `src/components/scene/FogWisp.tsx` and `src/components/scene/Leaf.tsx`. They keep their current prop interface (position + cleared + onClear) and own their animation state internally
- **D-09:** Components import `GAME_CONFIG` directly — they're Lanternkeeper-specific scene pieces, not generic. Keeps props clean and Allie edits config in one place
- **D-10:** Pan gesture (fog/leaf hit detection via swipe) moves into `useHomeScene` hook. Screen just wraps JSX in `<GestureDetector gesture={scene.panGesture}>`

### Readability for Allie
- **D-11:** Flow comments — short comments at each phase transition and hook boundary explaining what happens next in the ritual flow. Not JSDoc, not line-by-line — breadcrumbs Allie can follow through the code
- **D-12:** Delete inline QUESTS and FEEDBACK objects from home screen (lines 74-126). Import `getRandomQuest` and `getRandomFeedback` from `src/data/`. Single source of truth for game content
- **D-13:** Hooks in `hooks/` directory: `useHomeScene.ts`, `useCheckIn.ts`, `useQuest.ts`. Scene components in `src/components/scene/`. Home screen shrinks to ~100 lines of JSX

### Dead Code Removal
- **D-14:** Delete `src/screens/` directory (HomeScreen.tsx, CheckInScreen.tsx, QuestScreen.tsx, IdeaSeedScreen.tsx) — legacy templates not used by Expo Router
- **D-15:** Delete `app/modal.tsx` — unused template
- **D-16:** Verify `src/storage/storage.ts` is already gone (Phase 3 deleted it). If any remnants exist, clean them up

### Claude's Discretion
- Internal animation state management within FogWisp/Leaf (Animated.Value patterns)
- Exact HomePhase union variant names (the concepts are locked, naming is flexible)
- Whether `getSceneConfig()` stays as a utility function or moves into useHomeScene
- Hook return type shapes (what each hook exposes to the screen)
- Whether to add a `types.ts` for HomePhase or co-locate it with the screen

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Home Screen (the monolith to decompose)
- `app/(tabs)/index.tsx` — 1296-line file with 14 useState hooks, inline FogWisp/Leaf components, duplicated quest/feedback data. This is the primary refactor target
- `app/(tabs)/explore.tsx` — Imports from lib/storage, may need import updates
- `app/(tabs)/_layout.tsx` — Tab navigation, should not need changes

### Data Layer (already clean from Phase 3)
- `lib/storage.ts` — Single storage layer. Hooks will call storage functions for writes
- `src/data/types.ts` — Canonical type definitions. HomePhase union type should live here or near the screen
- `src/data/quests.ts` — Quest pool + getRandomQuest. Home screen should import instead of duplicating
- `src/data/feedback.ts` — Feedback lines + getRandomFeedback. Home screen should import instead of duplicating
- `src/config/game.ts` — GAME_CONFIG. Scene components import directly

### Dead Code (to delete)
- `src/screens/CheckInScreen.tsx` — Legacy template, not routed
- `src/screens/HomeScreen.tsx` — Legacy template, not routed
- `src/screens/QuestScreen.tsx` — Legacy template, not routed
- `src/screens/IdeaSeedScreen.tsx` — Legacy template, not implemented
- `app/modal.tsx` — Unused modal template

### Codebase Analysis
- `.planning/codebase/ARCHITECTURE.md` — Current architecture patterns and data flow
- `.planning/codebase/STRUCTURE.md` — Directory layout and file purposes
- `.planning/codebase/CONVENTIONS.md` — Naming and code style conventions

### Prior Phase Context
- `.planning/phases/03-storage-data-integrity/03-CONTEXT.md` — Storage consolidation decisions. lib/storage.ts is the surviving layer, test foundation installed

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FogWisp` function (lines 130-194): Already a separate component with clear props interface — extract to file as-is
- `Leaf` function (lines 197-277): Same pattern as FogWisp — extract to file as-is
- `getSceneConfig()` function (lines 29-65): Pure function generating positions from screen dimensions — can stay as utility or move into hook
- Existing hooks in `hooks/`: `use-color-scheme.ts`, `use-theme-color.ts` — establishes the hooks directory pattern

### Established Patterns
- Props-based component design: FogWisp/Leaf already receive position + cleared + onClear
- GAME_CONFIG import pattern: `import { GAME_CONFIG } from '@/src/config/game'`
- AsyncStorage wrapper pattern: typed interfaces, try-catch with silent fallback
- Named exports for utilities, default exports for screen components

### Integration Points
- `app/(tabs)/index.tsx` is the sole consumer of all logic being extracted — no other files import from it
- Pan gesture wraps the scene view — GestureDetector stays in JSX, gesture object comes from hook
- `loadWorldState()` and `loadFogState()` called on mount — screen owns the load, hooks receive the data

</code_context>

<specifics>
## Specific Ideas

- Coarse state machine chosen because animation sequencing (door open → walk → arrive) is an internal concern of hooks, not app-level state. Allie can name the 7-8 phases in plain English — that's the readability test
- Separate `returning` phase chosen because "welcome back" is a distinct ritual moment, not leftover state — matches how Aetherling would think about it
- Screen-as-orchestrator chosen so Allie can open one file and trace the full ritual flow without diving into hooks unless she wants to understand a specific piece
- Flow comments (not JSDoc) because Allie is learning to read code, not learning to read API docs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-architecture-refactor*
*Context gathered: 2026-04-12*
