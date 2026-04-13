# Lanternkeeper: Emberfall -- Testing Guide

We just did a big refactor of the home screen -- broke the 1300-line monolith into smaller pieces (hooks, components) so the code is easier to read and work with. Nothing should look or feel different when you use the app. This guide walks you through testing to make sure we didn't break anything.

---

## Setup

You need Node.js installed on your computer. If you don't have it, download it from https://nodejs.org (pick the LTS version).

1. **Clone the repo:**
   ```bash
   git clone https://github.com/wdi-dave-roberts/lanternkeeper-emberfall.git
   cd lanternkeeper-emberfall
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the dev server:**
   ```bash
   npx expo start
   ```

4. **Open the app** (pick one):
   - **iPhone (recommended):** Install "Expo Go" from the App Store. Scan the QR code shown in your terminal with your Camera app. Your phone and computer need to be on the same WiFi network.
   - **Browser:** Open `http://localhost:8081` -- works for visual checks but touch gestures feel different than on a real phone.
   - **iOS Simulator:** Press `i` in the terminal (requires Xcode installed on a Mac).

---

## The Ritual Flow

Emberfall has one core loop. Walk through each step in order, and fill out the feedback form at the bottom as you go.

### 1. Scene loads

You see a dark, warm-toned screen (amber and deep brown). Three things to spot:

- **Aetherling** -- a small red panda character near the bottom
- **A closed door** at the top of the scene
- **Fog wisps and leaves** floating in between

There should be a dialogue area near the bottom where Aetherling "speaks."

### 2. Clear the fog

**Swipe your finger** across the fog wisps (translucent cloudy shapes).

What should happen:
- Each wisp fades away when you swipe through it
- You feel a small vibration on each clear (phone only, not in browser)
- Aetherling's dialogue text updates as you clear

### 3. Clear the leaves

**Swipe across the leaves** scattered in the scene. Same behavior -- they disappear on touch with haptic feedback.

### 4. The path clears

Once all fog and leaves are gone, this happens automatically:

- Dialogue says something like "The way is clear"
- The door at the top opens
- Aetherling walks up the path and disappears

This should feel smooth and unhurried. Watch for it.

### 5. Emotion check-in

Four buttons appear: **Stuck** / **Frustrated** / **Inspired** / **Alright**

**Tap any one.** (Try "Alright" your first time through.)

### 6. Quest card

A card appears with a gentle suggestion -- "Today's small thing." This is a micro-quest tied to the emotion you picked.

**Tap "Done"** when you've read it.

### 7. Aetherling's feedback

Aetherling reappears with a short, quiet line. It should feel calm and understated -- no exclamation points, no cheerleading.

A **"Walk again"** button appears.

### 8. Reset

**Tap "Walk again."** The scene should reset to the beginning -- fog returns, leaves return, door closes, Aetherling is back at the bottom. You can do the whole ritual again.

### 9. Same-day return

Close the app completely, then reopen it. Instead of the full ritual, you should see a resting state with a message like "Welcome back, Lanternkeeper" -- because you already checked in today.

---

## Feedback Form

Copy everything below this line, paste it into a text message or note, and fill it in as you test. Send it to Dave when you're done.

```
LANTERNKEEPER TESTING FEEDBACK
==============================

Tested on: [iPhone / Browser / Simulator]
Date:

--- SCENE LOAD ---
Did the scene load without errors?          [Yes / No]
Could you see Aetherling (red panda)?       [Yes / No]
Could you see the door at the top?          [Yes / No]
Could you see fog wisps?                    [Yes / No]
Could you see leaves?                       [Yes / No]
Did the dialogue area appear?               [Yes / No]
Notes:


--- FOG CLEARING ---
Did fog wisps respond to swiping?           [Yes / No]
Did each wisp fade/disappear on swipe?      [Yes / No]
Did you feel haptic feedback? (phone only)  [Yes / No / N/A]
Did the dialogue text change as you cleared? [Yes / No]
Notes:


--- LEAF CLEARING ---
Did leaves respond to swiping?              [Yes / No]
Did each leaf disappear on swipe?           [Yes / No]
Did you feel haptic feedback? (phone only)  [Yes / No / N/A]
Notes:


--- PATH CLEARING ---
Did the door open after clearing everything? [Yes / No]
Did Aetherling walk up the path?            [Yes / No]
Did the walking animation look smooth?      [Yes / No]
Did Aetherling disappear at the end?        [Yes / No]
Notes:


--- EMOTION CHECK-IN ---
Did four emotion buttons appear?            [Yes / No]
Which emotion did you pick?
Did tapping it work on the first try?       [Yes / No]
Notes:


--- QUEST ---
Did a quest card appear after emotion pick? [Yes / No]
Did the quest text make sense for your emotion? [Yes / No]
Did tapping "Done" advance to the next step? [Yes / No]
Notes:


--- FEEDBACK ---
Did Aetherling reappear with a feedback line? [Yes / No]
Did the feedback feel calm and in-character?  [Yes / No]
Did the "Walk again" button appear?           [Yes / No]
Notes:


--- RESET ---
Did "Walk again" reset the full scene?       [Yes / No]
Did fog and leaves come back?                [Yes / No]
Did the door close again?                    [Yes / No]
Was Aetherling back at the bottom?           [Yes / No]
Notes:


--- SAME-DAY RETURN ---
Did you test closing and reopening the app?  [Yes / No]
Did it show a "Welcome back" state?          [Yes / No]
Or did it restart the full ritual?           [Full ritual / Welcome back / Other]
Notes:


--- SECOND RUN (optional) ---
If you ran through the ritual a second time,
did you pick a different emotion?
Did the quest change to match?              [Yes / No / Didn't test]
Notes:


--- OVERALL ---
Did anything crash or show a red error screen? [Yes / No]
Did anything feel wrong, laggy, or broken?
Anything that confused you?
Anything that felt good?


--- VIBE CHECK ---
Does the app still feel calm and unhurried?  [Yes / No]
Does Aetherling still feel like Aetherling?  [Yes / No]
Anything feel off about the mood or tone?

```

---

## What counts as broken

- App crashes or shows a red error screen
- Fog or leaves don't respond to swiping
- Aetherling never walks the path after clearing
- Emotion buttons never appear
- Tapping "Done" does nothing
- "Walk again" doesn't reset the scene

## What's fine to ignore

- Slow first load (the bundler is compiling for the first time)
- Package version warnings in the terminal
- Minor visual differences between phone and browser (gestures work differently on each)
