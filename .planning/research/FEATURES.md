# Feature Research

**Domain:** Calm/ritual companion mobile game for solo creative professionals
**Researched:** 2026-04-11
**Confidence:** MEDIUM — cozy/companion game space is well-studied; specific emotion-gating mechanics are less documented; parameter tuning norms drawn from analogous games

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Emotion check-in with distinct states | Genre convention — any companion/wellness app offers mood input | LOW | EXISTS. Four states (Stuck/Frustrated/Inspired/Alright) are implemented |
| Micro-quest or suggested action | Users expect something actionable after disclosing how they feel | LOW | EXISTS. 10 quests per emotion, random selection |
| Companion character presence on home screen | The companion IS the product — its absence breaks the premise | MEDIUM | EXISTS. Aetherling walks the home path |
| Tactile/sensory ritual interaction | Calm games depend on feel: something to touch, brush, clear | MEDIUM | EXISTS. Fog clearing and leaf brushing gestures |
| Responsive feedback after completion | Closing the loop after a quest — companion acknowledges the act | LOW | EXISTS. Aetherling feedback lines per emotion |
| Onboarding scene establishing tone | Users need to understand the emotional contract before they invest | MEDIUM | EXISTS. First Lantern scene, 11 phases |
| Persistence across sessions | World should remember the user — otherwise it's not a companion | LOW | EXISTS. AsyncStorage world state |
| No punishment for absence | Genre expectation — missing a day must not penalize | LOW | PARTIALLY MET — no streaks, but region unlock timing thresholds (7d/14d) could feel like falling behind |

### Differentiators (Competitive Advantage)

Features that set this product apart. Not required by genre, but valuable to identity.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Emotion-named world regions | The world literally reflects emotional history — Fog Valley unlocks from Stuck check-ins, etc. | MEDIUM | EXISTS. Powerful conceptually; risk: emotion-to-region naming creates implicit "right emotions" (see Pitfalls below) |
| Aetherling's voice as distinct character | Most companion apps are generic; Aetherling's dry, warm, non-performative voice is rare | LOW | EXISTS as content. Risk: vibe-coded content may have voice drift — needs audit |
| Ritual framing (not habit tracking) | Habit apps track and score you; this one witnesses you — distinct emotional contract | LOW | Framing decision, not a feature per se — but it must be upheld in every interaction |
| World-building parallel to user's real work | Emberfall grows as Atlas grows — the game mirrors the player's own creative journey | MEDIUM | Partially realized through region unlocks; could go deeper |
| Hand-crafted companion voice (no AI generation) | Intentional warmth; AI-generated content feels hollow at the companion layer | LOW | Design constraint, not a feature — but worth protecting explicitly |
| Time-neutral progression | Observatory Balcony at 7 days and Long Path at 14 days can be any 7 or 14 visits, not calendar days — if implemented correctly | LOW | NEEDS VERIFICATION — current implementation uses visit count, not consecutive days. This is the right approach; confirm it in code audit |

### Anti-Features (Deliberately NOT Building)

Features that seem good but actively undermine the product's identity.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Streaks | "Streaks build habits" — true for productivity apps | Directly violates "no pressure, time is neutral" — breaks the emotional contract on first missed day | Daily reset reward (positive anticipation) or no counter at all — just show "you've visited X times" with no recency implication |
| Score or points per quest | Gamification feedback — users expect reward signals | Turns ritual into performance, creates implicit hierarchy of quests | Aetherling's qualitative feedback line is the only reward — that's the design |
| Emotion history charts or mood graphs | "Insight" and "self-awareness" framing | Turns emotional honesty into data collection; makes users self-conscious about their emotion patterns; creates pressure to select "better" emotions | Let emotion data drive world state silently — the world reflects it aesthetically, not analytically |
| Push notifications | "Engagement and retention" | Intrudes on the ritual's on-demand nature; turns the companion into a demand-maker | Let the user come to the ritual — ambient world changes on home screen can invite return without demanding it |
| Emotion selection locked to one per day | "Daily commitment" narrative | Creates pressure to get it "right" the first time; false scarcity on a low-stakes choice | Allow re-entry; the daily log tracks completions not locks |
| Achievement badges or trophies | Standard gamification | Achievement framing implies failure states; creates anxiety for neurodivergent or perfectionist users (documented Finch criticism) | Region unlocks serve the same discovery/reward function without explicit achievement framing |
| Social sharing | "Show your world to friends" | Violates the private, solo companion nature; introduces social comparison | This is a solo companion — social is out of scope by design |
| Difficulty progression | "The game should get harder/deeper" | Not a challenge game — the ritual should remain equally accessible on day 1 and day 100 | World complexity can grow aesthetically without increasing cognitive demand |

