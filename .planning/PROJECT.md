# Lanternkeeper: Emberfall

## What This Is

A calm, ritual-based mobile companion game for solo indie developers. A red panda named Aetherling walks alongside the player through a world called Emberfall, offering emotion check-ins, micro-quests, and quiet encouragement — never pressure. Built with Expo + React Native as a gift for Garrett (solo indie game dev building a game called Atlas), and as a bonding/learning project between Dave and Allie.

Allie built a working prototype through vibe coding — fog clearing, leaf brushing, emotion check-ins, micro-quests, region unlocks. This milestone is about evaluating and refining that foundation before building further.

## Core Value

The app makes the user feel understood, inspired, and less pressured — or it doesn't ship.

## Requirements

### Validated

- ✓ Interactive fog clearing and leaf brushing gestures — existing
- ✓ Emotion check-in flow (Stuck / Frustrated / Inspired / Alright) — existing
- ✓ Micro-quest system with emotion-appropriate suggestions — existing
- ✓ Aetherling feedback lines after quest completion — existing
- ✓ First Lantern onboarding scene — existing
- ✓ Region unlock progression system — existing
- ✓ Home screen with winding path and walking Aetherling — existing
- ✓ Local-only persistence via AsyncStorage — existing

### Active

- [x] Reconcile CLAUDE.md -- slim to terse constraints, remove content catalogs, add pointers to src/data/ and docs site — Validated in Phase 1: Project Infrastructure
- [x] Migrate game design docs and enable GitHub Pages with docs theme — Validated in Phase 1: Project Infrastructure
- [x] Storage consolidation and data integrity — single storage layer, rich DailyLog schema, streak removal, test foundation — Validated in Phase 3: Storage & Data Integrity
- [ ] Technical architecture audit — evaluate code structure, component organization, state management patterns
- [ ] Performance optimization — identify and fix animation jank, memory issues, unnecessary re-renders
- [ ] Game mechanics audit — document all parameters and mechanics, surface unintended gameplay implications, identify blindspots
- [ ] Game parameter documentation — make tuning values explicit and configurable so Allie can adjust without code changes
- [ ] Code quality refinement — clean up vibe-coded patterns, establish conventions for maintainability
- [ ] Ship-ready polish — transitions, feel, visual consistency, the experience of using it daily

### Out of Scope

- Cloud sync / backend services — local-only is intentional, keeps it simple and private
- Social features — this is a solo companion, not a community app
- Monetization — this is a gift
- Cross-platform web version — mobile-first, mobile-only for now
- AI-generated content — Aetherling's voice is hand-crafted, not generated

## Context

**Team:**
- Dave — technical decisions, architecture, tooling, performance (web/API developer, first time in game dev)
- Allie — creative director, emotional depth, storytelling, game design, content (learning co-developer, built the prototype)
- Both are learning game development together

**Recipient:** Garrett, a solo indie game developer building Atlas. The app should become a natural part of his daily routine — both a daily companion and an emotional anchor in hard moments, emerging organically rather than being forced.

**Existing codebase:** Allie's prototype is functional with Expo 54, React Native, TypeScript, Expo Router, AsyncStorage. Codebase map in `.planning/codebase/`. The code works but was vibe-coded by a non-developer — needs architectural refinement, not a rewrite.

**Design pillars (from CLAUDE.md — do not break these):**
1. **Understood** — mirrors the user's inner state without judgment
2. **Inspired** — protects creative momentum and meaning
3. **Less Pressured** — no streaks, no penalties, time is neutral, rest is normal

**Aetherling voice:** Calm, dry, warm-under-the-surface, respectful, non-performative. Short sentences. No exclamation points, slang, emojis, or motivational clichés. A quiet builder, steady companion, thoughtful observer — never a cheerleader, therapist, or productivity coach.

**Game mechanics concern:** Vibe-coded parameters may create unintended gameplay — e.g., does emotion selection create implicit "right answers"? Do region unlocks accidentally create pressure that violates design pillars? This audit is a first-time-in-game-dev learning exercise for both Dave and Allie.

## Constraints

- **Tech stack**: Expo 54 + React Native + TypeScript + AsyncStorage + Expo Router — established, not changing
- **Local-only**: No backend, no cloud — by design
- **Timeline**: No deadline — quality over speed, "when it's ready"
- **Approach**: Evaluate and refine existing code, not rewrite — respect Allie's work
- **Code clarity**: Code should be readable enough for Allie to learn from and contribute to

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Evaluate before extending | First-time game devs need to understand what they've built before adding to it | — Pending |
| Docs reconciliation first | Need single source of truth before making architectural decisions | ✓ Phase 1 — CLAUDE.md reconciled, docs site live |
| Game mechanics audit | Surface unintended gameplay from vibe-coded parameters | — Pending |
| No rewrite | Respect Allie's prototype, refine incrementally | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after initialization*
