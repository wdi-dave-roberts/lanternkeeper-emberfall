# Pitfalls Research

**Domain:** Calm/ritual companion mobile game — React Native prototype refinement
**Researched:** 2026-04-11
**Confidence:** HIGH (known codebase) / MEDIUM (domain patterns from research)

---

## Critical Pitfalls

### Pitfall 1: Improving the Soul Out of the Prototype

**What goes wrong:**
A technically sound refactoring process produces code that is cleaner, more testable, and
architecturally coherent — but the app no longer _feels_ right. The friction that was "wrong"
turns out to have been load-bearing for the ritual. The hesitation in an animation, the slightly
imprecise gesture hitbox, the simple fog wisp that "should" be spatially hashed — these quirks
created a texture of presence. Engineers optimize them away and the app becomes correct but cold.

**Why it happens:**
Developers optimizing a vibe-coded prototype focus on measurable defects (frame rate, code
duplication, state inconsistencies) while the immeasurable emotional qualities that actually made
the prototype work were never documented or defended. There is no failing test for "feels like
Aetherling is here." There is also a natural engineer bias toward elegance — if code _can_ be
refactored, it usually gets refactored, regardless of whether it should be.

**How to avoid:**
Before touching any code, document the emotional experience explicitly: What does clearing fog
_feel_ like? What is the pacing of Aetherling's walk? What makes the ritual feel safe? Use these
as acceptance criteria alongside technical criteria. After any significant change, do a "pillar
check" against CLAUDE.md: does the user feel more understood, more inspired, less pressured? If
the answer to any of these is "not sure," pause before shipping. Keep a "feel log" — short notes
after sessions about what the experience is like.

**Warning signs:**
- Team starts describing the app in technical terms ("the animation system") rather than
  experiential terms ("the morning walk feels calm")
- Refactoring PRs do not include a note about how the change affects the experience
- The 3 design pillars are not referenced in code review
- Someone says "the fog clearing is just a gesture handler" without irony

**Phase to address:**
Audit phase (first milestone). Establish emotional acceptance criteria before any refactoring work
begins. Every subsequent phase should check against them.

---

### Pitfall 2: Region Unlocks Becoming a Pressure Loop

**What goes wrong:**
Region unlocks are tied to accumulating emotions (e.g., "inspired" count, total days visited).
This creates an implicit scoreboard. The user starts selecting emotions based on what unlocks
regions fastest rather than what they actually feel. "Stuck" becomes a bad choice. "Inspired"
becomes the optimal choice. The emotion check-in — the most important moment of the ritual — is
corrupted into a min-maxing decision. The app stops mirroring the user's state and starts shaping
it toward a desired outcome.

**Why it happens:**
Progression systems are the default mental model for "rewarding engagement" in mobile games. A
first-time game developer will reach for unlock mechanics because they feel natural — you do a
thing, you get a reward. The unintended consequence (implicit emotion hierarchy) is not obvious
until you sit down and ask "what would a player learn about which emotions are 'good'?"

**How to avoid:**
Audit all unlock conditions and ask: does this condition create a "correct" emotion to select?
If any unlock is gated on a specific emotion being chosen more than others, the unlock either
needs to be redesigned (neutral condition) or removed. Unlocks should be time-based, visit-based,
or based on completing the ritual at all — never on which emotion was selected. The emotion
selection must remain judgment-free at the mechanics layer as well as the UX layer.

**Warning signs:**
- Any unlock condition references a specific emotion count (e.g., `inspiredCount >= 3`)
- QA reveals a tendency to select one emotion more than others after unlocks are visible
- A user ever says "I should pick Inspired today so I can unlock the valley"
- Region unlock progress is visible as a live counter during the emotion selection flow

**Phase to address:**
Game mechanics audit. This is a first-pass check before any new mechanics are added.

---

### Pitfall 3: The Animated API JS-Thread Jank Trap

**What goes wrong:**
The existing code uses React Native's built-in `Animated` API (not Reanimated) for animations
including fog wisps, the Aetherling walk, and the lantern glow. When the JS thread is busy
(storage loads, state updates, gesture calculations) these animations stutter. On low-end Android
devices the experience degrades significantly. The fog clearing — the ritual's opening gesture —
can feel unresponsive on the exact devices most likely to be used by Garrett.

**Why it happens:**
The vibe-coded prototype was built with the default Animated API because it is the first result
in React Native docs and tutorials. `useNativeDriver: true` helps for simple transform/opacity
animations but does not protect against JS thread contention during concurrent work. The code
already has an identified bottleneck: `panGesture.onUpdate()` runs distance checks against all
fog wisps and leaves on every touch frame (CONCERNS.md line 83-90). This runs on the JS thread,
competing directly with the Animated updates.