---

## Feature Dependencies

```
Emotion Check-In
    └──requires──> Quest Display
                       └──requires──> Quest Pool (per emotion)
                                          └──requires──> Feedback Pool (per emotion)

World State Persistence
    └──enables──> Region Unlock Logic
                      └──depends-on──> Emotion Histogram
                      └──depends-on──> Visit Count

Companion Presence (Home Screen)
    └──enhances──> Ritual Entry Point
                       └──triggers──> Emotion Check-In

Onboarding Scene
    └──gates──> First Access to Home Screen
    └──establishes──> Emotional Contract (tone, premise, no judgment framing)

Gesture Interactions (fog/leaves)
    └──decorates──> Ritual Entry Point
    └──independent-of──> Check-In Flow (currently parallel, not sequential)
```

### Dependency Notes

- **Gesture interactions are decorative, not gating:** Fog clearing and leaf brushing do not currently gate the check-in flow. This is the right call — making them required would introduce pressure. But it raises a question: do they communicate anything to game state, or are they purely aesthetic? Needs audit.
- **Region unlock depends on emotion histogram:** The world shape is determined by cumulative emotional history. This is the core mechanic differentiating this from a simple journal app. Its tuning determines whether the world feels like it grows with the user or like an achievement grind.
- **Feedback lines close the loop:** Without feedback after quest completion, the ritual has no ending gesture. This is the "forks" moment — the quiet acknowledgment that matters.

---

## Game Mechanics Evaluation Criteria

This section addresses the primary workstream: auditing vibe-coded parameters for unintended gameplay implications.

### Mechanics Currently Implemented (Needs Audit)

**1. Emotion Selection Mechanics**

| Parameter | Current State | Risk | Evaluation Question |
|-----------|--------------|------|---------------------|
| Emotion options presented equally | 4 emotions, no visual hierarchy | LOW | Do any UI affordances (color, size, order) imply one emotion is "better"? |
| Emotion naming | Stuck / Frustrated / Inspired / Alright | MEDIUM | "Inspired" and "Alright" read as more positive — does this create selection bias toward them over time? |
| No "wrong" emotion | All emotions unlock equal quests and feedback | LOW | Verify quest quality parity across emotions — do Stuck quests feel as validating as Inspired quests? |
| Emotion not locked after selection | Can re-check-in (implied by daily-log structure) | LOW | Is this clearly communicated, or do users think they have one shot per day? |

**2. Quest Selection Mechanics**

| Parameter | Current State | Risk | Evaluation Question |
|-----------|--------------|------|---------------------|
| Random selection from pool | `getRandomQuest(emotion)` | MEDIUM | Pure random can repeat same quest multiple visits — feels like the world isn't paying attention |
| Pool exhaustion | Falls back to first quest when pool empties | MEDIUM | When daily log fills (all 10 completed), what happens? Does it start over? Does user see the fallback? |
| Quest relevance to emotion | Hand-curated per emotion | LOW | Read each pool for tone drift — do any quests feel like they belong in a different emotional category? |
| Quest rejectability | Not implemented | LOW | Can users decline a quest and get another? Finch allows skipping. One-quest-only is fine for this ritual but needs to be intentional |

**3. Region Unlock Mechanics**

