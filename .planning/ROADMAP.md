# Roadmap: Lanternkeeper: Emberfall

## Overview

This milestone is not a build — it is a reckoning. Allie's prototype works. Before anything is extended or refactored, this roadmap establishes a transparent foundation (docs site, CHANGELOG), audits the game for unintended pressure mechanics (with Allie, collaboratively), then executes a staged technical refinement: storage first, then architecture, then animation performance, and finally polish. Each phase gates the next. Feature work waits until the foundation is trustworthy.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Infrastructure** - Set up MkDocs docs site, CHANGELOG, and documentation so all subsequent changes are transparently recorded
- [ ] **Phase 2: Game Mechanics Audit** - Human-readable audit of every mechanic and parameter, done collaboratively with Allie before any code is touched
- [ ] **Phase 3: Storage & Data Integrity** - Consolidate duplicate storage layers, fix schema mismatch, eliminate calculateStreak, write round-trip test
- [ ] **Phase 4: Architecture Refactor** - Extract custom hooks, formalize home screen state machine, isolate animation components, remove dead code
- [ ] **Phase 5: Animation Performance** - Profile on physical device, migrate gesture interactions to Reanimated worklets, fix cold-start flicker
- [ ] **Phase 6: Polish & Ship-Readiness** - Visual consistency pass, layout fixes, and final feel verification before gifting to Garrett

## Phase Details

### Phase 1: Project Infrastructure
**Goal**: The project has a living docs site and structured CHANGELOG so every subsequent change is transparently documented and the codebase has a single source of truth
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):
  1. MkDocs site deploys to GitHub Pages and is publicly viewable
  2. CHANGELOG.md exists and follows the AI state journal format — first entry captures project state at milestone start
  3. Docs site contains game design goals, design pillars, Aetherling voice rules, core loop, and micro-quest content
  4. CLAUDE.md is a single reconciled file — Godot architecture docs removed, design pillars and voice rules are the canonical source
  5. Emotional acceptance criteria are documented as pillar checks that apply to every future change
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — MkDocs infrastructure, GitHub Actions workflows, CHANGELOG pipeline
- [ ] 01-02-PLAN.md — Docs site content (Game Design + Dev Reference pages)
- [ ] 01-03-PLAN.md — CLAUDE.md reconciliation and planning artifact cleanup

**UI hint**: yes

### Phase 2: Game Mechanics Audit
**Goal**: Every game mechanic and parameter is documented in a human-readable audit, unintended pressure signals are surfaced and flagged, and Dave and Allie share a common understanding of what the prototype actually does
**Depends on**: Phase 1
**Requirements**: MECH-01, MECH-02, MECH-03, MECH-04, MECH-05, MECH-06, MECH-07, MECH-08, MECH-09
**Success Criteria** (what must be TRUE):
  1. A mechanics audit document exists that a non-developer (Allie) can read and understand — covering every parameter, mechanic, and its emotional implications
  2. All tunable game parameters live in src/config/game.ts — Allie can change fog count, unlock thresholds, or animation durations without touching game logic
  3. Region unlock conditions have been reviewed and any emotion-specific gating (e.g., inspiredCount >= 3) is flagged with explicit remediation recommendation
  4. Emotion selection UX has been verified — no visual or ordering bias toward "positive" emotions
  5. calculateStreak() is documented as a design violation and marked for removal in Phase 3
**Plans**: TBD

### Phase 3: Storage & Data Integrity
**Goal**: The app has a single, trustworthy storage layer — no silent data loss, no schema drift, no duplicate files, no streak logic waiting to corrupt the ritual
**Depends on**: Phase 2
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05
**Success Criteria** (what must be TRUE):
  1. Only one storage file exists (lib/storage.ts) — src/storage/storage.ts is deleted
  2. A round-trip unit test passes: write a daily log entry, read it back, verify it matches
  3. calculateStreak() is gone — no streak function exists anywhere in the codebase
  4. Emotion type is defined in exactly one place — no duplication across files
  5. App starts fresh after clearing storage and daily log data round-trips without corruption
**Plans**: TBD

### Phase 4: Architecture Refactor
**Goal**: The codebase has a clean 4-layer structure — screens compose hooks, hooks own logic, storage is pure read/write, config is at the bottom — and is readable enough for Allie to learn from and contribute to
**Depends on**: Phase 3
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, ARCH-07
**Success Criteria** (what must be TRUE):
  1. Home screen state is a TypeScript discriminated union — no more than one boolean flag manages phase transitions
  2. useHomeScene, useCheckIn, and useQuest hooks exist and own all game logic — the home screen file contains only layout and component composition
  3. Fog and leaf animation components live in src/components/scene/ — self-contained, receiving props rather than managing global state
  4. Dead code is deleted — src/screens/, app/modal.tsx, and deprecated storage files are gone
  5. Allie can open any screen file and trace the flow from user action to storage without needing to read more than two files
**Plans**: TBD

### Phase 5: Animation Performance
**Goal**: Fog and leaf gesture interactions run on the UI thread and feel smooth on a physical mid-range Android device — the most important moment of the ritual is not janky
**Depends on**: Phase 4
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05
**Success Criteria** (what must be TRUE):
  1. A profiling baseline has been captured on a physical device before any animation code changes
  2. Fog and leaf clearing gestures run on the UI thread via Reanimated worklets — not the JS thread
  3. Cold-start loading flicker is gone — the app renders cleanly on first open
  4. Animation values are cleaned up on reset — no memory leak after repeated sessions
  5. Gesture interactions maintain 60fps on a mid-range Android device
**Plans**: TBD

### Phase 6: Polish & Ship-Readiness
**Goal**: The daily ritual experience feels complete and polished — Garrett can open the app on any day and it feels like something made with care
**Depends on**: Phase 5
**Requirements**: POLI-01, POLI-02, POLI-03
**Success Criteria** (what must be TRUE):
  1. Transitions between screens feel intentional — no jarring cuts, no layout jumps
  2. Mobile layout alignment is consistent across screen sizes — no elements misaligned on standard phone dimensions
  3. The full daily ritual (fog clearing, leaf brushing, emotion check-in, micro-quest, feedback line) can be completed without encountering visual inconsistency or broken feel
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Infrastructure | 0/3 | Planning complete | - |
| 2. Game Mechanics Audit | 0/? | Not started | - |
| 3. Storage & Data Integrity | 0/? | Not started | - |
| 4. Architecture Refactor | 0/? | Not started | - |
| 5. Animation Performance | 0/? | Not started | - |
| 6. Polish & Ship-Readiness | 0/? | Not started | - |
