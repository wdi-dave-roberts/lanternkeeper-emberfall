# Phase 4: Architecture Refactor - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 04-architecture-refactor
**Areas discussed:** State machine design, Hook boundaries, Animation isolation, Readability for Allie

---

## State Machine Design

| Option | Description | Selected |
|--------|-------------|----------|
| Coarse phases | 5-7 high-level states matching ritual flow. Animation details internal to hooks. | ✓ |
| Fine-grained phases | 10-12 states mapping closely to current booleans. More explicit but more complex. | |
| You decide | Claude picks based on animation code needs | |

**User's choice:** Coarse phases
**Notes:** User asked for help deciding. Analysis showed the 14 booleans cluster into 3 groups (scene interaction, panda animation, check-in flow). Animation sequencing (door open → walk → arrive) is internal to hooks, not app-level state. Coarse phases map to how Allie thinks about the flow.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Flag on complete | `{ phase: 'complete', returningToday: true }` — simpler, one fewer state | |
| Separate 'returning' phase | `{ phase: 'returning' }` — self-documenting, easier to differentiate later | ✓ |
| You decide | Claude picks during implementation | |

**User's choice:** Separate 'returning' phase
**Notes:** User asked for strong recommendation. Recommended separate phase because: (1) this is a ritual app — "welcome back" is a distinct moment, not leftover state; (2) adding one variant to a discriminated union is free — no runtime cost, one extra case in render; (3) self-documenting for Allie.

---

## Hook Boundaries

| Option | Description | Selected |
|--------|-------------|----------|
| Screen owns phase | Home screen holds HomePhase state, hooks receive phase + setPhase. Screen is orchestrator. | ✓ |
| Coordinator hook owns phase | useHomeScene owns phase state, exposes it. Screen is pure JSX. | |
| You decide | Claude picks for clearest code | |

**User's choice:** Screen owns phase
**Notes:** None — user selected recommended option directly.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hooks set dialogue | Each hook sets dialogue when it transitions. Co-located with game logic. | ✓ |
| Phase-to-dialogue map | Static mapping from phase to dialogue text. Loses contextual messages. | |
| You decide | Claude picks during implementation | |

**User's choice:** Hooks set dialogue
**Notes:** None — user selected recommended option directly.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Screen loads, hooks receive | Screen calls loadWorldState() on mount, passes to hooks. Single load. | ✓ |
| Hooks load independently | Each hook calls storage when needed. Risks multiple loads. | |
| You decide | Claude picks based on data dependencies | |

**User's choice:** Screen loads, hooks receive
**Notes:** None — user selected recommended option directly.

---

## Animation Isolation

| Option | Description | Selected |
|--------|-------------|----------|
| Import GAME_CONFIG directly | Components import from @/src/config/game. Props stay clean. | ✓ |
| Receive config as props | Parent passes animation config as props. More flexible but prop bloat. | |
| You decide | Claude picks for cleanest components | |

**User's choice:** Import GAME_CONFIG directly
**Notes:** User asked for implications explained. Key factors: (1) props stay at 6 instead of 11+; (2) components are Lanternkeeper-specific, not generic; (3) Allie edits config in one place; (4) prop-based approach solves a reusability problem that doesn't exist.

---

| Option | Description | Selected |
|--------|-------------|----------|
| useHomeScene hook | Gesture is scene interaction logic, belongs with scene state. | ✓ |
| Keep in screen | Gesture stays alongside JSX. Simpler but keeps game logic in screen. | |
| You decide | Claude picks for cleanest separation | |

**User's choice:** useHomeScene hook
**Notes:** None — user selected recommended option directly.

---

## Readability for Allie

| Option | Description | Selected |
|--------|-------------|----------|
| Flow comments | Short comments at phase transitions explaining what happens next in the ritual. | ✓ |
| Minimal comments | Self-documenting through naming. Comments only where surprising. | |
| Rich file headers | File-level orientation blocks, less inline commenting. | |
| You decide | Claude decides during implementation | |

**User's choice:** Flow comments
**Notes:** None — user selected recommended option directly.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Delete and import | Remove inline QUESTS/FEEDBACK, import from src/data/. Single source of truth. | ✓ |
| Keep local copies | Might be intentionally different subsets. Investigate first. | |
| You decide | Claude checks and acts accordingly | |

**User's choice:** Delete and import
**Notes:** None — user selected recommended option directly.

---

| Option | Description | Selected |
|--------|-------------|----------|
| hooks/ directory | useHomeScene.ts, useCheckIn.ts, useQuest.ts in hooks/. Scene components in src/components/scene/. | ✓ |
| Co-locate with screen | Hooks in app/(tabs)/ alongside screen. Fewer directories but mixes concerns. | |
| You decide | Claude picks based on conventions | |

**User's choice:** hooks/ directory
**Notes:** None — user selected recommended option directly.

---

## Claude's Discretion

- Internal animation state management within FogWisp/Leaf
- Exact HomePhase union variant names
- Whether getSceneConfig() stays as utility or moves into useHomeScene
- Hook return type shapes
- Whether HomePhase type goes in types.ts or co-located with screen

## Deferred Ideas

None — discussion stayed within phase scope
