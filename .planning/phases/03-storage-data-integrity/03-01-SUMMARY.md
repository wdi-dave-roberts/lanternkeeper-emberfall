---
phase: 03-storage-data-integrity
plan: 01
subsystem: storage / test-infrastructure
tags: [jest, testing, dead-code-removal, tdd, storage]
requirements: [STOR-01, STOR-03, STOR-04]

dependency_graph:
  requires: []
  provides:
    - jest-test-infrastructure
    - round-trip-dailylog-tests-red
  affects:
    - lib/storage.ts
    - lib/storage.test.ts
    - package.json
    - jest.config.js

tech_stack:
  added:
    - jest@29 (test runner, matched to jest-expo@54 peer dependency)
    - jest-expo@54 (Expo-matched preset with RN environment)
    - "@testing-library/react-native@13 (component test support)"
    - react-test-renderer@19 (React test utilities)
  patterns:
    - co-located test files (lib/storage.test.ts next to lib/storage.ts)
    - moduleNameMapper for AsyncStorage mock (avoids native module resolution)
    - TDD red phase — tests written before implementation

key_files:
  created:
    - jest.config.js
    - lib/storage.test.ts
  modified:
    - package.json (added test scripts, devDependencies)
    - lib/storage.ts (removed calculateStreak, removed local DailyLog interface)
  deleted:
    - App.tsx
    - src/storage/storage.ts
    - src/storage/ (directory)

decisions:
  - jest@29 required (not v30) — jest-expo@54 depends on @jest/* v29 packages; v30 caused expo winter runtime scope error
  - moduleNameMapper preferred over setupFiles for AsyncStorage mock — more reliable resolution than setupFiles in this RN/jest-expo combination
  - DailyLog round-trip tests pass with existing thin schema (saveDailyLog/loadDailyLog are schema-agnostic JSON); only saveDailyRitual fails (function missing) — correct red state
  - src/storage/ directory deleted entirely — only file was storage.ts, now deleted

metrics:
  duration: ~15 minutes
  completed_date: 2026-04-12
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 2
  files_deleted: 3
---

# Phase 3 Plan 1: Jest Infrastructure, Dead Code Removal, TDD Red Phase Summary

Jest test infrastructure installed with jest-expo@54 preset, dead code deleted (App.tsx + src/storage/storage.ts), calculateStreak() removed as design pillar violation, and failing round-trip DailyLog test suite written targeting the rich schema Plan 02 will implement.

## What Was Built

### Task 1: Jest test infrastructure (commit 1517968)
- Installed `jest@29`, `jest-expo@54`, `@testing-library/react-native`, `react-test-renderer` as devDependencies
- Created `jest.config.js` with `jest-expo` preset, `moduleNameMapper` for `@/*` path aliases and AsyncStorage mock, `testMatch` for `.test.ts` and `.test.tsx`
- Added `test`, `test:watch`, `test:coverage` scripts to `package.json`

### Task 2: Dead code deletion (commit fc5e24a)
- Deleted `App.tsx` — dead entry point superseded by `expo-router/entry` in `package.json`
- Deleted `src/storage/storage.ts` — only imported by deleted App.tsx; types it exported already exist canonically in `src/data/types.ts`
- Removed `src/storage/` directory (empty after deletion)
- Removed `calculateStreak()` from `lib/storage.ts` — streak tracking violates the "Less Pressured" design pillar; no active callers in codebase
- Removed local `DailyLog` interface from `lib/storage.ts` — Plan 02 will import from `src/data/types.ts`

### Task 3: Round-trip DailyLog test suite - red phase (commit 363bc48)
- Created `lib/storage.test.ts` with 4 test cases targeting rich DailyLog schema
- Tests 1-3 (DailyLog persistence round-trip): PASS — existing `saveDailyLog`/`loadDailyLog` are schema-agnostic JSON serializers
- Test 4 (saveDailyRitual): FAIL — function not yet implemented (intended red state for Plan 02)

## Test Results at Plan End

```
Tests: 1 failed, 3 passed, 4 total
```

The single failure is `saveDailyRitual` — a function Plan 02 will create. This is the correct TDD red state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jest@29 required instead of jest@30**
- **Found during:** Task 1 verification
- **Issue:** jest@30 caused `ReferenceError: You are trying to import a file outside of the scope of the test code` from `expo/src/winter/runtime.native.ts` via lazy getter in `installGlobal.ts`. Root cause: jest-expo@54 internally depends on `@jest/*@^29.2.1`; jest@30's module runtime changed behavior for lazy `require()` calls inside property getters.
- **Fix:** Downgraded to `jest@29.7.0` to match jest-expo@54's peer dependency expectations.
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** 363bc48

**2. [Rule 1 - Bug] AsyncStorage mock via moduleNameMapper instead of setupFiles**
- **Found during:** Task 1 verification
- **Issue:** `setupFiles: ['@react-native-async-storage/async-storage/jest/async-storage-mock']` did not prevent the native module null error because RN's `defaultPlatform: 'ios'` resolved to `.native.ts` before the mock could intercept. The `moduleNameMapper` approach intercepts at the module resolution layer, before any native code is loaded.
- **Fix:** Added `'^@react-native-async-storage/async-storage$'` to `moduleNameMapper` pointing to the mock JS file directly. Also kept `setupFiles` entry for completeness.
- **Files modified:** `jest.config.js`
- **Commit:** 363bc48

## Known Stubs

None — this plan creates infrastructure and deletes code; no UI stubs introduced.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes at trust boundaries. Dev dependencies only.

## Self-Check

- FOUND: .planning/phases/03-storage-data-integrity/03-01-SUMMARY.md
- FOUND: jest.config.js
- FOUND: lib/storage.test.ts
- FOUND: commit 1517968 (task 1)
- FOUND: commit fc5e24a (task 2)
- FOUND: commit 363bc48 (task 3)

## Self-Check: PASSED
