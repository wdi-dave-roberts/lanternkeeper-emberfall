# Phase 3: Storage & Data Integrity - Research

**Researched:** 2026-04-12
**Domain:** AsyncStorage consolidation, TypeScript type deduplication, Jest test infrastructure (Expo React Native)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Rich schema wins. The canonical DailyLog is: `{ date, emotion, quest, completed, completedAt }` — full emotional context preserved per ritual entry
- **D-02:** DailyLog is defined once in `src/data/types.ts` (the existing richer version). The simpler `{ date, completedQuests[] }` interface in `lib/storage.ts` is replaced
- **D-03:** All storage read/write functions updated to use the rich schema. The storage key pattern (`daily-log:YYYY-MM-DD`) can stay or change — Claude's discretion on storage key design
- **D-04:** Fresh start — no migration code. Old AsyncStorage keys from both storage layers are orphaned (harmless). This is a pre-release app with no real user data at risk
- **D-05:** No explicit clear/reset of old keys. They sit inert in AsyncStorage until the user clears app data. Simplest approach
- **D-06:** `lib/storage.ts` is the surviving storage file. `src/storage/storage.ts` is deleted entirely
- **D-07:** `App.tsx` imports from `src/storage/storage.ts` — if App.tsx is dead code (Expo Router uses `app/` directory), delete it too. If it's still active, update imports to `lib/storage.ts`
- **D-08:** All types that were defined in `src/storage/storage.ts` (AppState, IdeaSeed) — evaluate if they're used anywhere. If dead, delete. If alive, move to `src/data/types.ts`
- **D-09:** Delete `calculateStreak()` from `lib/storage.ts`. Confirmed as design pillar violation in Phase 2 audit. No replacement — streaks are an anti-feature
- **D-10:** Emotion type defined once in `src/data/types.ts`. The duplicate `type Emotion = ...` in `app/(tabs)/index.tsx` (line 28) is replaced with an import from `src/data/types.ts`
- **D-11:** Full test foundation installed: Jest + `@react-native-async-storage/async-storage` mock + `@testing-library/react-native` + `react-test-renderer`. Config written for all
- **D-12:** Only storage layer tests written in this phase (STOR-04: round-trip daily log persistence). Phase 4+ uses the foundation for hook and component tests
- **D-13:** Test file location follows Jest convention: `__tests__/` directory or co-located `.test.ts` files — Claude's discretion on which pattern fits better

### Claude's Discretion

- Storage key design (keep `daily-log:YYYY-MM-DD` pattern or restructure)
- Internal structure of the consolidated `lib/storage.ts` (function grouping, documentation)
- Test file organization pattern (`__tests__/` vs co-located)
- Whether App.tsx is dead code (determine from Expo Router setup and delete if so)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STOR-01 | Consolidate dual storage layers (lib/storage.ts vs src/storage/storage.ts) into single source of truth | D-06/D-07/D-08 locked; App.tsx confirmed dead code (Expo Router entry, not App.tsx); only App.tsx imports old layer |
| STOR-02 | Fix schema mismatch between storage layers that risks silent data loss | D-01/D-02/D-03 locked; rich DailyLog from src/data/types.ts is canonical; lib/storage.ts DailyLog interface + 3 functions need rewrite |
| STOR-03 | Remove `calculateStreak()` function from storage | D-09 locked; function is lines 187-206 of lib/storage.ts; no callers found in active codebase |
| STOR-04 | Write round-trip unit test verifying daily log persistence | D-11/D-12/D-13 locked; zero test infrastructure exists; jest-expo 55.0.15 is the standard preset for Expo 54 |
| STOR-05 | Fix Emotion type duplication across files | D-10 locked; duplicate is line 28 of app/(tabs)/index.tsx; canonical source is src/data/types.ts |
</phase_requirements>

---

## Summary

Phase 3 is a surgical cleanup of the data layer with no gameplay behavior changes. Three distinct work streams: (1) consolidate two storage files into one, (2) fix the DailyLog schema mismatch, (3) install Jest test infrastructure and write the first round-trip test.

