# Phase 2: Game Mechanics Audit - Research

**Researched:** 2026-04-12
**Domain:** Game mechanics documentation, config extraction, ritual/companion game design patterns
**Confidence:** HIGH (all findings verified directly from codebase)

## Summary

Phase 2 is primarily an audit-and-extraction phase. The deliverables are: (1) a human-readable mechanics audit document published to the MkDocs docs site, and (2) a new `src/config/game.ts` file that centralizes all magic numbers currently scattered across the codebase. No gameplay behavior changes in this phase — values move, they do not change.

The codebase has been fully read. Every magic number, mechanic, and parameter is documented below with its exact location. The emotion ordering in the UI renders in JavaScript object key order (`stuck → frustrated → inspired → alright`), which is a potential bias finding that the audit must evaluate. The `calculateStreak()` function exists at `lib/storage.ts:145` and is confirmed as a design pillar violation. The region unlock model gates three regions behind specific emotion accumulation counts with no pathway for `alright`.

The audit document must serve two audiences simultaneously: Allie (creative director, non-developer) and the code. Every finding needs both a plain-language explanation and a precise code reference. The traffic-light pillar ratings (D-03) are the primary navigational device for Allie to scan findings.

**Primary recommendation:** Complete the magic number inventory first, then write the audit document, then extract to `src/config/game.ts` — in that order. The inventory feeds the audit, and the audit's calibration assessment (MECH-12) informs how to document each config parameter.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Audit lives on the docs site as a new page under Game Design (MkDocs, versioned, accessible to Allie in browser)

**D-02:** Organized by mechanic — one section per mechanic (region unlocks, emotion selection, quest system, fog/leaves, visit tracking, etc.). Each section covers: what it does, parameters, pillar impact, risks, remediation

**D-03:** Pillar impact uses traffic light rating per pillar (Green/Yellow/Red) for scannability. Example: Region Unlocks — Understood: Green, Inspired: Yellow, Less Pressured: Red

**D-04:** Remediation is inline per mechanic (not a separate appendix). Each remediation includes:
- Strength indicator (e.g., Strong Recommendation / Suggestion / For Discussion)
- Justification for the recommendation
- References to 3rd party sources where Dave and Allie can learn more about the pattern or principle

**D-05:** The audit flags the emotion-gating bias (inspired/stuck/frustrated unlock regions, alright does not) clearly with pillar impact ratings. Does NOT prescribe a specific redesign — presents 2-3 options with tradeoffs and defers to Allie as creative director

