# Requirements: Lanternkeeper: Emberfall

**Defined:** 2026-04-12
**Core Value:** The app makes the user feel understood, inspired, and less pressured — or it doesn't ship.

## v1 Requirements

Requirements for this milestone: Evaluate & Refine the Foundation.

### Game Mechanics Audit

- [ ] **MECH-01**: Produce a human-readable mechanics audit document covering every game parameter and mechanic with implications, risks, and remediation options
- [ ] **MECH-02**: Audit region unlock conditions — flag any emotion-specific gating that creates implicit hierarchy
- [ ] **MECH-03**: Audit emotion selection UX — verify no visual/ordering bias toward "positive" emotions
- [ ] **MECH-04**: Verify quest tone parity — Stuck/Frustrated quests feel as validating as Inspired/Alright quests
- [ ] **MECH-05**: Audit visit counting — confirm once per calendar day, not inflatable by reopening app
- [ ] **MECH-06**: Document fog/leaf gesture persistence decision — resets each visit or accumulates
- [ ] **MECH-07**: Extract all tunable game parameters to `src/config/game.ts` so Allie can adjust without code changes
- [ ] **MECH-08**: Flag `calculateStreak()` for removal — violates "no streaks" design pillar
- [ ] **MECH-09**: Audit quest pool exhaustion behavior — what happens when all 10 quests have been seen

### Project Infrastructure

- [ ] **INFR-01**: Set up MkDocs with Material theme and GitHub Pages deployment (same pattern as marketing-ops)
- [ ] **INFR-02**: Adopt structured CHANGELOG.md (AI state journal format from marketing-ops)
- [ ] **INFR-03**: Create initial docs site with game design goals, architecture overview, and design pillars
- [ ] **INFR-04**: Set up docs/whats-changed.md auto-generation from CHANGELOG.md

### Documentation & Source of Truth

- [ ] **DOCS-01**: Reconcile CLAUDE.md files — merge Dave's Godot architecture docs with Allie's design pillars and Aetherling voice rules
- [ ] **DOCS-02**: Document emotional acceptance criteria — pillar checks that apply to every future change
- [ ] **DOCS-03**: Populate docs site with game design docs (design pillars, Aetherling voice, core loop, micro-quests)
- [ ] **DOCS-04**: Document Aetherling voice rules as a standing review convention for any dialogue changes

### Storage & Data Integrity

- [ ] **STOR-01**: Consolidate dual storage layers (lib/storage.ts vs src/storage/storage.ts) into single source of truth
- [ ] **STOR-02**: Fix schema mismatch between storage layers that risks silent data loss
- [ ] **STOR-03**: Remove `calculateStreak()` function from storage
- [ ] **STOR-04**: Write round-trip unit test verifying daily log persistence
- [ ] **STOR-05**: Fix Emotion type duplication across files

### Architecture Refactor

- [ ] **ARCH-01**: Extract `useHomeScene` custom hook — separate game logic from home screen layout
- [ ] **ARCH-02**: Extract `useCheckIn` custom hook — encapsulate check-in flow logic
- [ ] **ARCH-03**: Extract `useQuest` custom hook — encapsulate quest selection and completion
- [ ] **ARCH-04**: Formalize home screen state as TypeScript discriminated union (replace 5+ boolean flags)
- [ ] **ARCH-05**: Isolate animation components (FogWisp, Leaf) into `src/components/scene/`
- [ ] **ARCH-06**: Remove dead code — unused `src/screens/`, `app/modal.tsx`, deprecated storage file
- [ ] **ARCH-07**: Ensure code is readable enough for Allie to learn from and contribute to

### Animation Performance

- [ ] **PERF-01**: Profile app on physical device to establish baseline before any animation changes
- [ ] **PERF-02**: Migrate fog/leaf gesture interactions to Reanimated worklets (off JS thread)
- [ ] **PERF-03**: Fix cold-start loading flicker
- [ ] **PERF-04**: Fix animation cleanup on reset (prevent memory leaks)
- [ ] **PERF-05**: Verify 60fps on mid-range Android device for gesture interactions

### Polish & Ship-Readiness

- [ ] **POLI-01**: Visual consistency pass — transitions, spacing, color harmony
- [ ] **POLI-02**: Fix any remaining mobile layout alignment issues
- [ ] **POLI-03**: Ensure the daily ritual experience feels complete and polished for Garrett

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Feature Extension

- **FEAT-01**: Quest skip/another option — low-pressure exit from a quest that doesn't fit today
- **FEAT-02**: Ambient world changes on return without check-in — invites return without demanding
- **FEAT-03**: Alright-specific region evaluation — the healthiest emotion currently has no dedicated world space
- **FEAT-04**: Expanded quest pools per emotion
- **FEAT-05**: Seasonal world aesthetics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync / backend | Local-only by design — keeps it simple and private |
| Social features | Solo companion, not a community app |
| Monetization | This is a gift for Garrett |
| Push notifications | Intrudes on ritual's on-demand nature |
| Streaks / scores / badges | Violates "less pressured" pillar — documented anti-feature |
| Emotion history charts | Turns honesty into data collection, creates selection pressure |
| AI-generated content | Aetherling's voice is hand-crafted, not generated |
| Difficulty progression | Not a challenge game — equally accessible day 1 and day 100 |
| Cross-platform web | Mobile-first, mobile-only for now |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFR-01 | Phase 1 | Pending |
| INFR-02 | Phase 1 | Pending |
| INFR-03 | Phase 1 | Pending |
| INFR-04 | Phase 1 | Pending |
| DOCS-01 | Phase 1 | Pending |
| DOCS-02 | Phase 1 | Pending |
| DOCS-03 | Phase 1 | Pending |
| DOCS-04 | Phase 1 | Pending |
| MECH-01 | Phase 2 | Pending |
| MECH-02 | Phase 2 | Pending |
| MECH-03 | Phase 2 | Pending |
| MECH-04 | Phase 2 | Pending |
| MECH-05 | Phase 2 | Pending |
| MECH-06 | Phase 2 | Pending |
| MECH-07 | Phase 2 | Pending |
| MECH-08 | Phase 2 | Pending |
| MECH-09 | Phase 2 | Pending |
| STOR-01 | Phase 3 | Pending |
| STOR-02 | Phase 3 | Pending |
| STOR-03 | Phase 3 | Pending |
| STOR-04 | Phase 3 | Pending |
| STOR-05 | Phase 3 | Pending |
| ARCH-01 | Phase 4 | Pending |
| ARCH-02 | Phase 4 | Pending |
| ARCH-03 | Phase 4 | Pending |
| ARCH-04 | Phase 4 | Pending |
| ARCH-05 | Phase 4 | Pending |
| ARCH-06 | Phase 4 | Pending |
| ARCH-07 | Phase 4 | Pending |
| PERF-01 | Phase 5 | Pending |
| PERF-02 | Phase 5 | Pending |
| PERF-03 | Phase 5 | Pending |
| PERF-04 | Phase 5 | Pending |
| PERF-05 | Phase 5 | Pending |
| POLI-01 | Phase 6 | Pending |
| POLI-02 | Phase 6 | Pending |
| POLI-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after roadmap creation*
