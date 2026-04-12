# Mechanics Audit

This document covers every game mechanic in Lanternkeeper: Emberfall — what it does, how it's tuned, and how it measures up against the three design pillars.

**Who this is for:** Dave and Allie. The goal is shared understanding of what the prototype actually does before making changes. No surprises, no assumptions.

**How to read it:** Each mechanic has its own section with a parameters table, traffic-light pillar ratings (using the admonition blocks below), a risk list, and a remediation block. Remediation blocks include a strength indicator, a justification, and a reference for further reading.

**Design pillars reference:** [Design Pillars](pillars.md)

---

## Reading the Traffic Lights

Every mechanic is rated against all three design pillars using color-coded blocks:

!!! success "Pillar Name: Green"
    This mechanic supports this pillar well. No concern.

!!! warning "Pillar Name: Yellow"
    Minor concern worth watching. Not urgent, but worth noting as the game develops.

!!! danger "Pillar Name: Red"
    This mechanic conflicts with this pillar and needs attention.

**The three pillars:**

- **Understood** — The app meets the user's actual emotional state without judgment. It doesn't push toward a "better" emotion.
- **Inspired** — The app protects creative momentum. Every interaction should leave the user with at least as much energy as they arrived with.
- **Less Pressured** — No streaks, no penalties, no countdowns. Time is neutral. Opening the app after three weeks feels the same as opening it yesterday.

---

## Region Unlock System

**What it does:** As the player uses the app, regions of Emberfall unlock. There are five unlockable regions beyond the starting area. Three unlock when a specific emotion has been selected enough times. Two unlock when the player has visited on enough calendar days.

**Parameters:**

| Region | Unlock Condition | Threshold |
|--------|-----------------|-----------|
| lantern-clearing | Always available | — |
| workshop-glade | inspired count | 3 |
| fog-valley | stuck count | 3 |
| warm-river | frustrated count | 3 |
| observatory-balcony | days visited | 7 |
| the-long-path | days visited | 14 |

Source: `lib/storage.ts` lines 78–91. Emotion counts accumulate forever — there is no ceiling, no decay, and no expiration. Once a region unlocks, it stays unlocked.

**Pillar Impact:**

!!! danger "Understood: Red"
    The three emotion-gated regions (workshop-glade, fog-valley, warm-river) reward stuck, frustrated, and inspired — but not alright. The healthiest emotional state has no dedicated world space and no unlock pathway. This creates an implicit message: your emotional state matters more to Emberfall when it's difficult.

!!! warning "Inspired: Yellow"
    Inspired does unlock workshop-glade, so creative states are represented. But the mechanic frames emotion as a resource to accumulate rather than a state to be met. This is a subtle framing problem rather than a strong conflict.

!!! warning "Less Pressured: Yellow"
    The thresholds are low (3 visits) and never expire, which reduces pressure significantly. But the absence of an alright pathway creates a quiet nudge toward selecting other emotions to see more of the world.

**Risks:**

- Emotion-gating creates an implicit hierarchy. Difficult emotions are mechanically more valuable to the game than alright. A player who honestly selects "alright" every day sees less of Emberfall than a player who was stuck or frustrated.
- Emotion counts accumulate with no ceiling. Thresholds are one-time gates, not ongoing signals. After crossing a threshold, the count is never used again.
- Players who are mostly alright — which is the goal of any wellness practice — may feel the world is not designed for them.

---

### Finding 1: Emotion-Gating Bias

This is a mechanics problem — fixable with code. The current model creates an unequal contribution system where some emotions advance world progression and one does not.

**Strength: Strong Recommendation** — address in a future phase.

**Justification:** The current mechanic directly conflicts with the Understood pillar. A player who honestly selects "alright" is mechanically disadvantaged. The game communicates, through its mechanics, that alright is less interesting than stuck or frustrated. That is the opposite of meeting the user where they are.

**Options for Allie to consider:**