**D-06:** Missing "alright" region is a SEPARATE finding from the emotion-gating bias. Two distinct issues: (1) the mechanics problem of unequal contribution (fixable with code), and (2) the content/narrative gap of the healthiest emotional state having no world space (needs Allie's creative input)

**D-07:** Phase 2 includes extracting ALL magic numbers from code to `src/config/game.ts`. This is a maintainability refactor, not a gameplay change — values stay identical, they just move to a centralized, documented location

**D-08:** The config extraction is a multi-step effort within Phase 2:
1. Inventory every magic number with location, current value, and what it controls
2. Design the config access pattern (typed constants, documented)
3. Extract all magic numbers to `src/config/game.ts`
4. Update all code to read from config instead of hardcoded values

**D-09:** Parameter interaction analysis (MECH-11) and calibration assessment (MECH-12) are part of the audit document, informed by the now-centralized config

**D-10:** Enforcement mechanism to prevent new magic numbers (lint rule or convention) is documented as a recommendation but implementation may extend into Phase 3-4

**D-11:** Current behavior (reset each visit) is documented. The audit presents all three options (reset, persist, hybrid) with full tradeoffs and pillar impact ratings. Deferred to Allie to decide

**D-12:** Fog persistence mode is a config parameter in `src/config/game.ts` (e.g., `fogPersistence: 'reset' | 'persist' | 'hybrid'`). All three modes built so Allie can switch and live with each one before committing.

### Claude's Discretion

- Claude determines the specific mechanic sections and their ordering in the audit document
- Claude determines the internal structure of `src/config/game.ts` (grouping, naming, documentation format)
- Claude determines which 3rd party references are most relevant for each remediation

### Deferred Ideas (OUT OF SCOPE)

- Lint rule / CI enforcement for magic numbers — documented as recommendation only; implementation in Phase 3-4
- Balancing/experimentation tooling — deferred to future milestone
- Config hot-reload — not needed now
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MECH-01 | Produce a human-readable mechanics audit document covering every game parameter and mechanic with implications, risks, and remediation options | Full parameter inventory below; docs site nav pattern confirmed |
| MECH-02 | Audit region unlock conditions — flag any emotion-specific gating that creates implicit hierarchy | Confirmed: 3 emotions unlock regions, alright does not; exact thresholds documented below |
| MECH-03 | Audit emotion selection UX — verify no visual/ordering bias toward "positive" emotions | Confirmed: ordering derived from JS object key order; emotion order documented below |
| MECH-04 | Verify quest tone parity — Stuck/Frustrated quests feel as validating as Inspired/Alright quests | Full quest catalog read; tone analysis documented below |
| MECH-05 | Audit visit counting — confirm once per calendar day, not inflatable by reopening app | Confirmed: date-string comparison in `recordDailyVisit()`; edge case at midnight boundary identified |
| MECH-06 | Document fog/leaf gesture persistence decision — resets each visit or accumulates | Confirmed: resets every visit (no persistence to storage); exact reset mechanism documented |
| MECH-07 | Extract all tunable game parameters to `src/config/game.ts` so Allie can adjust without code changes | Full magic number inventory documented; `src/config/game.ts` is net-new file |
| MECH-08 | Flag `calculateStreak()` for removal — violates "no streaks" design pillar | Confirmed at `lib/storage.ts:145`; function signature and behavior documented |
| MECH-09 | Audit quest pool exhaustion behavior — what happens when all 10 quests have been seen | Confirmed: pure `Math.random()`, no dedup tracking; exhaustion behavior and `getAnotherQuest()` documented |
| MECH-10 | Gap analysis — identify absent mechanics expected in ritual/companion/wellness games, flag gaps that matter for design pillars | Gap analysis framework documented; key gaps identified |
| MECH-11 | Parameter interaction analysis — document where two or more parameters influence the same player experience, flag conflicts | Interaction map documented below |
| MECH-12 | Parameter calibration assessment — evaluate each tunable value as too narrow, too broad, well-sized, or unknown | Assessment framework documented; initial calibration observations per parameter below |
</phase_requirements>

---

## Complete Magic Number Inventory

> Every hardcoded value found in the codebase. This is the primary input for `src/config/game.ts` design.
> Source: Direct codebase read. Confidence: HIGH [VERIFIED: codebase].

### Region Unlock Thresholds (`lib/storage.ts:78–91`)

| Parameter | Current Value | What it Controls | Config Key |
|-----------|---------------|------------------|------------|
| inspired unlock threshold | `>= 3` | Unlocks `workshop-glade` | `regionUnlocks.workshopGlade.inspiredCount` |
| stuck unlock threshold | `>= 3` | Unlocks `fog-valley` | `regionUnlocks.fogValley.stuckCount` |
| frustrated unlock threshold | `>= 3` | Unlocks `warm-river` | `regionUnlocks.warmRiver.frustratedCount` |
| time-based threshold 1 | `>= 7` days | Unlocks `observatory-balcony` | `regionUnlocks.observatoryBalcony.daysVisited` |
| time-based threshold 2 | `>= 14` days | Unlocks `the-long-path` | `regionUnlocks.theLongPath.daysVisited` |
| default unlocked region | `'lantern-clearing'` | Starting region (always available) | `regionUnlocks.defaultRegion` |

### Scene Parameters (`app/(tabs)/index.tsx:27–61`)

| Parameter | Current Value | What it Controls | Config Key |
|-----------|---------------|------------------|------------|
| scene height ratio | `0.45` (of screen height) | How much vertical space the scene takes | `scene.heightRatio` |
| safe area offset multiplier | `0.20` (of scene height) | Pushes scene elements below notch | `scene.safeOffsetMultiplier` |
| fog wisp count | 3 (implicit from array length) | Number of fog wisps to clear | `scene.fogWispCount` |
| leaf count | 3 (implicit from array length) | Number of leaves to brush | `scene.leafCount` |
| fog wisp sizes | `65, 60, 55` | Visual size of each wisp | `scene.fogWispSizes` |
| leaf touch radius | `40` | Hit detection radius for leaves (px) | `scene.leafTouchRadius` |
| fog touch radius | `wisp.size / 2 + 25` | Hit detection radius for fog (px) | `scene.fogTouchRadiusBuffer` |

### Animation Durations (`app/(tabs)/index.tsx:147–163`, `app/(tabs)/index.tsx:213–235`)

| Parameter | Current Value | What it Controls | Config Key |
|-----------|---------------|------------------|------------|
| fog clear duration | `600` ms | How long fog fades out | `animation.fogClearDurationMs` |
| fog clear translateY | `-40` px | How far fog floats up when cleared | `animation.fogClearLiftPx` |
| fog clear scale | `1.5` | How much fog expands when cleared | `animation.fogClearScale` |
| leaf clear duration | `800` ms | How long leaf blows away | `animation.leafClearDurationMs` |
| leaf horizontal travel | `60–100` px random | How far leaf drifts sideways | `animation.leafClearHorizontalRange` |
| leaf vertical travel | `-60 to -90` px random | How high leaf floats when cleared | `animation.leafClearVerticalRange` |

### Dialogue Timing (`app/(tabs)/index.tsx:547–553`)

| Parameter | Current Value | What it Controls | Config Key |
|-----------|---------------|------------------|------------|
| path-clear to door-open delay | `800` ms | Pause after all fog/leaves cleared before door opens | `timing.pathClearedToDoorsOpenMs` |
| door-open to walk-start delay | `600` ms | Pause between door opening and panda walking | `timing.doorOpenToWalkStartMs` |

### Quest and Feedback Pool Sizes (implicit from data arrays)

| Parameter | Current Value | What it Controls | Config Key |
|-----------|---------------|------------------|------------|
| quests per emotion | `10` | Pool size for random quest selection | (not a magic number — derived from array length; no config needed) |
| feedback lines per emotion | `5` | Pool size for random feedback selection | (not a magic number — derived from array length; no config needed) |

### Storage Limits (`src/storage/storage.ts:65, 87` — dead code, but documents intent)

| Parameter | Current Value | What it Controls | Config Key |
|-----------|---------------|------------------|------------|
| max log entries | `100` | Caps AsyncStorage growth | (dead code — not currently enforced in `lib/storage.ts`) |
| max seed entries | `200` | Caps AsyncStorage growth | (dead code — not currently enforced in `lib/storage.ts`) |

### Stars (cosmetic, non-tunable)

| Parameter | Current Value | What it Controls |
|-----------|---------------|------------------|
| star count | `20` | Background cosmetic stars |
| star opacity range | `0.3–0.8` | Star visibility variation |
| star size range | `1–3` px | Star size variation |

These are purely cosmetic and do not affect game feel or pillars. Including in config is optional.

### Fog Persistence Mode

| Parameter | Current Value | What it Controls | Config Key |
|-----------|---------------|------------------|------------|
| fog persistence mode | `'reset'` (implicit — no storage write) | Whether cleared fog/leaves persist across sessions | `scene.fogPersistence` |

Current implementation: fog/leaf cleared state is local React state only (`useState<Set<number>>`). On reload, state resets to empty. No AsyncStorage write for cleared fog/leaves. Behavior is `'reset'` by design or by omission — unclear from code alone.

---

## Mechanics Deep Dive (per requirement)

### MECH-02: Region Unlock Conditions

**Current behavior** [VERIFIED: `lib/storage.ts:75–95`]:

```
workshop-glade   → emotionCounts.inspired >= 3
fog-valley       → emotionCounts.stuck >= 3
warm-river       → emotionCounts.frustrated >= 3
observatory-balcony → totalDaysVisited >= 7
the-long-path    → totalDaysVisited >= 14
```

**Structural problem:** Three of five regions unlock only by selecting specific "difficult" emotions (inspired, stuck, frustrated). `alright` accumulates but unlocks nothing. A player who is primarily `alright` — arguably the healthiest state — has no dedicated world space and cannot trigger region unlocks through their natural emotional state.

**Secondary problem:** Emotion counts accumulate forever with no ceiling or decay [VERIFIED: `lib/storage.ts:63–65`]. A player who selected `inspired` 3 times years ago unlocked `workshop-glade` permanently. The threshold is a one-time gate, not an ongoing signal.

**Pillar impact:**
- Understood: **Red** — Implicitly rewards "difficult" emotions with content; healthiest state has no world space
- Inspired: **Yellow** — `inspired` does unlock a region (`workshop-glade`), but the mechanic still frames emotion as a resource to accumulate
- Less Pressured: **Yellow** — Thresholds are low (3 visits) and do not expire, which reduces pressure; but the absence of `alright` pathway creates subtle pressure to select other emotions

### MECH-03: Emotion Selection UX

**Current behavior** [VERIFIED: `app/(tabs)/index.tsx:862–873`]:

The emotion row renders via `Object.keys(EMOTION_LABELS)`. JavaScript object key order for string keys is insertion order. `EMOTION_LABELS` is defined as:

```typescript
const EMOTION_LABELS: Record<Emotion, string> = {
  stuck: "Stuck",
  frustrated: "Frustrated",
  inspired: "Inspired",
  alright: "Alright",
};
```

**Rendering order:** Stuck → Frustrated → Inspired → Alright

**Bias assessment:** The ordering places both "difficult" emotions first and both "positive" emotions last. This creates a subtle left-to-right reading bias where the first options encountered are negative states. In Western reading patterns, earlier = more prominent.

**Visual parity:** All four emotion chips share identical styling (`styles.emotionChip`). No color coding, no icons, no sizing differences. Visual equality is maintained.

**Pillar impact:**
- Understood: **Yellow** — Equal visual treatment, but ordering creates implicit primacy for difficult emotions
- Inspired: **Green** — No bias against creative states in visual treatment
- Less Pressured: **Green** — No pressure signals in the UX

### MECH-04: Quest Tone Parity

**Full quest catalog** [VERIFIED: `src/data/quests.ts`]:

Stuck quests (10): Focus on acknowledging the block, small physical actions, naming the feeling. Tone is patient and validating. Representative: *"Name one small thing you have already built"*, *"Write the next true step, even if it feels too small"*.

Frustrated quests (10): Focus on body regulation, stepping back, self-compassion. Tone is grounding. Representative: *"Say one kind thing to yourself quietly"*, *"Lower your expectations for today by 10 percent"*.

Inspired quests (10): Focus on capturing and protecting creative momentum. Tone is energizing but not pressuring. Representative: *"Build one imperfect thing"*, *"Protect your spark: remove one distraction"*.

Alright quests (10): Focus on maintenance, self-care, rest. Tone is affirming without needing to do much. Representative: *"Rest for 5 minutes without guilt"*, *"Thank yourself for showing up"*.

**Tone parity verdict:** All four pools feel consistent in voice and calibration. Stuck and Frustrated quests are as validating as Inspired and Alright. No emotion pool has quests that feel like punishment or demands.

**Potential concern:** The home screen `QUESTS` object (lines 101–122) contains only 3 quests per emotion — a truncated local copy that is NOT the canonical quest data. The canonical 40-quest dataset lives in `src/data/quests.ts`. The home screen uses its local copy for quest selection, bypassing the canonical data entirely.

**Pillar impact:**
- Understood: **Green** — Quest tone matches the emotion's experience without pushing toward change
- Inspired: **Green** — Inspired quests help capture momentum without adding obligation
- Less Pressured: **Green** — No quest pool demands improvement or implies failure

### MECH-05: Visit Counting

**Current behavior** [VERIFIED: `lib/storage.ts:52–65`]:

```typescript
if (state.lastVisitDate !== today) {
  state.totalDaysVisited += 1;
  state.lastVisitDate = today;
}
```

`today` is derived from `getTodayKey()` which uses `new Date().toISOString().split('T')[0]`. ISO string uses UTC time zone.

**Protection against inflation:** Yes — the date string comparison prevents multiple increments on the same calendar day (UTC).

**Known edge case** [from CONCERNS.md]: UTC date rollover. If the user's device is in a timezone where midnight UTC occurs at, say, 8 PM local time, the "day" changes at an unintuitive local time. This means a user who opens the app at 7:59 PM local and again at 8:01 PM local may see `totalDaysVisited` increment twice in the same evening. [VERIFIED: `lib/storage.ts:102–106`]

**Pillar impact:**
- Less Pressured: **Yellow** — Day count displays as "Day N" in the UI (`app/(tabs)/index.tsx:880`), visible even when the user has not checked in yet. This is a subtle time signal.

### MECH-06: Fog/Leaf Persistence

**Current behavior** [VERIFIED: `app/(tabs)/index.tsx:493–494`, `lib/storage.ts`]:

```typescript
const [clearedFog, setClearedFog] = useState<Set<number>>(new Set());
const [clearedLeaves, setClearedLeaves] = useState<Set<number>>(new Set());
```

State is React local state only. No AsyncStorage writes for fog/leaf cleared status. On every app open or reload, the Set starts empty — all fog and leaves are present.

When the user has already checked in today, the state is force-set to all-cleared programmatically [VERIFIED: `app/(tabs)/index.tsx:523–526`]:
```typescript
setClearedFog(new Set(FOG_WISPS.map((f) => f.id)));
setClearedLeaves(new Set(LEAVES.map((l) => l.id)));
```

So: cleared state resets when the app is fully closed and reopened, but is restored from the "already checked in" flag when the user returns the same day.

**Three options for the audit to present:**
1. **Reset** (current): Every visit starts with fresh fog. The ritual is the same each day.
2. **Persist**: Fog cleared yesterday stays cleared today. The world accumulates the user's clearing work.
3. **Hybrid**: Fog resets daily but leaves some visual trace of past clearing (e.g., lighter fog).

**Pillar impact of current reset behavior:**
- Understood: **Green** — Consistent ritual experience regardless of when the user last opened the app
- Less Pressured: **Green** — No sense that the user "missed" clearing yesterday
- Inspired: **Yellow** — No visible accumulation of effort in the world; the world looks the same whether the user has opened the app once or 100 times

### MECH-07: Config Extraction

**Net-new file:** `src/config/game.ts` does not exist. [VERIFIED: `ls` via file structure knowledge]

**Consumers requiring update after extraction:**
- `lib/storage.ts` — imports needed for region unlock thresholds and default region
- `app/(tabs)/index.tsx` — imports needed for scene parameters, animation durations, dialogue timing

**Recommended `src/config/game.ts` structure** (Claude's discretion):

```typescript
// src/config/game.ts
// All tunable game parameters in one place.
// Change values here — do not change game logic files.

export const GAME_CONFIG = {
  // --- Region Unlocks ---
  regionUnlocks: {
    defaultRegion: 'lantern-clearing',
    workshopGlade: { inspiredCount: 3 },
    fogValley: { stuckCount: 3 },
    warmRiver: { frustratedCount: 3 },
    observatoryBalcony: { daysVisited: 7 },
    theLongPath: { daysVisited: 14 },
  },

  // --- Scene ---
  scene: {
    heightRatio: 0.45,
    safeOffsetMultiplier: 0.20,
    fogWispCount: 3,
    leafCount: 3,
    fogWispSizes: [65, 60, 55] as const,
    leafTouchRadius: 40,
    fogTouchRadiusBuffer: 25,
    fogPersistence: 'reset' as 'reset' | 'persist' | 'hybrid',
  },

  // --- Animation ---
  animation: {
    fogClearDurationMs: 600,
    fogClearLiftPx: 40,
    fogClearScale: 1.5,
    leafClearDurationMs: 800,
    leafClearHorizontalMin: 60,
    leafClearHorizontalMax: 100,
    leafClearVerticalMin: 60,
    leafClearVerticalMax: 90,
  },

  // --- Timing ---
  timing: {
    pathClearedToDoorsOpenMs: 800,
    doorOpenToWalkStartMs: 600,
  },
} as const;
```

### MECH-08: calculateStreak()

**Confirmed location:** `lib/storage.ts:145–164` [VERIFIED]

**Function behavior:** Iterates backward from today up to 365 days. For each day, loads the daily log from AsyncStorage. Counts consecutive days with at least one completed quest. On the first empty past day (day > 0), breaks the loop.

**Performance concern:** In the worst case (365 days of history), this makes 365 sequential AsyncStorage reads. AsyncStorage is async but not parallelized here — each `await loadDailyLog(key)` is sequential. On a device with 365 days of history, this function takes approximately 365 × (AsyncStorage latency) to complete.

**Design pillar violation:** The function's existence implies streak tracking is a feature. Even if the result is never displayed, the data model is oriented around streaks — a pattern directly listed in the design pillars as a violation.

**Audit documentation requirement:** This function must be clearly labeled as a violation, not a dormant feature. It does not display anywhere currently, but its presence in the codebase could lead a future contributor to surface it. Phase 3 removes it (STOR-03).

### MECH-09: Quest Pool Exhaustion

**Current behavior** [VERIFIED: `src/data/quests.ts:78–92`]:

```typescript
export function getRandomQuest(emotion: Emotion): Quest {
  const pool = QUESTS[emotion];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
```

Pure random selection from the 10-quest pool. No deduplication. No tracking of which quests have been seen in the current session or historically.

**Home screen uses a local truncated quest copy** [VERIFIED: `app/(tabs)/index.tsx:101–122`]: Only 3 quests per emotion, not the canonical 10. This means on the home screen, with 3 quests per pool, the probability of seeing the same quest twice in a row is 1/3 (33%). This is likely unintentional.

**`getAnotherQuest()` exists** [VERIFIED: `src/data/quests.ts:87–92`]: Excludes the current quest from reselection within a single interaction, but is not used by the home screen (which uses its own `pickQuest()` inline function).

**Pool exhaustion behavior (canonical `src/data/quests.ts`):** With 10 quests per emotion and pure random selection, statistically a user completing one quest per day will see all 10 quests in a given emotion pool within approximately 29 days (coupon collector's problem: expected 10 × H(10) ≈ 29.3 trials). There is no "exhausted pool" error state — the function always returns a quest.

**What happens at true exhaustion:** The function never errors out. It will repeat quests. There is no "you've done them all" state.

### MECH-10: Gap Analysis

Ritual/companion/wellness game patterns that are absent from the current implementation:

| Gap | Present? | Matters for Pillars? | Assessment |
|-----|----------|---------------------|------------|
| Contextual world response to user absence | No | Yes — "Less Pressured" | Currently the world looks identical whether user returns after 1 day or 30. A subtle ambient change (not guilt-based) could reinforce "Inspired" |
| Quest deduplication / seen tracking | No | Moderate | Repeated quests can feel mechanical; matters more as user tenure grows |
| "Alright" region | No | Yes — "Understood" | Healthiest emotional state has no dedicated world space |
| Progressive Aetherling dialogue | Minimal | Yes — "Understood" | Aetherling says the same lines regardless of user history; no memory of past interactions |
| Seasonal or time-of-day scene variation | No | Low | Would enhance "Understood" but not critical |
| Quest skip / "another" option | Partial | Yes — "Less Pressured" | `getAnotherQuest()` exists in code but is not surfaced in home screen UI |
| Explicit onboarding to the three pillars | No | Low | Core loop is intuitive; design pillars are internal |
| Data export / memory | No | Low for v1 | Out of scope by design |

### MECH-11: Parameter Interaction Map

| Parameters | Shared Player Experience | Conflict? |
|------------|--------------------------|-----------|
| `inspiredCount >= 3` + `totalDaysVisited >= 7` | Pacing of world expansion | Yes — a user who feels inspired often unlocks `workshop-glade` at day 3, but `observatory-balcony` requires 7 total visits. World can feel stalled after first unlock |
| `fogWispCount` + `fogTouchRadiusBuffer` + `leafCount` + `leafTouchRadius` | Ease of path clearing | Yes — more wisps or smaller radius = harder/longer clearing = more friction before check-in |
| `animation.fogClearDurationMs` + `timing.pathClearedToDoorsOpenMs` + `timing.doorOpenToWalkStartMs` | Perceived ritual length | Compounding delays: 600ms fog + 800ms door delay + 600ms walk delay = at least 2 seconds of waiting before the walk starts |
| `scene.heightRatio` + `scene.safeOffsetMultiplier` + `PATH_POINTS` (relative positions) | Scene layout on different devices | Yes — these three interact to place fog, leaves, panda, and door; changing one without the others can break layout |
| Region unlock thresholds (all 5) + `fogPersistence` mode | Long-term ritual feel | Indirect: persistence affects whether the world "remembers" daily effort; unlocks affect whether that effort produces visible world change |

### MECH-12: Parameter Calibration Assessment

| Parameter | Current Value | Assessment | Reasoning |
|-----------|---------------|------------|-----------|
| Region unlock thresholds (emotion) | 3 | Well-sized | Low enough to be achievable quickly (reduces pressure), high enough to feel meaningful. A new user hits this within 3 sessions. |
| Region unlock thresholds (days) | 7, 14 | Well-sized | 7 days is one week of casual use; 14 is two weeks. Appropriate pacing for a companion app. |
| Fog wisp count | 3 | Well-sized | 3 wisps clears in under 30 seconds. Enough to feel like a ritual, not so many it becomes a task. |
| Leaf count | 3 | Well-sized | Same reasoning as fog wisps. |
| Fog clear duration | 600ms | Well-sized | Perceptibly satisfying without being slow. |
| Leaf clear duration | 800ms | Well-sized | Slightly longer than fog — leaf "flies away" feel requires the extra 200ms. |
| Door open delay | 800ms | Possibly too long | Combined with 600ms walk delay, the user waits 1.4 seconds after clearing before anything happens. May feel sluggish. |
| Scene height ratio | 0.45 | Unknown | Needs device testing; could be too tall on short screens or too cramped on tall screens. |
| Quest pool size (home screen) | 3 per emotion | Too narrow | 33% repeat probability per visit is high for a daily ritual. Should use the canonical 10-quest pool. |
| Quest pool size (canonical) | 10 per emotion | Well-sized | Low enough for coherent curation, high enough to avoid rapid repetition. |

---

## Docs Site Integration

**MkDocs structure** [VERIFIED: `mkdocs.yml`]:

The audit document belongs under the `Game Design` nav section. Current Game Design pages: pillars, voice, core-loop, quests, feedback. New page: `docs/game-design/mechanics-audit.md`.

**Nav entry to add to `mkdocs.yml`:**
```yaml
- Game Design:
    - Design Pillars: game-design/pillars.md
    - "Aetherling's Voice": game-design/voice.md
    - Core Loop: game-design/core-loop.md
    - Micro-Quests: game-design/quests.md
    - Feedback Lines: game-design/feedback.md
    - Mechanics Audit: game-design/mechanics-audit.md   # NEW
```

**Recommended audit document section order** (Claude's discretion):

1. Introduction (what this document is, who it's for, how to read it)
2. Reading the Traffic Lights (explain the pillar rating system)
3. Mechanics Sections (one per mechanic):
   a. Region Unlock System (MECH-02)
   b. Emotion Selection UX (MECH-03)
   c. Quest System (MECH-04, MECH-09)
   d. Fog & Leaf Clearing (MECH-06)
   e. Visit Tracking & Day Counting (MECH-05)
   f. Feedback Lines (tone audit)
   g. The Streak Function (MECH-08)
4. Gap Analysis (MECH-10)
5. Parameter Interaction Map (MECH-11)
6. Parameter Calibration (MECH-12)
7. Appendix: Full Parameter Reference (links to `src/config/game.ts`)

---

## Architecture Patterns

### `src/config/game.ts` Design Pattern

**Pattern:** Single typed `GAME_CONFIG` object exported as `const`, grouped by subsystem. No class, no factory — just a typed constant object. This matches the project's existing data pattern (see `QUESTS` and `FEEDBACK` as `Record<Emotion, ...>` exports).

**Access pattern throughout codebase:**
```typescript
import { GAME_CONFIG } from '@/src/config/game';
// ...
const threshold = GAME_CONFIG.regionUnlocks.workshopGlade.inspiredCount;
```

**Why not individual named exports:** A single `GAME_CONFIG` object makes it immediately obvious to Allie where all parameters live and how they're organized. Scattering individual exports loses the "one place to look" benefit.

### Audit Document Markdown Pattern

The docs site uses Material for MkDocs. Available features [VERIFIED: `mkdocs.yml` markdown extensions]:
- `admonition` — for callout boxes (use for pillar impact summaries)
- `pymdownx.details` — for collapsible sections (use for "Under the hood" code details)
- `pymdownx.superfences` — for code blocks with syntax highlighting
- `pymdownx.tasklist` — for checklists (not needed in audit)
- `toc.permalink` — for linkable section headers

**Traffic light implementation:** Use MkDocs admonition types to represent traffic light ratings:
- Green: `!!! success "Understood: Green"`
- Yellow: `!!! warning "Less Pressured: Yellow"`
- Red: `!!! danger "Understood: Red"`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript config type safety | Manual type assertions | `as const` on GAME_CONFIG object | Gives literal type inference automatically |
| Config file documentation | Separate docs-only file | JSDoc comments inline in `src/config/game.ts` | Config and docs stay in sync; Allie can read comments in the file |

---

## Common Pitfalls

### Pitfall 1: Home Screen Quest Copy vs. Canonical Data

**What goes wrong:** The home screen (`app/(tabs)/index.tsx:101–122`) has its own local `QUESTS` object with only 3 quests per emotion. This is NOT the canonical 40-quest data in `src/data/quests.ts`. Quest selection on the home screen uses `pickQuest()` (line 635) which reads from the local copy.

**Why it happens:** The home screen was likely developed independently before `src/data/quests.ts` was populated. The canonical data file was added later.

**How to avoid:** When writing audit document section on quest system, audit BOTH quest sources. The MECH-04 tone audit should focus on `src/data/quests.ts` (the canonical source), but note the local copy discrepancy. Config extraction should not extract the local copy — it should be replaced with an import from `src/data/quests.ts`.

**Warning signs:** Quest text in the app shows only 3 options per emotion recycling quickly.

### Pitfall 2: Fog/Leaf Count Magic Numbers Are Implicit

**What goes wrong:** `FOG_WISPS` and `LEAVES` are arrays in `getSceneConfig()`. Their "count" is the array length, not a standalone constant. If someone adds a 4th wisp to the array, the count changes but no `fogWispCount` config parameter was updated.

**How to avoid:** In `src/config/game.ts`, document fog/leaf count but tie it to the actual data arrays rather than duplicating the count. Or: generate the position arrays from a count parameter in config. The planner should decide which approach.

### Pitfall 3: `as const` vs. Runtime Mutability

**What goes wrong:** If `GAME_CONFIG` is defined with `as const`, all values become literal types. This prevents runtime mutation, which is good for config integrity. But it also means you cannot do `GAME_CONFIG.scene.fogPersistence = 'persist'` at runtime — you must rebuild.

**This is the correct behavior** for this use case (fog persistence is a build-time experiment, not a user toggle). Flag this clearly in the config file's comments so future contributors understand why values can't be set at runtime.

### Pitfall 4: Emotion Order Depends on Object Key Order

**What goes wrong:** JavaScript preserves string key insertion order in modern engines, but this is a language detail that isn't obvious. If anyone refactors `EMOTION_LABELS` and reorders the keys, the UI order changes silently.

**How to avoid:** The audit document should recommend defining emotion rendering order as an explicit array:
```typescript
const EMOTION_ORDER: Emotion[] = ['stuck', 'frustrated', 'inspired', 'alright'];
```
This makes the ordering intentional and visible rather than an implicit side effect of object definition order. This is a code recommendation, not a config value.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed [VERIFIED: CONCERNS.md "No Testing Framework"] |
| Config file | None |
| Quick run command | N/A — Wave 0 must install Jest |
| Full suite command | N/A — Wave 0 must install Jest |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MECH-05 | `recordDailyVisit()` only increments `totalDaysVisited` once per calendar day | unit | `npx jest lib/storage.test.ts -t "visit counting"` | ❌ Wave 0 |
| MECH-05 | Reopening app on same day does not increment day count | unit | same file | ❌ Wave 0 |
| MECH-07 | `src/config/game.ts` exports `GAME_CONFIG` with all required keys | unit | `npx jest src/config/game.test.ts` | ❌ Wave 0 |
| MECH-07 | All consumers import from config, not hardcoded values | static | TypeScript compilation via `npx tsc --noEmit` | ✅ (tsc exists) |
| MECH-08 | `calculateStreak()` is documented (not removed — removal is Phase 3) | n/a | audit-only | n/a |
| MECH-09 | `getRandomQuest()` always returns a valid Quest | unit | `npx jest src/data/quests.test.ts` | ❌ Wave 0 |
| MECH-02 | `checkRegionUnlocks()` unlocks correct regions at correct thresholds | unit | `npx jest lib/storage.test.ts -t "region unlocks"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (TypeScript type checking — works without Jest)
- **Per wave merge:** Full Jest suite once installed
- **Phase gate:** `npx tsc --noEmit` passes + audit document published to docs site

### Wave 0 Gaps
- [ ] `jest.config.js` — needs to be created (Expo/React Native Jest config)
- [ ] `lib/storage.test.ts` — covers MECH-02, MECH-05
- [ ] `src/data/quests.test.ts` — covers MECH-09
- [ ] `src/config/game.test.ts` — covers MECH-07
- [ ] Jest install: `npm install --save-dev jest @testing-library/react-native jest-expo`

Note: nyquist_validation is enabled in config. However, much of this phase is documentation + config extraction. The most critical automated checks are TypeScript compilation (already available) and storage logic unit tests. The audit document itself cannot be automatically validated.

---

## Environment Availability

This phase has no external service dependencies. All work is codebase analysis, document writing, and TypeScript config extraction. The only tools required are the existing Node.js/TypeScript/Expo toolchain.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js + npm | Config extraction, TypeScript compile | ✅ | (from package-lock.json) | — |
| TypeScript | Type checking config file | ✅ | 5.9.2 | — |
| MkDocs | Publishing audit document | ✅ (from Phase 1) | Material theme installed | — |
| Jest | Unit tests for MECH-05, MECH-07 | ✗ | — | TypeScript compile check only |

**Missing dependencies with no fallback:** None that block the core phase work.

**Missing dependencies with fallback:** Jest is not installed. Tests specified in the validation map above can be deferred to Phase 3 (storage consolidation phase), or Jest can be installed as a Wave 0 task in this phase. The planner should decide — config extraction can be verified via TypeScript compile alone.

---

## Security Domain

This phase involves no authentication, sessions, cryptography, or user input beyond what already exists. The only change is moving hardcoded values to a config file and writing a markdown document. ASVS categories V2, V3, V4, V6 do not apply. V5 (Input Validation) does not apply — no new user input is introduced.

Security is not a concern for this phase.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Fog persistence is `'reset'` by design or omission — no AsyncStorage writes exist for fog/leaf state | MECH-06, Magic Number Inventory | Low risk — verified by reading both storage files and home screen state |
| A2 | `src/config/game.ts` does not exist | Architecture Patterns | Low risk — no file found in project structure review |
| A3 | The home screen `QUESTS` local copy (3 per emotion) is unintentional duplication rather than intentional truncation | MECH-09, Pitfall 1 | Medium risk — could be intentional simplification; audit should note and flag for Dave/Allie to confirm |
| A4 | `Object.keys(EMOTION_LABELS)` rendering order follows insertion order | MECH-03 | Low risk — standard JS behavior since ES2015; confirmed by modern engine spec |

---

## Open Questions

1. **Is the home screen quest truncation (3 per emotion) intentional?**
   - What we know: `src/data/quests.ts` has 10 quests per emotion; `app/(tabs)/index.tsx` has its own 3-quest-per-emotion object
   - What's unclear: Whether this was intentional (simpler prototype) or overlooked
   - Recommendation: Flag in audit. Config extraction task should replace local copy with canonical import.

2. **Should fog wisp count be a config parameter or derived from array length?**
   - What we know: Currently it's implicit (array length of `FOG_WISPS`); changing count requires adding/removing array entries
   - What's unclear: Whether generating positions from a count parameter is desirable (simpler for Allie) or if explicit position control is needed
   - Recommendation: Keep explicit position arrays (Allie can tune individual placement); add a comment noting count is `FOG_WISPS.length`

3. **Does `fogPersistence` as a config toggle require new code in this phase?**
   - What we know: D-12 says "all three modes built so Allie can switch"; current mode is `'reset'`
   - What's unclear: Does Phase 2 implement the `'persist'` and `'hybrid'` branches, or just add the config key and document the options?
   - Recommendation: The planner should clarify. If implementation is in scope, it's a non-trivial code change (AsyncStorage write for fog state). If only the config key and documentation are in scope, it's trivial.

---

## Sources

### Primary (HIGH confidence)
All findings in this document are VERIFIED directly from the project codebase:

- `lib/storage.ts` — Region unlock logic, `calculateStreak()`, `WorldState` schema, visit counting
- `src/data/quests.ts` — Full 40-quest catalog, `getRandomQuest()`, `getAnotherQuest()`
- `src/data/feedback.ts` — Full 20 feedback lines, `getRandomFeedback()`
- `src/data/types.ts` — `Emotion` type, `Quest`, `DailyLog`, `AppState`, `IdeaSeed` interfaces
- `src/storage/storage.ts` — Dead code layer; storage limits, `DailyLog` schema conflict
- `app/(tabs)/index.tsx` — Scene parameters, animation durations, timing constants, emotion ordering, quest local copy, fog persistence behavior
- `docs/game-design/pillars.md` — Pillar definitions and violation criteria
- `docs/game-design/core-loop.md` — Authoritative core loop description
- `mkdocs.yml` — Docs site navigation structure and Markdown extensions available
- `.planning/codebase/CONCERNS.md` — Pre-existing analysis including timezone edge case, duplicate storage, no test infrastructure
- `.planning/phases/02-game-mechanics-audit/02-CONTEXT.md` — User decisions D-01 through D-12

---

## Metadata

**Confidence breakdown:**
- Magic number inventory: HIGH — every value read directly from source code
- Mechanic behavior: HIGH — confirmed by reading implementation
- Calibration assessments: MEDIUM — initial observations; feel-based calibration requires device testing
- Gap analysis (MECH-10): MEDIUM — based on familiarity with ritual/companion game genre patterns [ASSUMED for genre comparisons]
- Docs site integration: HIGH — mkdocs.yml and existing docs read directly

**Research date:** 2026-04-12
**Valid until:** Indefinite for code-based findings; 30 days for genre/calibration observations