The codebase audit confirms the scope is narrow. `src/storage/storage.ts` has exactly one runtime importer: `App.tsx`. Since the project uses Expo Router with `"main": "expo-router/entry"` in package.json, `App.tsx` is dead code and can be deleted along with its storage layer. All active screens (`app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/first-lantern.tsx`, `app/index.tsx`) already import from `@/lib/storage`. The `Emotion` type duplication is a single line in one file.

The highest-risk item is the test infrastructure setup. This project has zero test config, no `jest.config.*`, no `babel.config.*`, no `jest` in devDependencies. Jest transitive deps exist (Jest 29) because Metro/Expo pulls them in, but the test runner is not wired up. The correct approach for this stack is `jest-expo` as the preset — it ships with `babel-jest`, `react-test-renderer`, and handles the React Native transform automatically.

**Primary recommendation:** Delete `App.tsx` + `src/storage/storage.ts` together, rewrite the DailyLog interface and its three dependent functions in `lib/storage.ts`, replace the inline Emotion type in `app/(tabs)/index.tsx` with an import, add `jest-expo` + `@testing-library/react-native` to devDependencies with the standard preset config, and write one round-trip test for the updated DailyLog functions.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jest-expo | 55.0.15 | Test preset for Expo projects | Official Expo preset; handles RN transform, path aliases, and React 19 compat automatically [VERIFIED: npm registry] |
| @testing-library/react-native | 13.3.3 | Component + hook testing utilities | Standard RNTL; works with jest-expo preset [VERIFIED: npm registry] |
| react-test-renderer | 19.2.5 | Required peer for RNTL and jest-expo | Must match React version (project uses 19.1.0, 19.2.5 is compatible) [VERIFIED: npm registry] |

