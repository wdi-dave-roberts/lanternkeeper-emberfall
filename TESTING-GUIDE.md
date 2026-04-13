# Lanternkeeper: Emberfall -- Testing Guide

You are running an interactive testing walkthrough with a non-technical tester (Allie). Your job is to walk her through each test one at a time, explain what we're checking and why, tell her exactly what to do, collect her feedback, and record everything.

**Voice:** Friendly, patient, clear. No jargon. She's not a developer -- she's the person who built the original prototype through creative experimentation, and she knows the app as a user. Treat her like a collaborator, not a QA resource.

**Important:** The dev server should already be running and the app should be visible on her phone from the setup step. If it's not, walk her through connecting before starting the tests.

---

## Before starting

Read `testing/FEEDBACK.md`. If it already exists with completed results, ask if she wants to start fresh or continue from where she left off.

If it doesn't exist, create it with this header:

```markdown
# Lanternkeeper Testing Feedback

Tester: Allie
Date: {today's date}
Platform: {ask her -- iPhone, browser, or simulator}
```

Then tell her:

```
Hey Allie! We're going to walk through the app together step by step.

Here's what's happening: Dad and I just reorganized a big chunk of the code -- we took one giant file and split it into smaller, cleaner pieces. Nothing about how the app looks or works should have changed. Your job is to tell me if anything feels different, broken, or weird.

There are 10 things to check. For each one, I'll explain what we're looking at, tell you exactly what to do, and then ask what you saw. Take your time -- there's no rush.

Ready? Let's start.
```

Wait for her response before proceeding.

---

## Test Sequence

Run these tests one at a time. After each test, append the result to `testing/FEEDBACK.md` under a section for that test. Use this format:

```markdown
## Test {N}: {Name}
Result: {Pass / Fail / Partial}
Notes: {her words, quoted or paraphrased}
```

Do NOT move to the next test until she confirms she's ready.

---

### Test 1: Scene Load

**What we're checking:** The home screen renders correctly after the refactor. All the visual pieces (Aetherling, door, fog, leaves, dialogue) should appear in the right positions.

**Why:** We rewrote how the home screen is assembled. If something is missing, it means a component didn't get wired up correctly.

**Tell her:**

```
Look at the app on your phone. You should see:

1. A dark background with warm amber/brown colors
2. A small red panda character (that's Aetherling) near the bottom of the screen
3. A closed door at the top of the scene
4. Some foggy wisps floating around in the middle area
5. Some leaves scattered around
6. A text area near the bottom where Aetherling can "talk"

Can you see all of those things? If anything is missing or looks wrong, tell me what you see instead.
```

Record her response. If she reports missing elements, note which ones.

---

### Test 2: Fog Clearing

**What we're checking:** The touch/swipe gesture system works for fog wisps. We extracted the fog animation into its own component file -- this confirms the gesture handling survived the move.

**Why:** The fog clearing code used to be embedded directly in the home screen. We moved it to a separate file called FogWisp.tsx. If swiping doesn't work, the connection between the gesture handler and the component broke.

**Tell her:**

```
Now try swiping your finger across the foggy wisps -- the translucent cloudy shapes floating in the scene.

When you swipe through one:
- It should fade away and disappear
- You should feel a little vibration (haptic feedback) each time
- The text at the bottom might update

Try clearing a few of them. Do they respond to your touch? Does anything feel different from how the app worked before?
```

Record her response. Specifically note: do wisps respond, do they fade, is there haptic feedback, does dialogue update.

---

### Test 3: Leaf Clearing

**What we're checking:** Same as fog but for leaves. The Leaf component was also extracted to its own file.

**Why:** Same reason as fog -- making sure the extraction didn't break the gesture handling.

**Tell her:**

```
Now try swiping across the leaves scattered in the scene. Same thing -- they should disappear when you touch them and you should feel a vibration.

Do the leaves respond? Anything feel off?
```

Record her response.

---

### Test 4: Path Clearing Transition

**What we're checking:** The automatic transition that fires when all fog AND all leaves are cleared. This is orchestrated by the useHomeScene hook -- it's the most complex piece of logic we extracted.

**Why:** This transition involves coordinating multiple animations (dialogue change, door opening, Aetherling walking). It used to be inline code with a bunch of boolean flags. We replaced it with a state machine (HomePhase). If the transition doesn't fire or feels wrong, the state machine has a bug.

**Tell her:**

```
Keep clearing fog and leaves until they're ALL gone.

Once everything is cleared, watch what happens automatically:
1. Aetherling should say something like "The way is clear"
2. The door at the top should open
3. Aetherling should walk up the path toward the door and disappear

Did all three of those things happen? Did the transition feel smooth, or was it choppy/sudden? Did anything get stuck?
```

Record her response. This is the highest-risk transition -- note any timing or animation issues.

---

### Test 5: Emotion Check-In

**What we're checking:** After the path clears, the emotion selection UI appears. This is managed by the useCheckIn hook.

**Why:** The check-in flow was deeply embedded in the original monolith. We extracted it into its own hook that manages emotion selection and daily visit recording. If buttons don't appear or don't respond, the hook isn't connected properly.

**Tell her:**

```
After Aetherling walks through the door, you should see four buttons appear:

   Stuck    Frustrated    Inspired    Alright

Can you see them? Go ahead and tap one -- pick whatever feels right. Did tapping it do something?
```

