---
phase: 03-storage-data-integrity
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - app/(tabs)/index.tsx
  - jest.config.js
  - lib/storage.test.ts
  - lib/storage.ts
  - package.json
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the storage layer (`lib/storage.ts`), its test suite (`lib/storage.test.ts`), the main screen (`app/(tabs)/index.tsx`), Jest configuration, and `package.json`.

The storage layer is well-structured. `saveDailyRitual`, `saveDailyLog`, `loadDailyLog`, `loadFogState`, and `saveFogState` all follow clean patterns with appropriate error handling. The test suite covers the happy-path round-trips correctly.

Four warnings were found: two logic bugs in `index.tsx` that can produce incorrect UI state, one unsafe non-null assertion in the "Done" handler, and one missing `quest` dependency in `useCallback`. Three informational items cover duplicate game content, a stale `quest` ref in a callback, and a missing test case for the `null`-on-missing-date path with a corrupted payload.

No security issues were found. No critical issues were found.

---

## Warnings

### WR-01: `alreadyCheckedIn` set before quest is shown — emotion picker hidden immediately

**File:** `app/(tabs)/index.tsx:664`
**Issue:** Inside `onSelectEmotion`, `setAlreadyCheckedIn(true)` is called unconditionally at line 664 — before the user completes the quest. The render condition for the emotion picker is `!emotion && !alreadyCheckedIn` (line 876), and the quest section renders when `emotion && !questDone` (line 906). On the same render cycle where `emotion` is set, `alreadyCheckedIn` is also flipped to `true`. This is fine for hiding the picker, but the "already checked in" banner at line 894 renders when `readyForCheckIn && !emotion && alreadyCheckedIn && !questDone`. After the quest is shown and the user taps "Walk again" (which calls `resetMorning`), `resetMorning` resets `alreadyCheckedIn` to `false` — but `recordDailyVisit` has already persisted `lastVisitDate`. So on the next refresh within the same day, `loadState` will set `alreadyCheckedIn` back to `true`, which is correct. However, if the user taps "Walk again" then immediately re-selects an emotion (a design edge case), `setAlreadyCheckedIn(true)` fires again, calling `recordDailyVisit` a second time for the same day. Because `recordDailyVisit` guards `totalDaysVisited` with `lastVisitDate !== today`, the visit count is safe — but `emotionCounts` is incremented again on every re-select within a day.

**Fix:**
Guard the `recordDailyVisit` call with the `alreadyCheckedIn` flag before calling it:
```typescript
const onSelectEmotion = useCallback(
  async (e: Emotion) => {
    setEmotion(e);
    setQuest(pickQuest(e));
    setQuestDone(false);
    setShowDialogue(false);

    // Only record the visit if we haven't already this session
    if (!alreadyCheckedIn) {
      const previousRegions = worldState?.unlockedRegions ?? ['lantern-clearing'];
      const updatedState = await recordDailyVisit(e);
      setWorldState(updatedState);
      setAlreadyCheckedIn(true);

      const newlyUnlocked = updatedState.unlockedRegions.filter(
        (r) => !previousRegions.includes(r)
      );
      if (newlyUnlocked.length > 0) {
        setNewUnlocks(newlyUnlocked);
      }
    }
  },
  [worldState, alreadyCheckedIn]
);
```

---

### WR-02: `onDone` uses a non-null assertion on `emotion` without a guard

**File:** `app/(tabs)/index.tsx:678`
**Issue:** `onDone` asserts `emotion!` at lines 678 and 696. The "Done" button is only rendered when `emotion && !questDone` (line 906), so `emotion` should never be null here in normal flow. However, `onDone` is defined with `useCallback` and captures a snapshot of `emotion` from the enclosing scope. If a race condition occurs (e.g., rapid state resets, hot reload during development), `emotion` could be `null` when the callback fires, causing a type error passed into `saveDailyRitual(null!, ...)` which would produce a malformed `DailyLog` with `emotion: null` persisted to storage.

**Fix:**
Add an early return guard:
```typescript
const onDone = useCallback(async () => {
  if (!emotion) return; // guard against stale callback
  setQuestDone(true);
  const fb = pickFeedback(emotion);
  // ...
  await saveDailyRitual(emotion, {
    id: `${getTodayKey()}-${emotion}`,
    emotion,
    text: quest,
  });
}, [emotion, newUnlocks, quest]);
```

---

### WR-03: `quest` is missing from `onDone`'s `useCallback` dependency array