| Parameter | Current State | Risk | Evaluation Question |
|-----------|--------------|------|---------------------|
| Emotion thresholds (3 check-ins per emotion) | Workshop Glade: 3 Inspired; Fog Valley: 3 Stuck; Warm River: 3 Frustrated | HIGH | This is the most dangerous mechanic. Three check-ins is fast — unlocks in first week. But naming regions after negative emotions (Fog Valley = Stuck, Warm River = Frustrated) could implicitly reward those states |
| Time thresholds (7d / 14d visits) | Observatory Balcony: 7 visits; Long Path: 14 visits | MEDIUM | Is this 7 calendar days or 7 separate visits? If calendar days, it creates pressure. If visit count, it's time-neutral. Code shows `totalVisits` — verify this is visit count not date-gated |
| No region for "Alright" emotion | Alright has no dedicated region | LOW | Intentional or oversight? "Alright" is arguably the healthiest emotional state — not having a region tied to it may deprioritize it |
| Unlock notification design | Unknown | MEDIUM | How are unlocks communicated? If dismissable and gentle, low risk. If prominent or celebratory, conflicts with non-performative tone |

**4. World State Mechanics**

| Parameter | Current State | Risk | Evaluation Question |
|-----------|--------------|------|---------------------|
| Emotion histogram shape | All emotions increment independently | LOW | The histogram captures emotional range — this is healthy. No mechanics should flatten it toward one state |
| Total visits counter | Increments per `recordDailyVisit()` call | LOW | Is it possible to inflate visits by opening/closing? Should be once per calendar day |
| No decay / degradation | World never resets or degrades | LOW | Correct design choice — degradation creates pressure. Confirm nothing erodes on long absence |
| State not shown to user | World state drives unlocks silently | LOW | Good — users don't need to see raw numbers. The world reflects it aesthetically |

**5. Gesture / Ritual Mechanics**

| Parameter | Current State | Risk | Evaluation Question |
|-----------|--------------|------|---------------------|
| Fog clearing | Interactive wipe gesture | LOW | Does clearing the fog persist? Or does it reset each visit? Either is defensible but must be intentional |
| Leaf brushing | Interactive brush gesture | LOW | Same question — does leaf count grow, diminish, or stay constant across sessions? |
| Gesture completion gating | Gestures are NOT required to proceed | LOW | This is correct — ritual invitations, not prerequisites |
| Animation performance | Vibe-coded Animated API usage | MEDIUM | React Native Animated API with multiple concurrent animations is a known performance risk — audit for jank |

---

## Parameter Categories Requiring Documentation

These are the tuning knobs that should be made explicit and configurable so Allie can adjust without code changes.

| Parameter Category | Current Location | Tuning Impact | Notes |
|-------------------|-----------------|---------------|-------|
| Emotion threshold for region unlocks | `lib/storage.ts:checkRegionUnlocks()` hardcoded | HIGH — too low = trivial, too high = abandoned | Should be constants in a config file |
| Visit count for time-based unlocks | Same | HIGH — determines pace of world growth | Should be constants |
| Quest pool size per emotion | `src/data/quests.ts` | MEDIUM — affects repetition rate | Currently 10; could grow |
| Feedback pool size per emotion | `src/data/feedback.ts` | LOW | Currently 5 per emotion |
| Animation durations (fog fade, leaf fall) | Scattered in components | MEDIUM — determines feel/pacing | Should be in a theme/config |
| Aetherling walk speed/path | Home screen component | LOW | Aesthetic, but affects tone |
| Number of fog wisps / leaf count | Home screen | LOW | Affects how quickly scene "feels cleared" |

---

## MVP Definition

This is a milestone evaluation, not a greenfield build. The prototype already has MVP features. The question is: are they working correctly?

### Must Validate Before Building Further (Audit Phase)

- [ ] Emotion naming and visual presentation — do any states carry implicit "right answer" signals
- [ ] Region unlock thresholds — do they create pressure or feel like natural discovery
- [ ] Quest pool fallback behavior — what happens when pool exhausts
- [ ] Visit counting — is it once per day or inflatable
- [ ] Fog/leaf state persistence — intentional design or oversight
- [ ] Quest tone parity across emotions — do Stuck quests feel as validating as Inspired quests

