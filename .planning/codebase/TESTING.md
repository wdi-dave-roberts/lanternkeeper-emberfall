# Testing Patterns

**Analysis Date:** 2026-04-11

## Test Framework

**Runner:**
- No test runner currently configured
- No Jest, Vitest, or other test framework dependencies in `package.json`

**Assertion Library:**
- Not present; no testing infrastructure detected

**Run Commands:**
- No test commands defined in `package.json`
- Only linting available: `npm run lint`

## Current Testing Status

**Reality:** This project has **zero automated test infrastructure**. No unit tests, integration tests, or test files exist in the codebase.

This is a critical gap. The project contains:
- Business logic in storage utilities (`lib/storage.ts`)
- Data transformations and calculations
- State management with AsyncStorage
- Complex animation and phase sequencing in `app/first-lantern.tsx`

None of these have test coverage.

## Test File Organization

**Not Applicable** — No testing framework exists.

**Recommended Pattern (if framework is added):**

**Location:** Co-located with source
```
src/
  data/
    quests.ts
    quests.test.ts          # Test alongside source
  storage/
    storage.ts
    storage.test.ts
  screens/
    HomeScreen.tsx
    HomeScreen.test.tsx
lib/
  storage.ts
  storage.test.ts
```

**Naming:** `<filename>.test.ts` or `<filename>.spec.ts`

## Opportunities for Testing

### Storage Layer (`lib/storage.ts`)

**High priority for testing:**

1. **WorldState calculations**
   - `recordDailyVisit()` — tracks emotion counts, updates visit dates
   - `checkRegionUnlocks()` — conditional logic for region unlocks based on emotion counts and days visited
   - Multiple unlock conditions should be unit tested

2. **Date handling**
   - `getTodayKey()` — ISO date formatting
   - Streak calculation in `calculateStreak()` — iterates backwards through dates, needs test fixtures

3. **Daily log operations**
   - `completeQuest()` — idempotent operation that should not duplicate quest IDs
   - `loadTodayLog()` — handles missing data gracefully

**Testable without external services:**
```typescript
// Example test structure
describe('recordDailyVisit', () => {
  it('increments emotion counts', async () => {
    const state = await recordDailyVisit('inspired');
    expect(state.emotionCounts.inspired).toBe(1);
  });

  it('unlocks workshop-glade after 3 inspired emotions', async () => {
    // Create state with 2 inspired emotions
    // Record one more
    // Assert workshop-glade is in unlockedRegions
  });

  it('only counts once per day', async () => {
    // Record multiple visits same day
    // Assert totalDaysVisited is still 1
  });
});
```

### Data Utilities (`src/data/quests.ts`, `src/data/feedback.ts`)

**Easy to test:**

1. **`getRandomQuest(emotion)`** — always returns a valid quest from emotion pool
2. **`getAnotherQuest(emotion, currentId)`** — excludes current ID, returns different quest
3. **`getRandomFeedback(emotion)`** — always returns a valid feedback line

```typescript
describe('getRandomQuest', () => {
  it('returns a quest from the correct emotion', () => {
    const quest = getRandomQuest('stuck');
    expect(quest.emotion).toBe('stuck');
    expect(QUESTS.stuck).toContainEqual(quest);
  });

  it('returns different quests on multiple calls', () => {
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      results.add(getRandomQuest('alright').id);
    }
    expect(results.size).toBeGreaterThan(1); // High probability
  });
});
```

### Component State (screens)

**Harder to test without React Native testing library:**

- `IdeaSeedScreen.tsx` — user input validation, list rendering
- `CheckInScreen.tsx` — emotion button selection flow
- `QuestScreen.tsx` — quest display, feedback state transitions

Requires React Native test environment setup (e.g., `@testing-library/react-native`).

### Phase Sequencing (`app/first-lantern.tsx`)

**Currently untestable** — Complex animation and state orchestration:

- Phase state transitions (fog → aetherling-appears → dialogue-1...)
- Timer-based auto-advancement
- User choice handling (light vs. judge)
- Animation integration with `Animated` API

Would require:
- React Native test setup
- Mock timers
- Animation value inspection

## Recommended Testing Setup

### Phase 1: Basic Unit Testing (Immediate)