**How to avoid:**
Migrate gesture-critical animations to Reanimated worklets. Reanimated runs both animation logic
and gesture callbacks on the UI thread, bypassing the JS bridge entirely. The project already has
`react-native-reanimated` as a dependency (CONCERNS.md line 175) — this is a migration, not a
new dependency. Priority order: (1) fog/leaf clearing gestures first (user-facing feel), (2)
Aetherling walk, (3) atmospheric animations. Do not migrate everything at once — migrate one
subsystem, verify feel, continue.

**Warning signs:**
- Fog clearing feels "sticky" or delayed on first interaction after app cold start
- Animations pause briefly when AsyncStorage operations complete
- Frame rate drops visibly during the leaf brush gesture
- Testing on mid-range Android shows jank that doesn't appear on iOS simulator

**Phase to address:**
Performance optimization phase. Audit MUST precede migration — document which animations are
currently Animated vs Reanimated before touching anything.

---

### Pitfall 4: Implicit State Machine Explosion

**What goes wrong:**
The home screen currently manages 5+ interdependent boolean states (`emotion`, `questDone`,
`alreadyCheckedIn`, `readyForCheckIn`, `pathCleared`) with no formal state machine. Adding one
new feature — even something as simple as a new animation trigger — requires understanding all
possible combinations of these booleans and adding the correct guard. A developer who doesn't
fully understand the existing state space adds a guard that is correct for the happy path but
creates an invalid state on an edge case. State corruption happens silently and is hard to
reproduce.

