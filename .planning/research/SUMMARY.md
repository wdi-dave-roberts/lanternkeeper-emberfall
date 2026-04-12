# Project Research Summary

**Project:** Lanternkeeper: Emberfall
**Domain:** Calm/ritual companion mobile game — Expo + React Native prototype refinement
**Researched:** 2026-04-11
**Confidence:** HIGH (codebase examined directly; architecture and pitfall findings verified against actual code)

## Executive Summary

Lanternkeeper: Emberfall is not a greenfield build — it is a vibe-coded prototype that already implements the full core loop. The research task is not "what to build" but "how to make what exists trustworthy, coherent, and ready for intentional extension." The stack is locked and modern (Expo 54, RN 0.81.5, Reanimated 4, New Architecture enabled, React Compiler on). The architecture has good bones but needs structural cleanup: dead code to remove, duplicate storage layers to consolidate, magic numbers to extract, and animation logic to migrate from the Animated API to Reanimated worklets for gesture-critical paths.

The most dangerous work ahead is not technical — it is maintaining the emotional integrity of the prototype through the refactoring process. The existing design pillars (understood, inspired, less pressured) must be treated as acceptance criteria, not aspirations. Specific mechanics that appear to be design decisions are actually hidden landmines: region unlocks gated on specific emotion types create an implicit hierarchy that corrupts the ritual. The calculateStreak() function in storage — not yet wired to UI — is a pressure loop waiting to happen. These must be addressed before any feature work begins.

The recommended approach is a staged audit-then-build process: (1) establish emotional acceptance criteria before touching code, (2) consolidate storage and eliminate dead code, (3) audit game mechanics for unintended pressure signals, (4) migrate gesture animations to Reanimated, (5) refactor structure into hooks/config/components, and only then (6) extend features. Skipping steps 1-5 and jumping to new features risks building on a cracked foundation — the app would grow but feel wrong.

## Key Findings

### Recommended Stack

The base stack requires no changes. The additions needed are targeted: Zustand 5 for centralized world state (replacing scattered AsyncStorage calls and eliminating race conditions between screens), a src/config/game.ts TypeScript const file for all tunable parameters (no new dependency — a file to create), and React Native DevTools + Expo Developer Menu for profiling (both already built in). React Native Skia (2.2.3, Expo SDK 54 compatible) is the right upgrade for fog/leaf particle rendering IF profiling shows View-based animation is dropping frames on Android — but should not be added preemptively.

**Core technologies:**
- Reanimated 4.1.1 (already installed): All gesture-driven animations — runs on UI thread, bypasses JS entirely. Migrate fog/leaf gestures to worklets as priority.
- Zustand 5.0.12: Replace scattered AsyncStorage pattern with a typed, persisted store. Install: `npm install zustand`.
- src/config/game.ts (file to create): Single source of truth for region unlock thresholds, animation durations, fog/leaf counts. No library needed.
- React Native DevTools (built-in): Primary profiler. Press `j` in Expo CLI. No install.
- React Native Skia 2.2.3 (conditional): GPU-rendered particles if profiling identifies View-based animation as the bottleneck. Install only after profiling.

**What NOT to add:** Flipper (deprecated), Redux (overkill), React Native Game Engine (wrong abstraction), manual useMemo/useCallback (React Compiler handles memoization), MMKV (faster than AsyncStorage but unnecessary at this data volume).

### Expected Features

The core loop is fully implemented. Research focus is auditing what exists for unintended gameplay implications, not building new features.

**Must validate before building further:**
- Emotion naming and visual presentation — no implicit "right answer" signal
- Region unlock thresholds — currently emotion-specific (CRITICAL: creates hierarchy)
- Quest pool fallback behavior — what happens when pool exhausts
- Visit counting — must be once per calendar day, not inflatable
- Fog/leaf state persistence — intentional design decision, not oversight
- Quest tone parity — do Stuck quests feel as validating as Inspired quests

**Should add (v1.x after audit):**
- Quest skip/another option — low-pressure exit from a quest that does not fit today
- Ambient world changes on return without check-in — invites return without demanding it
- Alright-specific region — the healthiest emotional state currently has no dedicated world space

**Defer (v2+):**
- Seasonal world aesthetics, expanded quest pools, world detail that deepens with total visits

**Anti-features to protect against permanently:** streaks, score/points, emotion history charts, push notifications, achievement badges, social sharing, difficulty progression.

### Architecture Approach

The right structure is a 4-layer system: Route layer (navigation gates only) → Screen layer (layout and component composition) → Hook layer (all game logic, storage calls, state) → Data layer (static data, config, storage reads/writes). The key structural moves: extract useHomeScene, useCheckIn, and useQuest custom hooks; create src/config/game.ts; move animation components to src/components/scene/; delete dead code in src/screens/ and src/storage/storage.ts; remove calculateStreak(). The home screen state machine (currently 5+ interdependent booleans) must become an explicit TypeScript union type before any new features are added.