1. **Universal contribution:** Every emotion check-in contributes equally toward all region unlocks. For example, any 3 total check-ins (regardless of emotion) unlocks each region. This eliminates emotion hierarchy entirely and keeps the unlock thresholds as pacing devices without the implied hierarchy.

2. **Emotion-to-region remapping:** Keep emotion-specific unlocks but add alright to the system — for example, alright unlocks a new "quiet-meadow" region. This preserves the narrative connection between emotional state and world space while removing the gap.

3. **Hybrid:** Emotion check-ins contribute to their associated region AND to a shared "world energy" pool that also contributes to region unlocks. Players make both specific and general progress regardless of emotion.

No option is prescribed here. This is Allie's creative decision.

**Reference:** Sebastian Deterding, "Meaningful Play" (2011) — design choices in games communicate values. Mechanics that reward some emotions over others make a statement about which emotions matter. Also: Aarron Walter, "Designing for Emotion" (A Book Apart) — how systems signal which user states are preferred and valued.

---

### Finding 2: Missing "Alright" Region

This is a separate content and narrative problem — not a code fix. The healthiest emotional state has no dedicated world space in Emberfall.

**Strength: For Discussion** — creative direction needed.

**Justification:** This is not a mechanics bug; it is a creative gap. Even if the mechanics problem (Finding 1) is resolved so that alright contributes equally to progression, the question remains: what does a region feel like for someone who is simply okay today?

The question for Allie: What would a world space that reflects "I'm okay today" look and feel like? It could be gentle, unhurried, ordinary in a beautiful way. This does not need to be answered now — it is a prompt for future creative work.

**Reference:** Jane McGonigal, "SuperBetter" (2015) — wellness games that validate the "okay" state alongside difficult states show higher long-term engagement because users do not need to perform distress to feel progress.

---

## Emotion Selection UX

**What it does:** After clearing fog and leaves, the player sees four emotion chips. Tapping one records the check-in. The four chips are: Stuck, Frustrated, Inspired, Alright.

**Parameters:**

| Parameter | Current Value |
|-----------|---------------|
| Emotion options | stuck, frustrated, inspired, alright |
| Rendering order | stuck → frustrated → inspired → alright |
| Order source | JavaScript object key insertion order in `EMOTION_LABELS` |
| Visual treatment | All four chips share identical styling — no color, no icons, no size differences |

The rendering order is not defined by an explicit array — it is derived from how JavaScript iterates object keys. This means the order is an accident of implementation, not a deliberate design choice.

**Pillar Impact:**

!!! warning "Understood: Yellow"
    Equal visual treatment is good — no chip is presented as the "correct" answer. But left-to-right ordering places difficult emotions first, creating a subtle primacy effect in Western reading patterns. This is mild but worth making intentional.

!!! success "Inspired: Green"
    No visual bias against creative states. Inspired receives identical treatment to all other options.

!!! success "Less Pressured: Green"
    No pressure signals in the UX. All options are equally accessible.

**Remediation:**

**Strength: Suggestion**

**Justification:** The ordering creates a subtle bias, not a strong one. Visual parity is maintained. But making the order an explicit design choice (via a defined array) rather than an accident (via object key order) is a low-cost improvement with no downside.

**Recommendation:** Define an explicit `EMOTION_ORDER` constant array so the rendering order is a documented decision. Consider randomizing order per session to eliminate positional bias entirely — this would also make the app feel more alive.

**Reference:** Don Norman, "The Design of Everyday Things" — affordances and signifiers in UI communicate priority. Position is a signifier whether intended or not.

---

## Quest System

**What it does:** After the emotion check-in, the app suggests one micro-quest matched to the selected emotion. The player completes (or skips) the quest. Tapping "Done" moves to the feedback phase.

### Tone Parity

**Parameters:**

| Emotion | Quest pool size |
|---------|----------------|
| stuck | 10 |
| frustrated | 10 |
| inspired | 10 |
| alright | 10 |