Install testing framework and write tests for storage/data utilities:

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react-native react-native-test-runner
```

**Jest config** (add to `package.json`):
```json
{
  "jest": {
    "preset": "react-native",
    "testEnvironment": "node",
    "moduleFileExtensions": ["ts", "tsx", "js"],
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "testMatch": ["**/__tests__/**/*.test.ts", "**/*.test.ts"]
  }
}
```

**Test commands:**
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Phase 2: Storage Tests

Critical path: `lib/storage.ts` functions

```typescript
// lib/storage.test.ts
import { recordDailyVisit, checkRegionUnlocks, getTodayKey } from './storage';
import type { WorldState } from './storage';

describe('WorldState management', () => {
  beforeEach(() => {
    // Clear AsyncStorage mock
  });

  it('tracks emotion counts', async () => {
    const state = await recordDailyVisit('inspired');
    expect(state.emotionCounts.inspired).toBeGreaterThan(0);
  });

  it('unlocks regions based on emotion thresholds', () => {
    const testState: WorldState = {
      totalDaysVisited: 0,
      lastVisitDate: null,
      emotionCounts: {
        inspired: 3,
        stuck: 0,
        frustrated: 0,
        alright: 0,
      },
      unlockedRegions: ['lantern-clearing'],
    };

    const unlocks = checkRegionUnlocks(testState);
    expect(unlocks).toContain('workshop-glade');
  });
});
```

### Phase 3: Component Tests

Once React Native test library is configured, test screen components:

```typescript
// src/screens/CheckInScreen.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import CheckInScreen from './CheckInScreen';

describe('CheckInScreen', () => {
  it('renders all four emotion buttons', () => {
    const onSelectEmotion = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <CheckInScreen onSelectEmotion={onSelectEmotion} onBack={onBack} />
    );

    expect(getByText('Stuck')).toBeTruthy();
    expect(getByText('Frustrated')).toBeTruthy();
    expect(getByText('Inspired')).toBeTruthy();
    expect(getByText('Alright')).toBeTruthy();
  });

  it('calls onSelectEmotion with correct emotion', () => {
    const onSelectEmotion = jest.fn();
    const { getByText } = render(
      <CheckInScreen onSelectEmotion={onSelectEmotion} onBack={jest.fn()} />
    );

    fireEvent.press(getByText('Inspired'));
    expect(onSelectEmotion).toHaveBeenCalledWith('inspired');
  });
});
```

## Mocking Strategy

**What to Mock:**
- `AsyncStorage` — Replace with in-memory implementation for testing
- Timer-based operations — Use `jest.useFakeTimers()` for testing animation sequences
- Date/time — Mock `new Date()` for testing date-based logic
- File system operations — Not applicable; this project uses only AsyncStorage

**What NOT to Mock:**
- Data lookups (`QUESTS`, `FEEDBACK`) — Use actual data
- Utility functions like `getRandomQuest()` — Test the real implementation
- Type definitions — Never mock types
- Core state transitions — Test actual state management logic

**Mock example for AsyncStorage:**

```typescript
// __mocks__/@react-native-async-storage/async-storage.js
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
};

export default mockAsyncStorage;
```

## Current Testing Gap Analysis

**Not Tested:**
- Date calculations (streak logic could have off-by-one errors)
- Region unlock conditions (multiple thresholds interact)
- Quest deduplication in `getAnotherQuest()`
- Edge cases in `loadWorldState()` with corrupted data
- Emotion count mutations
- Screen state transitions

**Risk:** Changes to `lib/storage.ts` or `src/data/quests.ts` could introduce silent bugs.

**Example fragile area — `checkRegionUnlocks()`:**
```typescript
function checkRegionUnlocks(state: WorldState): string[] {
  const unlocks: string[] = [];

  if (state.emotionCounts.inspired >= 3 && !state.unlockedRegions.includes('workshop-glade')) {
    unlocks.push('workshop-glade');
  }
  // ... 4 more conditions

  return unlocks;
}
```

No tests verify:
- Correct threshold numbers
- That conditions don't trigger accidentally
- That duplicates aren't added to unlockedRegions
- Interaction with existing state

## Coverage Goals

**If testing framework were added:**

**Target coverage:**
- `lib/storage.ts`: 85%+ (critical storage logic)
- `src/data/quests.ts`, `src/data/feedback.ts`: 100% (simple, deterministic)
- Screen components: 60%+ (rendering, event handling)
- Overall: 70%+

**Current coverage:** 0%

---

*Testing analysis: 2026-04-11*