**Major components:**
1. Route files (app/) — navigation and onboarding gate only; no business logic
2. Custom hooks (src/hooks/) — own all game logic, storage calls, state derivation; screens call hooks, not storage
3. Animation components (src/components/scene/) — self-contained, receive position/cleared props, manage own animation values
4. lib/storage.ts — pure read/write; no upward dependencies; no UI knowledge
5. src/config/game.ts — bottom of dependency graph; imported by storage and hooks
6. src/data/ — pure static data; no logic; no imports

### Critical Pitfalls

1. **Improving the soul out of the prototype** — Document emotional acceptance criteria before touching any code. After every significant change, run a pillar check: does the user feel more understood, more inspired, less pressured? The drier, simpler version of any interaction is usually more correct.

2. **Region unlocks creating a pressure loop** — Any unlock condition referencing a specific emotion type (inspiredCount >= 3) creates an implicit emotional hierarchy. Users learn to select "correctly" rather than honestly. Audit all unlock conditions; replace emotion-specific gates with visit-count or visit-total equivalents. Highest-stakes mechanics decision.

3. **Duplicate storage schemas causing silent data loss** — lib/storage.ts and src/storage/storage.ts coexist. Schema drift causes the app to "forget" completed rituals — the most trust-destroying failure for a companion app. Storage consolidation is the mandatory first technical task.

4. **Animated API JS-thread jank on gesture interactions** — Fog/leaf clearing gestures run distance checks on the JS thread on every touch frame. On mid-range Android, this degrades the most important moment of the ritual. Migrate to Reanimated worklets (already a dependency — this is a migration, not a new install).

5. **State machine explosion from boolean flag accumulation** — The home screen has 5+ interdependent booleans with no formal state machine. Extract to a TypeScript discriminated union before building anything new.

6. **Voice drift toward generic warmth** — Aetherling's value is restraint. Any copy edit toward "encouragement" destroys the companion relationship. Voice check must be a standing PR convention for any dialogue change.

## Implications for Roadmap

Based on combined research, the work divides into 5 phases with strict ordering enforced by dependencies.

### Phase 1: Foundation — Emotional Criteria + Storage Consolidation
**Rationale:** Storage schema corruption causes silent data loss before any other work. Emotional acceptance criteria must exist before code is touched — otherwise there is no baseline to defend against soul-loss during refactoring.
**Delivers:** Single storage layer; documented emotional experience criteria; dead code removed; calculateStreak() deleted.
**Addresses:** Table stakes persistence, visit counting validation.
**Avoids:** Duplicate storage schemas (Pitfall 5), soul-lost-to-refactoring (Pitfall 1).
**Key tasks:** Write emotional acceptance criteria doc; delete src/storage/storage.ts and app/modal.tsx; consolidate to lib/storage.ts; remove calculateStreak(); fix Emotion type duplication; write round-trip unit test.

### Phase 2: Game Mechanics Audit
**Rationale:** Mechanics must be verified for unintended pressure signals before architecture is restructured. Restructuring first encodes broken mechanics into cleaner code — more work to fix later.
**Delivers:** Verified mechanics with no emotion hierarchy in unlock conditions; all tunable values in src/config/game.ts.
**Addresses:** Region unlock integrity, quest parity, fog/leaf persistence decision, day-rollover fix.
**Avoids:** Region unlock pressure loop (Pitfall 2), emotion selection hierarchy.
**Key tasks:** Audit all unlock conditions — replace emotion-specific gates with visit-count equivalents; create src/config/game.ts; verify UTC day comparison; audit quest tone parity; decide on fog/leaf persistence.

### Phase 3: Architecture Refactor
**Rationale:** With mechanics validated and storage consolidated, the home screen can be safely restructured. State machine formalization is a prerequisite for any new feature work.
**Delivers:** Readable single-responsibility files; formal home screen state machine; hook layer separating logic from layout.
**Addresses:** Code learnability, maintainability for future feature work.
**Avoids:** State machine explosion (Pitfall 4), logic-in-screen anti-pattern, inline data duplication.
**Key tasks:** Extract useHomeScene, useCheckIn, useQuest hooks; move animation components to src/components/scene/; formalize home screen state as TypeScript discriminated union; delete src/screens/ (unused legacy).