### Add After Validation (v1.x)

- [ ] Quest skip/another option — low pressure exit from a quest that doesn't fit today; aligns with "no coercion" pillar
- [ ] Gentle ambient world changes on return — small visual detail that changes without check-in, invites return without demanding it
- [ ] Alright-specific region — give the healthiest emotional state its own place in the world

### Future Consideration (v2+)

- [ ] Seasonal or time-of-year world aesthetics — Emberfall in winter feels different than summer; pure aesthetic, no gameplay change
- [ ] Expanded quest pool — more variety reduces repetition as usage increases
- [ ] World detail that deepens with total visits — non-emotional progression that rewards longevity without pressure

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Emotion selection bias audit | HIGH | LOW (review only) | P1 |
| Region unlock threshold documentation + config | HIGH | LOW (refactor constants) | P1 |
| Visit count validation (daily cap) | HIGH | LOW (code review) | P1 |
| Quest fallback behavior audit | MEDIUM | LOW (code review) | P1 |
| Fog/leaf persistence design decision | MEDIUM | LOW (decision + small code) | P1 |
| Gesture-to-game-state connection clarification | MEDIUM | LOW (decision only) | P1 |
| Quest skip / another option | MEDIUM | LOW | P2 |
| Ambient world change on return (no check-in) | MEDIUM | MEDIUM | P2 |
| Alright region unlock | LOW | LOW | P3 |
| Expanded quest pools | LOW | LOW | P3 |

---

## Competitor Feature Analysis

| Feature | Finch (self-care pet) | Animal Crossing Pocket Camp | Lanternkeeper Emberfall |
|---------|----------------------|----------------------------|------------------------|
| Companion presence | Always-visible bird pet | Character-driven world | Aetherling on home screen — correct |
| Emotion check-in | Mood rating + energy score | None | Qualitative 4-state selection — differentiator |
| Streak mechanics | Optional 2/5/7/14 day streaks | Seasonal events (soft pressure) | None — by design, correct |
| World progression | Pet grows with activity points | Resource gathering | Emotion-gated region unlocks — risk: implicit hierarchy |
| Penalties for absence | None | Missing seasonal events | None — correct, but verify time-based unlocks aren't calendar-gated |
| Quest/task type | User-defined daily goals | Gather/build tasks | Hand-curated emotion-matched micro-quests — differentiator |
| Feedback after completion | Pet reacts/grows | Resource reward | Aetherling single-line response — differentiator (no score, no points) |
| Monetization pressure | Yes (premium features) | Yes (in-app purchases) | None (it's a gift) — removes a major cozy game failure mode |

---

## Sources

- Designing for Coziness — Kitfox Games / Tanya X. Short: https://medium.com/kitfox-games/designing-for-coziness-d33d2519a59e
- Gamedeveloper.com Designing for Coziness: https://www.gamedeveloper.com/design/designing-for-coziness
- Finch App review and mechanics analysis: https://maggiedaviscounseling.wordpress.com/2026/01/03/mental-health-app-review-finch-why-it-works-for-emotional-regulation-especially-with-dbt/
- Finch gamification criticism: https://yourstory.com/2022/06/app-review-self-care-pet-finch-gamifies-mental-wellbeing
- Ritual Features: The Quiet Strategy Behind Daily Puzzle Games: https://productpickle.online/2025/07/20/ritual-features-the-quiet-strategy-behind-daily-puzzle-games-on-linkedin-and-beyond/
- Game balance and parameter tuning: https://gamedesignskills.com/game-design/game-balance/
- Exploring the Design of Companions in Video Games: https://dl.acm.org/doi/10.1145/3464327.3464371
- Designing Habit-Forming Digital Products — Habit Loop: https://medium.com/@danielealtomare/designing-habit-forming-digital-products-an-exploration-of-the-habit-loop-and-its-application-f0961810e9c2

---
*Feature research for: calm/ritual companion mobile game*
*Researched: 2026-04-11*