Source: `src/data/quests.ts`. All 40 quests have been reviewed. The tone is consistent across all four emotion pools. Stuck and frustrated quests are as validating as inspired and alright quests. No quest implies the player is failing or needs to change their emotional state.

**Pillar Impact:**

!!! success "Understood: Green"
    Quest content meets each emotion without judgment. Stuck quests acknowledge being stuck without trying to resolve it. Frustrated quests validate frustration as useful information.

!!! success "Inspired: Green"
    Quest content for inspired states protects creative momentum — concrete, small, actionable prompts that help the player act on their spark.

!!! success "Less Pressured: Green"
    All quests are framed as suggestions, not requirements. The phrasing is invitational throughout.

---

### Quest Pool Exhaustion

**Parameters:**

| Parameter | Current Value |
|-----------|---------------|
| Canonical quest pool (src/data/quests.ts) | 10 per emotion (40 total) |
| Home screen local copy | 3 per emotion (12 total) — truncated duplicate |
| Selection method | Pure `Math.random()` — no deduplication |
| `getAnotherQuest()` function | Exists in src/data/quests.ts, NOT used by home screen |

The home screen maintains its own local copy of 3 quests per emotion. This appears unintentional — the canonical 40-quest dataset in `src/data/quests.ts` is bypassed entirely.

**Repeat probability with home screen's 3-quest pool:** 33% chance of seeing the same quest two visits in a row.

