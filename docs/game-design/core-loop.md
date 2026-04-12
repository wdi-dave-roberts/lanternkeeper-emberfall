# Core Loop

The daily ritual in Lanternkeeper: Emberfall takes 2-3 minutes. It is a ritual, not a task.

---

## The Six Steps

### 1. Home screen shows Aetherling and Emberfall scene

The user opens the app and sees Emberfall: a winding path through a warm, foggy landscape with Aetherling (the red panda) walking along it. Fog wisps and leaves drift across the scene.

**Under the hood:** `app/(tabs)/index.tsx` is the home screen. It loads world state via `loadWorldState()` from `lib/storage.ts`, which determines which regions are visible and how many visits have accumulated. The home screen also checks whether the user has already checked in today via `hasCheckedInToday()`.

---

### 2. User clears fog and brushes leaves (gesture interaction)

Before or after checking in, the user can swipe across the screen to clear fog wisps and brush away falling leaves. This is purely tactile — a moment of calm interaction with the world.

**Under the hood:** Gesture detection uses `react-native-gesture-handler`. Each fog wisp and leaf is an animated element managed by `react-native-reanimated`. Touching them triggers opacity and position animations that make them fade or drift away. No data is saved from this step — it's visual and sensory only.

---

### 3. User selects emotion: Stuck / Frustrated / Inspired / Alright

The user taps "Check In" and is shown four emotion options. They pick the one that fits how they feel right now. No emotion is better or worse than another. The choice is recorded.

**Under the hood:** Tapping "Check In" navigates to `src/screens/CheckInScreen.tsx`. The selected emotion is a `type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright'` value defined in `src/data/types.ts`. The emotion is passed forward to the next screen and also saved to world state to track the emotion histogram over time.

---

### 4. App suggests one micro-quest

Based on the selected emotion, the app offers one small, kind task. The quest is drawn randomly from a pool of 10 quests for that emotion.

**Under the hood:** `getRandomQuest(emotion)` in `src/data/quests.ts` selects a random `Quest` from the emotion's pool. The quest is displayed in `src/screens/QuestScreen.tsx`. The user can request a different quest if the suggested one doesn't fit — `getAnotherQuest()` handles this, excluding the current quest from the pool.

---

### 5. User taps Done

The user completes (or acknowledges) the quest and taps Done. The completion is recorded in the daily log.

**Under the hood:** `completeQuest()` in `lib/storage.ts` writes the quest ID to the daily log entry for today (`daily-log:YYYY-MM-DD` key in AsyncStorage — the phone's local storage). This prevents duplicate completions and contributes to world state statistics. Region unlock conditions are re-evaluated after each completion via `checkRegionUnlocks()`.

---

### 6. Aetherling shows a feedback line

After the user taps Done, Aetherling responds with a short, calm line matched to the emotion. The feedback line acknowledges what happened without over-celebrating it.

**Under the hood:** `getRandomFeedback(emotion)` in `src/data/feedback.ts` selects a random line from the emotion's pool of 5 feedback lines. The line is displayed on the quest completion screen before returning the user to Home.

---

## The Loop as a Whole

The loop is designed to take 2-3 minutes. It is a ritual, not a task.

Each step connects to the next: the fog clearing creates presence, the emotion check-in creates honesty, the micro-quest creates one small action, and the feedback line closes the loop with acknowledgment. Nothing in the loop demands improvement, measurement, or return.
