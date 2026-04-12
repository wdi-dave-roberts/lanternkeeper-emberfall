# Architecture

Lanternkeeper: Emberfall is a mobile app with no backend. Everything happens on the user's device. There is no server, no login, no cloud sync — just the app and the phone's local storage.

This page explains how the code is organized and how data moves through the app.

---

## How the App Is Organized

The code is split into three layers:

```
app/                        ← Routing (which screen shows when)
  _layout.tsx               ← Root layout, sets up theme and gestures
  index.tsx                 ← Entry point: onboarding check → redirect
  first-lantern.tsx         ← First-time onboarding scene
  (tabs)/
    _layout.tsx             ← Tab navigation setup
    index.tsx               ← Home screen (the main ritual screen)

src/screens/                ← Screens (what the user sees and interacts with)
  CheckInScreen.tsx         ← Emotion selection
  QuestScreen.tsx           ← Micro-quest display and completion

components/                 ← Reusable UI pieces

lib/                        ← Data and storage (how data is saved and loaded)
  storage.ts                ← All AsyncStorage reads and writes

src/data/                   ← Game content
  types.ts                  ← TypeScript type definitions
  quests.ts                 ← The 40 micro-quests
  feedback.ts               ← Aetherling's feedback lines
```

---

## How Data Flows

The app has no global state manager (no Redux, no Context API). Each screen loads what it needs when it opens.

Here is the daily check-in flow from tap to feedback:

1. User taps "Check In" on Home screen (`app/(tabs)/index.tsx`)
2. Home screen calls `recordDailyVisit()` → saves a visit to local storage
3. Navigation moves to `CheckInScreen.tsx`
4. User picks an emotion (Stuck / Frustrated / Inspired / Alright)
5. `getRandomQuest(emotion)` selects a quest from `src/data/quests.ts`
6. Navigation moves to `QuestScreen.tsx` showing the quest
7. User taps Done → `completeQuest()` saves the quest ID to today's log
8. `getRandomFeedback(emotion)` selects a feedback line from `src/data/feedback.ts`
9. Aetherling's line displays, then user returns to Home

**Local storage** means AsyncStorage — the phone's built-in key-value storage. Think of it like a small database that lives entirely on the device. The app reads from it and writes to it, but nothing ever leaves the phone.

---

## Key Files to Know

| File | What it does |
|------|-------------|
| `app/(tabs)/index.tsx` | Home screen — the main ritual screen. Renders Aetherling, the Emberfall scene, fog/leaf interactions, and the Check In button. |
| `lib/storage.ts` | Where all data is saved and loaded. If you want to understand how state is persisted, start here. |
| `src/data/quests.ts` | The 40 micro-quests, grouped by emotion. This is the source of truth for quest content. |
| `src/data/feedback.ts` | Aetherling's feedback lines after quest completion. Source of truth for feedback content. |
| `src/data/types.ts` | TypeScript type definitions: `Emotion`, `Quest`, `DailyLog`, `WorldState`, and more. |

---

## World State

The app tracks two things over time:

1. **Visit count** — how many times the user has opened the app and checked in
2. **Emotion histogram** — how many times each emotion has been selected (Stuck × N, Inspired × N, etc.)

This data lives in AsyncStorage under the `world-state` key and is loaded each time the home screen opens. The `checkRegionUnlocks()` function in `lib/storage.ts` reads these counts and decides which regions of Emberfall are visible.

**Region unlock rules** (defined in `lib/storage.ts`):

| Region | Unlocks when |
|--------|-------------|
| Lantern Clearing | Always unlocked (home) |
| Workshop Glade | 3 Inspired check-ins |
| Fog Valley | 3 Stuck check-ins |
| Warm River | 3 Frustrated check-ins |
| Observatory Balcony | 7 days visited |
| The Long Path | 14 days visited |

World state never resets. A region unlocked stays unlocked.

---

## No Backend, No Auth

There are no user accounts, no login screens, no API calls. The app is self-contained. This is intentional — it keeps the app simple, private, and fast. There is nothing to maintain on a server and nothing that can break due to a network issue.