**Expected visits to see all 10 canonical quests:** ~29 visits (coupon collector's problem). The function never errors — it always returns a quest, cycling if necessary.

**Pillar Impact:**

!!! warning "Understood: Yellow"
    Repeated quests can feel mechanical. At a 33% repeat rate from the truncated 3-quest pool, the companion begins to feel scripted rather than attentive.

!!! success "Inspired: Green"
    Quest content protects creative momentum. The repetition concern is about variety, not tone.

!!! success "Less Pressured: Green"
    There is no "you've done them all" state. Quests cycle without pressure.

**Remediation:**

**Strength: Strong Recommendation** — fix the truncated quest pool.

**Justification:** The canonical 40-quest dataset exists and was carefully written. The home screen bypasses it entirely, using only 3 quests per emotion. This is almost certainly unintentional. Switching to the canonical data is a direct improvement with no tradeoffs — more variety, better companion feel, no pressure signals added.

**Recommendation:** Replace the home screen's local `QUESTS` object and `pickQuest()` function with an import of `getRandomQuest()` from `src/data/quests.ts`. This is a Phase 4 code change (architecture refactor), flagged here for awareness.

**Strength: Suggestion** — add basic deduplication in a future phase. Track the last 3 quests shown and exclude them from the next selection. Small improvement, large feel improvement.

**Reference:** Raph Koster, "A Theory of Fun for Game Design" (2004) — repetition without variation erodes engagement. Even small pools benefit from tracking recently shown items to maintain the feeling of a responsive companion.

---

## Fog and Leaf Clearing

**What it does:** The home screen shows fog wisps and leaves. The player touches them to clear a path. When all fog and leaves are cleared, the door opens and Aetherling walks in — the ritual begins.

**Parameters:**

| Parameter | Current Value |
|-----------|---------------|
| Fog wisp count | 3 |
| Leaf count | 3 |
| Fog wisp sizes | 65, 60, 55 px |
| Leaf touch radius | 40 px |
| Fog touch radius buffer | 25 px added to wisp size / 2 |

**Current persistence behavior:** Reset. The cleared state is React local state (`useState<Set<number>>`). When the app closes and reopens, all fog and leaves return. When the player has already checked in today, the cleared state is programmatically restored (everything cleared) — the ritual does not repeat on the same day.

**Pillar impact of current reset behavior:**

!!! success "Understood: Green"
    Consistent ritual experience regardless of when the user last opened the app. No trace of prior sessions affects the current one.

!!! success "Less Pressured: Green"
    No sense of missed clearing. No guilt for not clearing yesterday. The fog always returns fresh.

!!! warning "Inspired: Yellow"
    No visible accumulation of effort in the world. The clearing work disappears each session, leaving no trace that the player was here before.

---

### Three Options for Fog Persistence

The current behavior is documented, but this is a feel-driven decision that benefits from hands-on testing. All three modes will be implemented as a config parameter (`fogPersistence: 'reset' | 'persist' | 'hybrid'`) in `src/config/game.ts` so Allie can switch between them on a real device and live with each one before committing.

**Option 1: Reset (current)**
Every visit starts fresh. The ritual is the same each day.

- Pro: No guilt for missing days. The world does not remember your absence.
- Con: The world never remembers your effort either.

**Option 2: Persist**
Cleared fog stays cleared across sessions. The world accumulates your clearing work over time.

- Pro: Visible progress. The world feels alive and responsive to your history.
- Con: After enough days, there is nothing left to clear. The ritual loses its physical component.

**Option 3: Hybrid**
Fog resets daily but lighter or fewer than before, showing a trace of past clearing. Each visit slightly thins the fog rather than clearing it entirely.

- Pro: Daily ritual preserved while the world shows memory of your presence.
- Con: More complex to tune. The trace must feel meaningful without feeling like judgment.

**Pillar impact comparison:**

| Mode | Understood | Inspired | Less Pressured |
|------|-----------|----------|----------------|
| Reset | Green | Yellow | Green |
| Persist | Green | Green | Yellow (missing days become visible over time) |
| Hybrid | Green | Green | Green (if tuned well) |

**Reference:** Kursat Ozenc and Margaret Hagan, "Rituals for Work" (2019) — daily rituals benefit from consistent structure (reset) but also from a sense of accumulated meaning (persist). The hybrid approach attempts to balance both without sacrificing either.

---

## Visit Tracking and Day Counting

**What it does:** Each calendar day, the first time the app is opened, `totalDaysVisited` increments by 1. The "Day N" counter displays on the home screen. Opening the app multiple times on the same day does not increment the count.

**Parameters:**

| Parameter | Current Value |
|-----------|---------------|
| Day boundary | UTC midnight |
| Same-day protection | Date string comparison via `getTodayKey()` |
| Display format | "Day N" visible on home screen before check-in |

Source: `lib/storage.ts` `recordDailyVisit()` function. The date comparison is string-based (`YYYY-MM-DD`), which is clean and resistant to off-by-one errors.

**Pillar Impact:**

!!! success "Understood: Green"
    Accurately tracks engagement without inflating. The same-day protection works correctly.

!!! success "Inspired: Green"
    No impact on creative states.

!!! warning "Less Pressured: Yellow"
    The "Day N" counter is visible before check-in. This is a subtle time signal — even without a streak mechanic, a visible day count can create an implicit sense of accumulating expectation.

**Known edge case:** UTC date rollover means "today" can change at unintuitive local times. A user in US Eastern time (UTC-4 in summer) sees the day change at 8 PM local time. A user in Pacific time (UTC-7) sees the day change at 5 PM. This means a player who opens the app before 8 PM and again after 8 PM Eastern may see two different "days" in the same evening session. This is not currently a reported problem but is worth knowing.

**Remediation:**

**Strength: Suggestion**

**Justification:** The "Day N" display is a mild time signal, not a strong one. Not urgent, but worth considering as the app matures and the ritual deepens.

**Options:**

1. Remove the "Day N" display entirely. The visit count remains tracked internally for region unlocks but is not surfaced to the player.
2. Show "Day N" only after check-in, not before. This reframes it as a celebration rather than an expectation.
3. Reframe the label as "Visit N" to emphasize choice over time — you visited, you chose to be here.

**Reference:** BJ Fogg, "Tiny Habits" (2019) — habit-forming apps should avoid day-count displays that create implicit streak pressure even in the absence of explicit streak mechanics. The count itself becomes the streak.

---

## Feedback Lines

**What it does:** After the player taps "Done" on a quest, Aetherling delivers a feedback line. The line is selected randomly from a pool of 5 lines per emotion.

**Parameters:**

| Parameter | Current Value |
|-----------|---------------|
| Lines per emotion | 5 |
| Total lines | 20 |
| Selection method | `Math.random()` (no deduplication) |

Source: `src/data/feedback.ts`.

**Tone:** All 20 lines have been reviewed. They maintain Aetherling's voice rules — calm, dry, warm-under-the-surface, non-performative. No line creates pressure or implies judgment. No line congratulates or over-celebrates. The voice is consistent.

**Pillar Impact:**

!!! success "Understood: Green"
    Feedback lines are matched to the selected emotion and respond to the player's actual state without correcting it.

!!! success "Inspired: Green"
    Feedback lines acknowledge the creative act without over-celebrating it, which preserves the player's relationship with their own work rather than making the app the source of validation.

!!! success "Less Pressured: Green"
    No line implies the player should have done more, done better, or come back sooner. The tone is closing, not opening an obligation.

**Note on repeat rate:** With 5 lines per emotion, the expected repeat probability is 20% per visit. This is acceptable for short, affirming lines. Unlike quests — which are action-oriented and feel repetitive when repeated — feedback lines are ambient acknowledgment. Minor repetition is tolerable at this pool size.

---

## The Streak Function

**What it does:** `calculateStreak()` at `lib/storage.ts:145` counts consecutive days where the player completed at least one quest. It iterates backward from today through up to 365 days of storage entries and returns an integer.

**Status: This function is a design pillar violation. It is flagged for removal.**

The removal is already scheduled as STOR-03 in Phase 3. This section documents it for completeness and ensures Allie understands why it will be deleted.

**Why it violates the pillars:**

- Streaks are explicitly listed as an anti-feature. The "Less Pressured" pillar states: "No streak counter exists in the app." See [Design Pillars](pillars.md).
- The function's existence in the codebase creates a pattern. Any future contributor who discovers `calculateStreak()` may assume it is intentional and surface it in the UI.
- The function is not called anywhere in the current production flow. Its presence has no current user impact — but its absence would be safer.

**Performance concern:** In worst-case, this function makes 365 sequential AsyncStorage reads (one per day, iterating backward until a gap is found). AsyncStorage is asynchronous and device-local, but 365 sequential reads in a loop is not a pattern to leave in the codebase as a reference.

**Pillar Impact:**

!!! success "Understood: Green"
    The function is not displayed, so there is no current user impact on this pillar.

!!! success "Inspired: Green"
    Not displayed, no current user impact.

!!! danger "Less Pressured: Red"
    The function's existence is a latent violation. It is a streak counter. The design pillar explicitly prohibits streak counters. Even unexposed, it represents a design philosophy mismatch that should be resolved before new contributors join the project.

**Remediation:**

**Strength: Strong Recommendation** — Remove in Phase 3 (STOR-03).

**Justification:** The function has no consumers and directly contradicts a core design pillar. This is not a design discussion — it is a confirmed violation with a scheduled fix. No tradeoffs to weigh.

---

## Summary

| Mechanic | Understood | Inspired | Less Pressured | Priority |
|----------|-----------|----------|----------------|----------|
| Region Unlock System | Red | Yellow | Yellow | High — emotion-gating bias needs redesign |
| Emotion Selection UX | Yellow | Green | Green | Low — make order intentional |
| Quest Tone Parity | Green | Green | Green | No action needed |
| Quest Pool Exhaustion | Yellow | Green | Green | High — fix truncated 3-quest pool |
| Fog / Leaf Clearing | Green | Yellow | Green | Allie decides persistence mode |
| Visit Tracking | Green | Green | Yellow | Low — consider hiding day count |
| Feedback Lines | Green | Green | Green | No action needed |
| Streak Function | Green | Green | Red | High — remove in Phase 3 |