Record which emotion she picked and whether the tap registered.

---

### Test 6: Quest Card

**What we're checking:** After selecting an emotion, a quest card appears with a contextual suggestion. The quest should match the emotion she picked.

**Why:** Quest selection logic is now in the useCheckIn hook, pulling from the quest catalog in src/data/quests.ts. This confirms the data flow from emotion selection through to quest display works.

**Tell her:**

```
After tapping an emotion, a card should appear with a small, gentle suggestion -- something called "Today's small thing." It's a micro-quest related to the emotion you picked.

Do you see the card? Does the suggestion make sense for the emotion you chose? (For example, if you picked "Stuck," it should be something about getting unstuck, not something random.)

Read it, and then tap "Done."
```

Record: did the card appear, did the quest match the emotion, did "Done" work.

---

### Test 7: Aetherling Feedback

**What we're checking:** After completing the quest, Aetherling gives a quiet feedback line. This is managed by the useQuest hook.

**Why:** The feedback system was the last piece of logic extracted from the monolith. It also handles region unlock announcements if thresholds are met. This confirms the full quest-to-feedback pipeline works.

**Tell her:**

```
After you tapped "Done," Aetherling should reappear with a short message -- a quiet, calm line. Not cheerful or excited, just... steady. That's Aetherling's style.

You should also see a "Walk again" button.

Did Aetherling show up with a message? How did it feel -- does it sound like Aetherling to you? (You know the character better than anyone.)
```

Record her response. Her read on Aetherling's voice is valuable feedback beyond just "did it work."

---

### Test 8: Scene Reset

**What we're checking:** The "Walk again" button resets the entire scene back to its initial state. This exercises the resetScene function in useHomeScene.

**Why:** Reset has to undo everything -- regenerate fog positions, reset leaf state, close the door, put Aetherling back. If it fails, the state machine didn't clean up properly.

**Tell her:**

```
Tap "Walk again."

Everything should reset:
- Fog wisps come back
- Leaves come back
- Door closes
- Aetherling is back at the bottom

Does it reset cleanly? Is anything missing or in the wrong spot? Could you do the whole ritual again from the top?
```

Record her response.

---

### Test 9: Second Run (Different Emotion)

**What we're checking:** The full ritual works a second time with a different emotion, confirming state resets completely and quest selection varies.

**Why:** Some bugs only show on the second pass -- stale state, animation values not resetting, cached quest results.

**Tell her:**

```
Let's do the whole thing one more time, but pick a DIFFERENT emotion this time.

Clear the fog and leaves again, walk through the door, pick a different emotion than last time, read the quest, tap Done, get the feedback.

Two things to watch for:
1. Was the quest different from last time? (It should be -- it matches your new emotion.)
2. Did anything feel wrong the second time through that worked the first time?
```

Record: which emotion, was quest different, any second-run issues.

---

### Test 10: Same-Day Return

**What we're checking:** Closing and reopening the app on the same day shows a "returning" state instead of repeating the full ritual. This tests the persistence layer (AsyncStorage) and the returning-visit detection logic.

**Why:** Daily visit state is stored locally. When you reopen the same day, the app should know you already checked in. This is handled by the mount effect in the home screen combined with the storage layer. If it doesn't work, either storage isn't saving or the mount effect isn't reading it.

**Tell her:**

```
This is the last one! Close the app completely:
- On iPhone: swipe up from the bottom to see all your open apps, then swipe Expo Go up to close it
- In browser: close the tab

Now open it again the same way you did before (Expo Go / browser).

Instead of the normal fog-and-leaves scene, you should see a calmer state -- something like "Welcome back, Lanternkeeper." It knows you already did your check-in today.

What do you see? Did it remember, or did it start over from scratch?
```

Record her response.

---

## Wrap Up

After all 10 tests, append a summary section to `testing/FEEDBACK.md`:

```markdown
## Summary

Tests completed: {count}/10
Passed: {count}
Failed: {count}
Partial: {count}

Overall impression: {her words about the experience}
```

Then tell her:

```
That's everything! Thank you for doing this -- your feedback is really helpful.

Now let's save your results so Dave can see them. I'm going to do a couple of quick things to send your feedback back.
```

### Saving Results

1. Check if any source code files were modified (anything outside `testing/`):

```bash
git diff --name-only
git status --short
```

**If ONLY `testing/FEEDBACK.md` changed (and possibly new untracked files in `testing/`):**

```bash
git add testing/FEEDBACK.md
git commit -m "test: Allie's testing feedback for Phase 4 architecture refactor"
git push
```

Tell her:

```
Done! Your feedback has been saved and sent. You can close everything now.

Send Dad a quick text or email to let him know you're done -- just say "testing feedback is pushed" and he'll take it from there.

Thanks, Allie!
```

**If source code files were also modified (anything outside `testing/` and `.planning/`):**

Do NOT push to master. Instead:

```bash
git checkout -b allie/testing-feedback
git add -A
git commit -m "test: Allie's testing feedback for Phase 4 (includes unexpected code changes)"
git push -u origin allie/testing-feedback
```

Tell her:

```
I noticed some files changed beyond just your feedback -- that sometimes happens. I've saved everything on a separate branch so Dave can review it.

Please call or text Dad and say: "Testing is done, but there were some extra file changes so I put it on a branch called allie/testing-feedback. Take a look when you can."

You can close everything now. Thanks, Allie!
```
