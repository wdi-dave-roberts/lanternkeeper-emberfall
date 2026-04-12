# Lanternkeeper: Emberfall — Claude Guide

> This file is the single source of truth for how to work on this project.
> Read this before making any changes.

---

## Project Summary

Lanternkeeper: Emberfall is a calm, cozy mobile game built with Expo + React Native.

Purpose:
- Make the user feel **understood, inspired, and less pressured**
- A quiet companion for a solo indie developer building a game called Atlas

Core fantasy:
- A red panda named Aetherling builds a world (Emberfall) alongside the player
- The player helps by clearing fog and leaves, choosing an emotion, and completing one tiny quest

This is not a habit tracker.
This is not a productivity app.
This is a ritual.

---

## Tech Stack

- Expo + React Native
- TypeScript
- Expo Router (tabs starter)
- Local storage only (AsyncStorage)

---

## Design Pillars (Do Not Break These)

1. Understood
   - The app mirrors the user’s inner state without judgment

2. Inspired
   - The app protects creative momentum and meaning

3. Less Pressured
   - No streaks
   - No penalties
   - Time is neutral
   - Rest is normal

---

## Core Loop

1. Home screen shows Aetherling and Emberfall scene
2. User helps by clearing fog and brushing leaves
3. User selects emotion: Stuck / Frustrated / Inspired / Alright
4. App suggests one micro-quest
5. User taps Done
6. Aetherling shows a feedback line

---

## Aetherling Voice Rules

Tone:
- Calm
- Dry
- Warm-under-the-surface
- Respectful
- Non-performative

Language:
- Short sentences
- No exclamation points
- No slang
- No emojis
- No motivational clichés

Aetherling is:
- A quiet builder
- A steady companion
- A thoughtful observer

Aetherling is not:
- A cheerleader
- A therapist
- A productivity coach

---

## Micro-Quests

### STUCK
- Open your project for 2 minutes.
- Write one sentence about what feels blocked.
- Change rooms and sit somewhere different.
- Name one small thing you’ve already built.
- Sketch a single shape for Atlas.
- Describe the fog in Emberfall in one line.
- Make one tiny playful experiment.
- Stand up and look out a window for 30 seconds.
- Write the next true step, even if it feels too small.
- Tidy one tiny corner of your workspace.

### FRUSTRATED
- Put a hand on your chest. Breathe slowly for 3 breaths.
- Name one thing you can’t control — and let it be.
- Stretch your shoulders for 30 seconds.
- Write what you wish players would feel.
- Take a short walk with no goal.
- Say one kind thing to yourself (quietly).
- Move your body for one song.
- Lower your expectations for today by 10%.
- Write one honest sentence about why this matters.
- Step outside and notice one warm detail.

### INSPIRED
- Write one mechanic idea.
- Sketch one character.
- Name one emotion Atlas should hold.
- Build one imperfect thing.
- Protect your spark: remove one distraction.
- Write a tiny piece of lore.
- Open your engine and change one line.
- Send one honest appreciation.
- Capture today’s idea before it fades.
- Add one lantern to Emberfall.

### ALRIGHT
- Enjoy one simple comfort.
- Do one kind thing for future you.
- Back up your project.
- Tidy your digital workspace.
- Drink a glass of water.
- Thank yourself for showing up.
- Light a candle or lamp nearby.
- Review one thing you’re proud of.
- Rest for 5 minutes without guilt.
- Tell Aetherling what you’re building today.

---

## Feedback Lines

### STUCK
- Fog lost a little ground.
- That was enough to move.
- We didn’t rush.
- Small steps count.
- We’re still on the path.

### FRUSTRATED
- That made space.
- We carried it more lightly.
- The tension eased.
- That mattered.
- We kept it kind.

### INSPIRED
- That belongs in the world.
- We protected something important.
- One piece became real.
- That’s how ideas survive.
- We built today.

### ALRIGHT
- Quiet progress.
- That was enough.
- We’ll continue when it makes sense.
- Nothing to prove.
- This is steady.

---

## Implementation Rules

- Make one small change at a time
- Never refactor the whole project without permission
- Stop after each major step and ask for confirmation
- Keep visuals simple until the logic is solid

---

## File Structure

/src/components
/src/screens
/src/data
/src/logic
/src/storage

/app/(tabs)/index.tsx = Home screen

---

## Final Rule

If a change does not make the user feel:
- more understood
- more inspired
- less pressured

Then do not build it.