### Supporting
| Library | Purpose | When to Use |
|---------|---------|-------------|
| @react-native-async-storage/async-storage (jest mock) | In-memory AsyncStorage for tests | Built into the package at `@react-native-async-storage/async-storage/jest/async-storage-mock` — no separate install needed [VERIFIED: codebase inspection] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jest-expo preset | raw jest + ts-jest | jest-expo handles babel transform, path alias resolution (@/*), and React Native environment setup — ts-jest requires manual configuration of all of this for RN |

**Installation:**
```bash
npm install --save-dev jest-expo @testing-library/react-native react-test-renderer
```

**Version verification:** [VERIFIED: npm registry 2026-04-12]
- jest-expo: 55.0.15 (latest)
- @testing-library/react-native: 13.3.3 (latest)
- react-test-renderer: 19.2.5 (latest)

---

## Architecture Patterns

### Recommended Project Structure (post-phase)

```
lib/
  storage.ts           # Single storage source of truth (consolidated)
  storage.test.ts      # Round-trip test for daily log (new)
src/
  data/
    types.ts           # Canonical types: Emotion, DailyLog, Quest, IdeaSeed, AppState
    quests.ts
    feedback.ts
  config/
    game.ts            # GAME_CONFIG (Phase 2 output)
app/
  (tabs)/
    index.tsx          # Imports Emotion from @/src/data/types (not local)
    explore.tsx
  index.tsx
  first-lantern.tsx
  _layout.tsx
# DELETED:
# App.tsx
# src/storage/storage.ts
```

### Pattern 1: DailyLog Schema (canonical)

The rich schema from `src/data/types.ts` becomes the only DailyLog definition. The three functions in `lib/storage.ts` that use the old thin schema need to be rewritten:

**Old (lib/storage.ts lines 139-184):**
```typescript
export interface DailyLog {
  date: string;
  completedQuests: string[];
}
// saveDailyLog, loadDailyLog, loadTodayLog, completeQuest — all use thin schema
```

**New (lib/storage.ts after phase):**
```typescript
// Import from canonical source — no local definition
import type { Emotion, Quest, DailyLog } from '@/src/data/types';

// saveDailyLog: unchanged signature, works with rich schema
export async function saveDailyLog(log: DailyLog): Promise<void> {
  const key = getStorageKey(log.date);
  await AsyncStorage.setItem(key, JSON.stringify(log));
}

// loadDailyLog: return type changes to rich DailyLog
export async function loadDailyLog(date: string): Promise<DailyLog | null> {
  const key = getStorageKey(date);
  const data = await AsyncStorage.getItem(key);
  if (!data) return null;
  return JSON.parse(data) as DailyLog;
}

// loadTodayLog: returns null instead of thin shell when no log exists
// (no "empty" rich log makes sense — you haven't checked in yet)
export async function loadTodayLog(): Promise<DailyLog | null> {
  return loadDailyLog(getTodayKey());
}

// completeQuest: signature changes to require full ritual context
export async function saveDailyRitual(
  emotion: Emotion,
  quest: Quest
): Promise<DailyLog> {
  const log: DailyLog = {
    date: getTodayKey(),
    emotion,
    quest,
    completed: true,
    completedAt: new Date().toISOString(),
  };
  await saveDailyLog(log);
  return log;
}
```

**Key implication for STOR-02:** `completeQuest(questId: string)` doesn't fit the rich schema — the rich schema stores the full Quest object and Emotion, not just a quest ID. The function signature must change. The caller in `app/(tabs)/index.tsx` (which already has `selectedEmotion` and `currentQuest` in scope) must pass both. This is the primary integration touchpoint to update.

### Pattern 2: Jest Config for Expo + Path Aliases

jest-expo 55 handles the transform but does NOT automatically configure `moduleNameMapper` for `@/*` path aliases. That mapping must be added manually.

**jest.config.js** (recommended over package.json jest key for clarity):
```javascript
// Source: jest-expo documentation + path alias convention
const { defaults } = require('jest-config');

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: [
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
};
```

**package.json scripts to add:**
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Pattern 3: Round-Trip Storage Test

The round-trip test for STOR-04 must use the built-in AsyncStorage mock (it uses jest.fn() backed by an in-memory object). The mock resets between tests if `beforeEach` clears it — but the built-in mock does NOT auto-clear between tests. Use `beforeEach` to reset.

**lib/storage.test.ts:**
```typescript
// Source: pattern from TESTING.md + AsyncStorage mock docs
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveDailyLog, loadDailyLog, getTodayKey } from './storage';
import type { DailyLog } from '@/src/data/types';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('DailyLog persistence (round-trip)', () => {
  beforeEach(() => {
    // Clear the in-memory mock store between tests
    mockAsyncStorage.getItem.mockClear();
    mockAsyncStorage.setItem.mockClear();
    // Reset the internal mock storage
    (AsyncStorage as any).__INTERNAL_MOCK_STORAGE__ = {};
  });

  it('saves and retrieves a daily log entry unchanged', async () => {
    const log: DailyLog = {
      date: '2026-04-12',
      emotion: 'inspired',
      quest: { id: 'q-01', emotion: 'inspired', text: 'Write one sentence.' },
      completed: true,
      completedAt: '2026-04-12T14:00:00.000Z',
    };

    await saveDailyLog(log);
    const retrieved = await loadDailyLog('2026-04-12');

    expect(retrieved).toEqual(log);
  });

  it('returns null when no log exists for a date', async () => {
    const result = await loadDailyLog('2026-01-01');
    expect(result).toBeNull();
  });
});
```

### Pattern 4: Emotion Type Import (STOR-05)

Single-line fix in `app/(tabs)/index.tsx`. The local type alias on line 28 is replaced with an import.

**Before:**
```typescript
type Emotion = "stuck" | "frustrated" | "inspired" | "alright";
```

**After:**
```typescript
import type { Emotion } from "@/src/data/types";
```

No other changes needed in that file — the type is structurally identical, TypeScript will accept it.

### Anti-Patterns to Avoid

- **Keeping `completeQuest()` with thin signature:** Don't preserve the old `completeQuest(questId: string)` as a wrapper — it would require re-fetching quest data that the caller already has. Pass full context from the call site.
- **Defining DailyLog in lib/storage.ts:** After this phase, zero interface definitions should live in `lib/storage.ts`. It imports types; it doesn't define them.
- **Using `moduleFileExtensions` without `.tsx`:** Jest config for this project needs both `.ts` and `.tsx` in `testMatch` or it won't find component tests added in Phase 4.
- **Forgetting `transformIgnorePatterns`:** Without the correct `transformIgnorePatterns` override, jest-expo will fail to transform Expo and React Native packages in `node_modules`. The pattern in Pattern 2 above is the standard Expo exclusion list.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AsyncStorage test mock | Custom jest.fn() mock object | `@react-native-async-storage/async-storage/jest/async-storage-mock` | Ships with the package; backed by in-memory store; handles `multiGet`/`multiSet`/`clear` |
| Path alias resolution in Jest | Manual regex in moduleNameMapper | `moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' }` | One line; mirrors tsconfig.json `@/*` mapping exactly |
| RN transform config | Custom babel-jest config | `preset: 'jest-expo'` | jest-expo ships `babel-preset-expo` and handles all transforms for Expo 54 |

**Key insight:** The jest-expo preset does ~80% of the test setup work for Expo projects. Don't bypass it with a raw jest config — you'll spend hours debugging transform and module resolution issues that the preset solves by default.

---

## Common Pitfalls

### Pitfall 1: completeQuest callers break silently

**What goes wrong:** `completeQuest(questId)` in `lib/storage.ts` is currently called from `app/(tabs)/index.tsx`. Changing the DailyLog schema and function signature without updating the caller compiles with errors — but it's easy to miss that the call site needs structural changes, not just a re-import.

**Why it happens:** The old `completeQuest` took a single string. The new `saveDailyRitual` takes emotion + quest object. The caller (`app/(tabs)/index.tsx` around the `handleCompleteQuest` function) already has `selectedEmotion` and `currentQuest` in state — the fix is passing them both, but it's a behavioral change that must be intentional.

**How to avoid:** Search for all call sites of `completeQuest` before deleting it. Confirm the new function signature matches what callers have available.

**Warning signs:** TypeScript error "Expected 2 arguments, but got 1" after rename.

### Pitfall 2: loadTodayLog null contract change breaks callers

**What goes wrong:** The current `loadTodayLog()` returns a guaranteed non-null shell `{ date, completedQuests: [] }` on miss. Changing it to return `DailyLog | null` (because an empty rich log has no meaningful defaults for `emotion` and `quest`) will break any caller that assumes a non-null return.

**Why it happens:** The rich schema has required fields (`emotion`, `quest`) with no sensible zero-values — you can't construct a "default" rich DailyLog. The old thin schema could fake it with an empty array.

**How to avoid:** After changing `loadTodayLog` return type, grep for all callers and add null guards. Current callers in `app/(tabs)/index.tsx` use it for the `alreadyCheckedIn` check — that check can use `loadWorldState()` instead (which tracks `lastVisitDate`).

**Warning signs:** TypeScript error "Object is possibly null" at a call site that previously destructured the result.

### Pitfall 3: Path alias `@/*` not resolved in Jest

**What goes wrong:** Tests fail with "Cannot find module '@/src/data/types'" because Jest doesn't read `tsconfig.json` path mappings by default.

**Why it happens:** Jest has its own module resolution, independent of TypeScript's. The `paths` in tsconfig are a compile-time hint; Jest needs its own `moduleNameMapper`.

**How to avoid:** Add `moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' }` to jest.config.js. Verify with a test that imports from `@/src/data/types`.

**Warning signs:** `Cannot find module` errors that reference `@/` prefix paths in test output.

### Pitfall 4: AsyncStorage mock not reset between tests

**What goes wrong:** Test 2 reads data written by Test 1, causing false passes or false failures depending on test order.

**Why it happens:** The built-in `async-storage-mock` is a module singleton. Its `__INTERNAL_MOCK_STORAGE__` object persists across tests in the same file unless explicitly cleared.

**How to avoid:** Add `beforeEach(() => { (AsyncStorage as any).__INTERNAL_MOCK_STORAGE__ = {}; })` in test files that write to AsyncStorage.

**Warning signs:** Tests pass in isolation but fail when run together; test results change when `--runInBand` is added.

### Pitfall 5: App.tsx dead code determination

**What goes wrong:** Deleting `App.tsx` while assuming it's dead code — but it could still be referenced by native build tooling or some test harness.

**Why it happens:** `package.json` sets `"main": "expo-router/entry"`, which means Expo Router is the entry point and `App.tsx` is bypassed at runtime. However `App.tsx` may be kept as a legacy artifact.

**How to avoid:** Confirm `"main": "expo-router/entry"` in `package.json` (verified: it is set). `App.tsx` imports `src/screens/` components and `src/storage/storage.ts` — all are dead paths. Safe to delete both together.

**Warning signs:** If any native build config (`android/app/build.gradle`, `ios/`) references App.tsx directly, it needs updating. This project has no native directories (managed Expo workflow), so the risk is zero.

---

## Code Examples

Verified patterns from codebase inspection:

### Current lib/storage.ts structure (what changes)
```typescript
// Lines 139-206 in current lib/storage.ts — THESE CHANGE OR DELETE:
export interface DailyLog {          // DELETE — move to src/data/types.ts import
  date: string;
  completedQuests: string[];
}
export async function saveDailyLog(log: DailyLog)  // KEEP, update type
export async function loadDailyLog(date: string)   // KEEP, update return type
export async function loadTodayLog()               // KEEP, change return to null | DailyLog
export async function completeQuest(questId)       // RENAME/REWRITE to saveDailyRitual
export async function calculateStreak()            // DELETE entirely
```

### Current app/(tabs)/index.tsx — Emotion duplicate (line 28)
```typescript
// Source: codebase inspection [VERIFIED]
type Emotion = "stuck" | "frustrated" | "inspired" | "alright"; // DELETE THIS
// Replace with:
import type { Emotion } from "@/src/data/types";
```

### What App.tsx does (confirmed dead code)
```typescript
// App.tsx imports:
import { loadState, saveLog, saveSeed, getTodayDate, hasCheckedInToday } from './src/storage/storage';
import HomeScreen from './src/screens/HomeScreen';
// ...
// Expo Router entry point is "expo-router/entry" (package.json "main")
// App.tsx is never loaded at runtime — safe to delete
```

---

## Runtime State Inventory

> Included because this phase deletes files and changes AsyncStorage schema (storage key patterns).

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `@lanternkeeper_logs`, `@lanternkeeper_seeds`, `@lanternkeeper_lastCheckIn` keys from `src/storage/storage.ts`; `daily-log:*`, `world-state`, `first-lantern-seen`, `fog-cleared-state` keys from `lib/storage.ts` | D-04/D-05: no migration, orphaned keys sit inert — code edit only |
| Live service config | None — local-only app, no external services | None |
| OS-registered state | None — no background tasks, no push notification registration | None |
| Secrets/env vars | None | None |
| Build artifacts | No compiled binaries, no egg-info, no global installs. `node_modules` is unaffected by deleting source files | None |

**Key point:** The old `@lanternkeeper_*` keys from `src/storage/storage.ts` will sit inert in AsyncStorage on any device that ran the old code. They do not interfere with the new storage layer (different key names). This is the intended behavior per D-04/D-05.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, jest | Yes | v25.9.0 | — |
| npm | Package install | Yes | 11.12.1 | — |
| jest (transitive) | Test runner foundation | Yes (transitive via Metro) | 29.7.0 | — |
| jest-expo | Test preset | No (not installed) | — | None — must install |
| @testing-library/react-native | Component testing | No (not installed) | — | None — must install |
| react-test-renderer | RNTL peer dep | No (not installed) | — | None — must install |

**Missing dependencies with no fallback:**
- `jest-expo`, `@testing-library/react-native`, `react-test-renderer` — all required for STOR-04. Plan must include install step before test authoring.

**Missing dependencies with fallback:**
- None

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest-expo 55.0.15 (to be installed) |
| Config file | `jest.config.js` (new — Wave 0 gap) |
| Quick run command | `npm test -- --testPathPattern=storage` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STOR-01 | src/storage/storage.ts deleted, App.tsx deleted, all consumers import from lib/storage.ts | manual verification (file existence check) | `ls src/storage/storage.ts 2>/dev/null && echo FAIL || echo PASS` | N/A |
| STOR-02 | DailyLog round-trip preserves rich schema fields | unit | `npm test -- --testPathPattern=storage` | No — Wave 0 |
| STOR-03 | calculateStreak() absent from codebase | manual verification (grep check) | `grep -r "calculateStreak" lib/ app/ src/ && echo FAIL || echo PASS` | N/A |
| STOR-04 | Write → Read → equals original (round-trip) | unit | `npm test -- --testPathPattern=storage` | No — Wave 0 |
| STOR-05 | Emotion defined in exactly one place | manual verification (grep check) | `grep -rn "type Emotion" app/ src/ lib/` should show only src/data/types.ts | N/A |

### Sampling Rate

- **Per task commit:** `npm test -- --testPathPattern=storage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `jest.config.js` — Jest configuration with preset, path aliases, AsyncStorage mock setup
- [ ] `lib/storage.test.ts` — Round-trip tests for saveDailyLog/loadDailyLog (covers STOR-02, STOR-04)
- [ ] `package.json` test scripts — `"test": "jest"`, `"test:watch": "jest --watch"`
- [ ] Install: `npm install --save-dev jest-expo @testing-library/react-native react-test-renderer`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `App.tsx` is dead code because `package.json` sets `"main": "expo-router/entry"` | Architecture Patterns | If App.tsx is somehow still loaded (native Expo prebuild artifact), deleting it would break the app. Mitigation: verify `"main"` field in package.json before deletion — confirmed `"expo-router/entry"` [VERIFIED: codebase] — risk is LOW |
| A2 | `react-test-renderer@19.2.5` is compatible with `react@19.1.0` | Standard Stack | Minor version mismatch (19.2 vs 19.1) — React generally maintains minor-version compat. Risk: peer dep warning or subtle test behavior difference. Mitigation: install and observe npm peer dep warnings |

**If this table is empty:** All claims in this research were verified or cited. The two items above are LOW risk and confirmed via codebase inspection.

---

## Open Questions

1. **saveDailyRitual vs. updated completeQuest name**
   - What we know: The old `completeQuest(questId)` doesn't fit the rich schema. A new function is needed.
   - What's unclear: Whether to rename it `saveDailyRitual`, `recordRitual`, or something else. CONTEXT.md leaves this to Claude's discretion.
   - Recommendation: `saveDailyRitual(emotion, quest)` — matches the domain language (ritual, not quest completion mechanic). Keep `completeQuest` as a deprecated no-op or delete it; update the single caller in `app/(tabs)/index.tsx`.

2. **loadTodayLog null contract**
   - What we know: Changing return type to `DailyLog | null` breaks the existing "has checked in today" check logic.
   - What's unclear: Whether `app/(tabs)/index.tsx` uses `loadTodayLog` for the check-in gate or uses `loadWorldState` instead.
   - Recommendation: The `app/(tabs)/index.tsx` has `loadWorldState` available (it already calls it on mount). The "already checked in" check can use `worldState.lastVisitDate === getTodayKey()` instead of `loadTodayLog`. Remove `loadTodayLog` from the consumer and replace with the WorldState check. This eliminates the null contract issue entirely.

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection — `lib/storage.ts`, `src/storage/storage.ts`, `src/data/types.ts`, `app/(tabs)/index.tsx`, `App.tsx`, `package.json` [VERIFIED: file reads this session]
- npm registry — jest-expo@55.0.15, @testing-library/react-native@13.3.3, react-test-renderer@19.2.5 [VERIFIED: npm view this session]
- `.planning/codebase/TESTING.md` — test gap analysis [VERIFIED: file read this session]
- `@react-native-async-storage/async-storage` built-in mock at `jest/async-storage-mock.js` [VERIFIED: file inspection this session]

### Secondary (MEDIUM confidence)
- jest-expo 55 peer dependencies and bundled dependencies confirmed via `npm view jest-expo@55.0.15 dependencies` — confirms Jest 29.x base, React 19 compat, babel-jest [VERIFIED: npm registry this session]

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against npm registry this session
- Architecture: HIGH — based on direct codebase inspection of all affected files
- Pitfalls: HIGH — derived from actual code analysis, not pattern matching
- Test setup: MEDIUM — jest-expo preset documented, but not yet run in this project; one install-time surprise possible (react-test-renderer minor version peer warning)

**Research date:** 2026-04-12
**Valid until:** 2026-07-12 (stable stack — jest-expo, AsyncStorage, RNTL are slow-moving)