**Why it happens:**
Boolean flags are the natural unit of thinking for web/API developers (Dave's background). In a
game with a distinct phases (pre-ritual, gesture phase, emotion select, quest, completion, done),
enums and explicit state machines are more appropriate. The vibe-coded prototype was built
sequentially and the state grew organically without a plan.

**How to avoid:**
Extract the home screen flow into an explicit state machine before adding any new features. Define
all valid states as a TypeScript union type or enum. Define valid transitions as a lookup table or
reducer. Invalid state combinations become type errors, not runtime bugs. This is one of the
few architectural changes that will actively prevent a class of bugs rather than just improve
readability. CONCERNS.md already identifies this as the highest fragility area.

**Warning signs:**
- A bug is described as "only happens when you do X, then Y, then tap Z quickly"
- Fixing one UI state bug causes another
- A new developer (Allie) can't predict what the screen will show without tracing state manually
- `if (emotion && !questDone && !alreadyCheckedIn && readyForCheckIn)` appears in render logic

**Phase to address:**
Architecture audit / code quality phase. Block any new feature development until state is
formalized.

---

### Pitfall 5: Duplicate Storage Schemas Leading to Silent Data Loss

**What goes wrong:**
`App.tsx` saves one schema. `app/(tabs)/index.tsx` loads another. The DailyLog type is defined
in two places with different fields. The user completes a ritual — data is saved. Next day the app
loads and the ritual state is blank because the loader is looking for fields that the saver never
wrote. No error appears. The user sees the app as if they never completed yesterday's ritual.
This is the most trust-destroying failure for a ritual companion: the app that's supposed to
remember you forgets you.

**Why it happens:**
Vibe-coded prototypes grow schema-first-and-query-second — the AI generates a storage write in
one context and a storage read in another without checking for consistency. The duplicate storage
layers in this project (CONCERNS.md lines 7-25) are a direct artifact of this pattern.

**How to avoid:**
Storage consolidation must be the first technical task, not a background cleanup item. The fix:
(1) define DailyLog exactly once in a canonical types file, (2) delete `src/storage/storage.ts`,
(3) update all imports to the single `lib/storage.ts`, (4) write a unit test that saves a full
DailyLog and loads it back and asserts equality. This test becomes the guard against future
schema drift. Do not add any new features until this is resolved.

**Warning signs:**
- Completing the ritual one day but seeing the empty state the next morning
- `loadTodayLog()` returns null after `saveLog()` was called
- TypeScript says `quest.text` is valid but the runtime value is a string
- Two imports of DailyLog that don't point to the same file

**Phase to address:**
Storage consolidation — this must be Phase 1 or Part 1 of the technical audit phase.

---

### Pitfall 6: "Fixing" Aetherling's Voice Into Generic Warmth

**What goes wrong:**
A developer (or AI) editing dialogue for "polish" softens Aetherling's dry restraint into
something more conventionally encouraging. The edit seems kind — it adds warmth. But Aetherling's
value is specifically the restraint. "Fog lost a little ground." is powerful because it doesn't
try to make you feel good. Change it to "You did great today!" and the whole companion relationship
resets to generic positive reinforcement. The user no longer feels understood — they feel managed.

**Why it happens:**
Conventional UX writing best practices push toward warmth and positivity. Copy editors without
context will "improve" dry text. AI-assisted writing defaults to encouraging language. The
CLAUDE.md voice rules exist precisely because this drift is natural and constant.

**How to avoid:**
All dialogue changes must be reviewed against the CLAUDE.md voice rules explicitly. Create a
"voice check" step in the PR process for any text change. The rubric: (1) no exclamation points,
(2) no motivational clichés, (3) sentence is shorter than it seems like it needs to be,
(4) warmth is earned by restraint, not stated directly. When in doubt, the drier version is
correct.

**Warning signs:**
- Any exclamation point appears in Aetherling dialogue
- Words like "amazing," "proud," "you got this," or "keep going" appear
- Feedback lines exceed two sentences
- Someone describes a dialogue change as "making it more encouraging"

**Phase to address:**
Ongoing. Establish voice review as a standing convention before any content changes, and check
all existing dialogue against voice rules during the game design audit.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Leaving dual storage layers | No migration work needed now | Silent data loss, developer confusion, schema drift | Never — consolidate before any new features |
| Using Animated API for all animations | No library migration needed | JS thread jank, especially on Android, during gesture interactions | Acceptable for non-interactive atmospheric animations only |
| Boolean flags instead of state machine | Quick to add new conditions | State explosion, untraceable bugs, blocks new features safely | Never for flow-critical home screen state |
| Hardcoded scene config with magic numbers | Works on test devices | Layout breaks on unusual screen ratios, untestable | Acceptable short-term; document magic numbers explicitly |
| No tests | Faster initial development | Regressions invisible; refactoring is dangerous | Never acceptable before any significant refactor |
| Inline dialogue strings | Easier to read in-context | Impossible to audit voice consistency; can't externalize for translation | Acceptable now; extract to constants before v1 |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| AsyncStorage | JSON.parse without schema validation; crash on corrupt data | Validate against a Zod schema on load; return default state on invalid |
| Expo Router + first-lantern screen | `router.replace()` behavior differs between navigation stacks; onboarding can get stuck | Test both fresh-install and return-user paths; add a reset mechanism for testing |
| React Native Reanimated + Gesture Handler | Mixing Animated and Reanimated for the same element causes visual conflicts | Commit to one library per animated element; never mix APIs on the same value |
| AsyncStorage + timezone day boundaries | Day comparison using date strings fails at midnight rollover | Use UTC date normalization and test with a mocked clock |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Pan gesture distance checks on every frame | Fog clearing feels sticky; frame rate drops below 60fps on Android mid-range | Move to Reanimated worklets; add debounce; use spatial bucketing for hit detection | Immediate on low-end Android; subtle on high-end |
| Animation refs not cleaned up on reset | Memory creeps up with repeated "Walk again" taps; eventually causes slowdown | Cancel all Animated loops in useEffect cleanup; use Reanimated which auto-cleans | After ~20-30 resets in a single session |
| World state loaded without loading state | Brief blank flicker on cold start before state populates | Add `isLoading` flag; show skeleton state during AsyncStorage fetch | First open every session; worse on slow devices |
| RedPanda re-renders on every orientation event | Walk animation restarts unexpectedly; subtle jank on component mount | Memoize pathPoints inside RedPanda; use deep equality for memo deps | Any orientation change; noticeable on fold/landscape |
| Region unlock check on every emotion record | Negligible now; grows with region count | Check only conditions affected by what just changed | Not a problem at 5 regions; matters at 20+ |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Emotion selection implies hierarchy (some emotions "better" than others) | User selects strategically, not honestly; ritual becomes a game to play rather than a mirror to hold | No unlock or progression tied to specific emotion choice; all emotions receive equal visual weight |
| Region unlock progress visible during ritual flow | Turns morning check-in into optimization exercise | Show world changes _after_ completion, not as a motivator during it |
| Onboarding that can never be seen again | Can't share with a new device; can't reset for demo; no recovery path | Add developer/settings reset for first-lantern state |
| Gesture hitboxes too small on first use | User swipes, nothing clears; feels broken; breaks ritual before it starts | Tune hitboxes generously; err toward clearing on approximate contact |
| No feedback that the app "remembers" the user | User who opens after a week away feels like a stranger | Aetherling's opening line should acknowledge elapsed time with quiet warmth, not pressure |

---

## "Looks Done But Isn't" Checklist

- [ ] **Emotion selection:** Verify no unlock condition references a specific emotion type — check `lib/storage.ts` unlock conditions for emotion-specific gates
- [ ] **Voice consistency:** All existing Aetherling dialogue checked against CLAUDE.md rules — no exclamation points, no clichés, no multi-sentence warmth
- [ ] **Storage consolidation:** `saveLog()` and `loadTodayLog()` operate on the same schema — verify with a round-trip unit test
- [ ] **Animation cleanup:** "Walk again" reset explicitly cancels all running Animated loops — no orphaned animation refs
- [ ] **Day rollover:** `totalDaysVisited` uses UTC comparison and handles midnight-crossover correctly — test with mocked dates
- [ ] **Gesture feel:** Fog and leaf clearing tested on a physical Android mid-range device, not just iOS simulator
- [ ] **Cold start flicker:** App shows a loading state rather than blank before AsyncStorage returns
- [ ] **State machine:** All valid home screen states enumerated; invalid combinations are type errors not runtime bugs

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Soul lost to over-refactoring | HIGH | Stop all technical work; restore from last commit that "felt right"; use that build as the baseline and restart with documented emotional criteria |
| Emotion hierarchy baked into progression | MEDIUM | Audit all unlock conditions; replace emotion-specific gates with visit-count or time-based equivalents; test with a session where you deliberately select only "Stuck" |
| Storage schema corruption in production | HIGH | Add a data migration layer to `loadWorldState()`; version the schema; write a one-time repair function for invalid states |
| State machine explosion | MEDIUM | Extract to reducer/state machine before the next feature; use TypeScript discriminated union to enforce valid states; add unit tests for each transition |
| Voice drift | LOW | Review all dialogue against CLAUDE.md voice rules; revert any line that fails; add voice check to PR template |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Soul lost to refactoring | Phase 1 (pre-audit) — document emotional acceptance criteria first | After each phase: pillar check against CLAUDE.md |
| Emotion hierarchy in unlocks | Phase 2 (game mechanics audit) — audit all unlock conditions | Test session where only "Stuck" is selected; no unfair progression |
| Animated API JS-thread jank | Phase 3 (performance optimization) — migrate gesture-critical paths to Reanimated | Physical Android device test for 60fps during fog clearing |
| State machine explosion | Phase 2 (architecture audit) — extract state machine before new features | TypeScript union type for all valid states; no boolean flag combos in render |
| Duplicate storage schemas | Phase 1 (storage consolidation) — first technical task | Round-trip unit test: save → load → assert equality |
| Voice drift | Ongoing from Phase 1 — establish review convention | PR checklist item for any dialogue change |
| Gesture hitboxes too small | Phase 3 (polish/feel) — verify on physical device | First-time user test with someone unfamiliar with the gesture |
| Day rollover bug | Phase 2 (storage audit) — fix date comparison | Unit test with dates either side of midnight |

---

## Sources

- Project-specific codebase analysis: `.planning/codebase/CONCERNS.md` (2026-04-11)
- Project context and design pillars: `CLAUDE.md` and `.planning/PROJECT.md`
- React Native performance: [React Native Reanimated docs](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/), [Callstack 60fps guide](https://www.callstack.com/blog/60fps-animations-in-react-native)
- Vibe-coded prototype patterns: [From Vibe Code to Production](https://addjam.com/blog/2026-01-12/from-vibe-code-to-production/), [Vibe Coding Cleanup Guide](https://smart-webtech.com/blog/vibe-coding-cleanup-the-guide-to-vibe-code-fixing-and-refactoring/)
- Emotion-based game design: [Influencing emotions in game design](https://medium.com/my-games-company/influencing-emotions-in-game-design-theories-and-methods-f8903d1d55ff), [MDE framework](https://www.oreilly.com/library/view/designing-games/9781449338015/ch01.html)
- Calm game design: [Designing Calm UX Principles](https://www.uxmatters.com/mt/archives/2025/05/designing-calm-ux-principles-for-reducing-users-anxiety.php)
- Streak/pressure mechanics: [How Streaks Leverages Gamification](https://trophy.so/blog/streaks-gamification-case-study)
- Indie game prototype pitfalls: [Navigating Game Prototype Pitfalls](https://www.argentics.io/navigating-game-prototype-pitfalls-expert-strategies-for-success), [Prototyping: You're Probably Doing It Wrong](https://gamesfromwithin.com/prototyping-youre-probably-doing-it-wrong)
- Companion design research: [Exploring the Design of Companions in Video Games](https://www.researchgate.net/publication/351765047_Exploring_the_Design_of_Companions_in_Video_Games)

---

*Pitfalls research for: calm/ritual companion mobile game — React Native prototype refinement*
*Researched: 2026-04-11*