**File:** `app/(tabs)/index.tsx:701`
**Issue:** `onDone` references `quest` (line 698) but `quest` is not listed in the `useCallback` dependency array `[emotion, newUnlocks]` at line 701. This means `onDone` closes over the initial (empty string) value of `quest` and will persist the stale empty string to `saveDailyRitual` on re-renders where `emotion` or `newUnlocks` hasn't changed. This is a lint violation (exhaustive-deps) and a real data-integrity bug: the `DailyLog` stored in AsyncStorage will have `text: ""` instead of the quest text the user saw.

**Fix:**
Add `quest` to the dependency array:
```typescript
}, [emotion, newUnlocks, quest]);
```

---

### WR-04: `loadWorldState` does not validate the shape of stored JSON

**File:** `lib/storage.ts:48`
**Issue:** `loadWorldState` casts the parsed JSON directly: `return JSON.parse(data) as WorldState`. If the schema has changed (e.g., `emotionCounts` gained a new key, or `unlockedRegions` was not present in an old stored version), the returned object will be structurally incomplete. Downstream code accesses `state.emotionCounts.frustrated` and `state.unlockedRegions` without checking for undefined. Accessing `state.unlockedRegions.includes(...)` on an undefined array would throw at runtime.

This is especially relevant because `DEFAULT_WORLD_STATE` sets `unlockedRegions: [GAME_CONFIG.regionUnlocks.defaultRegion]`, but a device that stored state before `unlockedRegions` was introduced would load `undefined` here.

**Fix:**
Merge stored data with the default to fill any missing fields:
```typescript
export async function loadWorldState(): Promise<WorldState> {
  const data = await AsyncStorage.getItem(WORLD_STATE_KEY);
  if (!data) return { ...DEFAULT_WORLD_STATE };
  const stored = JSON.parse(data) as Partial<WorldState>;
  return {
    ...DEFAULT_WORLD_STATE,
    ...stored,
    emotionCounts: {
      ...DEFAULT_WORLD_STATE.emotionCounts,
      ...(stored.emotionCounts ?? {}),
    },
    unlockedRegions: stored.unlockedRegions ?? DEFAULT_WORLD_STATE.unlockedRegions,
  };
}
```

---

## Info

### IN-01: Inline `QUESTS` and `FEEDBACK` tables in `index.tsx` duplicate content from `src/data/`

**File:** `app/(tabs)/index.tsx:74-126`
**Issue:** `FEEDBACK` (lines 74-103) and `QUESTS` (lines 105-126) are defined inline in the screen component. The project has dedicated data files at `src/data/quests.ts` and `src/data/feedback.ts` that are the stated source of truth (per `CLAUDE.md`). This creates a divergence risk: the 40-quest catalog in `src/data/quests.ts` and the 3-per-emotion inline table here will drift independently.

**Fix:** Import from the data layer instead of maintaining inline tables. The inline tables can be removed once the data file exports are confirmed compatible with the plain-string format used here.

---

### IN-02: `saveDailyRitual` in `onDone` generates a non-canonical quest ID

**File:** `app/(tabs)/index.tsx:697`
**Issue:** The quest ID is synthesized as `` `${getTodayKey()}-${emotion}` `` (e.g., `2026-04-12-inspired`). The canonical quest IDs in `src/data/quests.ts` follow the pattern `q-inspired-01`. Storing a log with a synthesized ID means the stored `DailyLog.quest.id` cannot be looked up in the quest catalog. This isn't a crash, but it breaks any future feature that might want to cross-reference a stored log entry with its source quest.

**Fix:** Pass the canonical quest object from `src/data/quests.ts` instead of constructing one inline from the plain quest string. This also ties into IN-01 above.

---

### IN-03: `storage.test.ts` does not cover `loadDailyLog` with malformed JSON in storage

**File:** `lib/storage.test.ts`
**Issue:** The test suite covers the round-trip (save → load), the missing-date null return, and multi-date independence. It does not cover the case where AsyncStorage contains a value for a key but that value is not valid JSON. `loadDailyLog` calls `JSON.parse(data)` without a try-catch (unlike `loadFogState` which has one). A corrupted AsyncStorage entry would throw an unhandled exception rather than returning null.

**Fix (in storage.ts):**
```typescript
export async function loadDailyLog(date: string): Promise<DailyLog | null> {
  const key = getStorageKey(date);
  const data = await AsyncStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as DailyLog;
  } catch {
    return null;
  }
}
```

Add a test case in `storage.test.ts`:
```typescript
it('returns null when stored data is corrupted JSON', async () => {
  await AsyncStorage.setItem('daily-log:2026-04-12', 'not-valid-json');
  const result = await loadDailyLog('2026-04-12');
  expect(result).toBeNull();
});
```

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