### Phase 4: Animation Performance
**Rationale:** Animation migration is deferred until after architecture refactor because migrating to Reanimated worklets is easier when each animation component is in its own isolated file.
**Delivers:** 60fps fog/leaf gesture interactions on mid-range Android; gesture callbacks on UI thread; animation values in refs not React state.
**Addresses:** Physical Android device feel, cold-start loading flicker, animation cleanup on reset.
**Avoids:** Animated API JS-thread jank (Pitfall 3), animation ref memory leak.
**Key tasks:** Profile before migrating anything; migrate fog/leaf clearing gestures to Reanimated worklets; migrate Aetherling walk to withRepeat declarative; fix cold-start flicker; fix animation cleanup in reset; test on physical mid-range Android.

### Phase 5: Feature Extension
**Rationale:** Only after foundation, mechanics, structure, and performance are validated should new features be added.
**Delivers:** Quest skip/another option; ambient world change on return; Alright region evaluation.
**Addresses:** v1.x feature additions from FEATURES.md.
**Avoids:** Building correct features on broken mechanics.

### Phase Ordering Rationale

- Storage consolidation gates everything: no feature work is reliable until the read/write layer is coherent.
- Mechanics audit gates architecture refactor: encoding broken mechanics into clean code creates double the work.
- Architecture refactor gates animation migration: isolated files are prerequisites for clean Reanimated migration.
- Feature work is last: this is the discipline most likely to be violated under time pressure — the research strongly supports holding the line.
- Emotional acceptance criteria span all phases: the pillar check is not a Phase 1 deliverable, it is a standing constraint.

### Research Flags

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 3 (Architecture Refactor):** Custom hook extraction and component isolation are well-documented React Native patterns. ARCHITECTURE.md provides concrete examples.
- **Phase 4 (Animation Performance):** Reanimated worklet migration path is well-documented. STACK.md covers the exact Reanimated 4 rules needed.

Phases that may benefit from targeted research during planning:
- **Phase 2 (Game Mechanics Audit):** The emotion-to-region-unlock redesign has no off-the-shelf pattern. The alternative mechanic (visit-count vs. completion-based unlocks) needs a design decision with explicit tradeoff evaluation.
- **Phase 5 (Feature Extension):** Quest skip UX patterns in companion apps worth a quick look — specifically how Finch implements skipping without making the declined quest feel like failure.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Base stack locked and verified. Zustand 5 and Skia version confirmed against official sources. React Compiler behavior confirmed via official React blog. |
| Features | MEDIUM | Core loop is implemented; audit findings are inference from code analysis and genre research, not user testing. Parameter tuning norms drawn from analogous games. |
| Architecture | HIGH | Codebase examined directly. Patterns verified against official React Native docs and Reanimated docs. Concrete before/after examples provided. |
| Pitfalls | HIGH | Six critical pitfalls grounded in actual codebase issues (CONCERNS.md referenced directly). Not theoretical — these are observed problems in existing code. |

**Overall confidence:** HIGH for audit/refactor work. MEDIUM for feature extension decisions (depends on mechanics audit outcomes).

### Gaps to Address

- **Emotion-to-region unlock redesign:** Research identifies the problem clearly but the right alternative mechanic is a design decision, not a research finding. Flag as explicit product decision point.
- **Physical device testing:** Animation performance assessments based on code analysis and documented Reanimated behavior. Actual performance on mid-range Android needs validation in Phase 4.
- **Fog/leaf persistence design decision:** Whether fog resets each visit or accumulates is undecided. Meaningful UX implications — decide in Phase 2 before architecture work encodes either assumption.
- **Zustand vs. Context for WorldState:** ARCHITECTURE.md recommends Context; STACK.md recommends Zustand. Resolve during Phase 3 planning based on actual state-sharing needs across screens.

## Sources

### Primary (HIGH confidence)
- Expo Debugging docs (docs.expo.dev/debugging/tools/) — React Native DevTools, Expo Developer Menu
- Reanimated Performance docs (docs.swmansion.com/react-native-reanimated/docs/guides/performance/) — Worklet rules, New Architecture flags
- Expo SDK 54 Skia version (docs.expo.dev/versions/latest/sdk/skia/) — Version 2.2.3 confirmed
- React Compiler 1.0 (react.dev/blog/2025/10/07/react-compiler-1) — Production-ready, auto-memoization
- Project codebase analysis: .planning/codebase/CONCERNS.md — Direct examination of existing code issues

### Secondary (MEDIUM confidence)
- Zustand npm page — Version 5.0.12, React 19 compatibility
- Callie app case study on expo.dev blog — Skia in cozy game context
- Designing for Coziness (Kitfox Games / Tanya X. Short) — Genre expectations and anti-features
- Finch App review and mechanics analysis — Companion app feature comparison

### Tertiary (MEDIUM-LOW confidence)
- Game balance and parameter tuning (gamedesignskills.com) — Region unlock threshold norms from analogous games, not validated for this audience
- Ritual Features: The Quiet Strategy Behind Daily Puzzle Games — Ritual vs. habit distinction

---
*Research completed: 2026-04-11*
*Ready for roadmap: yes*
