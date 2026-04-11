# Codebase Concerns

**Analysis Date:** 2026-04-11

## Tech Debt

**Duplicate Storage Layer:**
- Issue: Two separate storage implementations exist (`lib/storage.ts` and `src/storage/storage.ts`) with different schemas and no clear ownership
- Files: `lib/storage.ts` (164 lines), `src/storage/storage.ts` (126 lines)
- Impact: Code confusion, inconsistent data models, risk of mutation conflicts. New features can't determine which layer to use
- Fix approach: Consolidate both into a single `lib/storage.ts`. Keep only one DailyLog schema. Update all imports across the codebase

**Inconsistent Data Models:**
- Issue: Multiple DailyLog types exist with conflicting fields across `src/data/types.ts` and `lib/storage.ts`
  - `src/data/types.ts` has `emotion`, `quest`, `completed`, `completedAt`
  - `lib/storage.ts` has only `date`, `completedQuests[]`
- Files: `src/data/types.ts`, `lib/storage.ts`, `App.tsx` (uses one schema), `app/(tabs)/index.tsx` (uses another)
- Impact: App.tsx saves one schema, home screen loads another. Data mismatch on reload
- Fix approach: Single source of truth. Define DailyLog once. Update all load/save sites

**Unused Older Storage Code:**
- Issue: `src/storage/storage.ts` with `loadState()`, `saveSeed()` never called from current UI
- Files: `src/storage/storage.ts` (entire file unused), `src/data/types.ts` (AppState interface unused)
- Impact: Dead code creates confusion about which API to use. Maintenance burden
- Fix approach: Delete `src/storage/storage.ts` and `AppState` type after consolidation

**Silent Error Handling:**
- Issue: All AsyncStorage errors are caught but only logged to console with no user feedback
- Files: `src/storage/storage.ts` (lines 46-49, 69-71, 90-92, 123-125)
- Impact: Storage failures go unnoticed. User data may be lost without knowing. Difficult to debug in production
- Fix approach: Return error states from storage functions. Handle in UI with fallback messaging. Log to error tracker

## Known Bugs

**Quest Data Type Mismatch:**
- Symptoms: App.tsx passes `Quest` object to QuestScreen, but home screen stores quest as plain string (`quest` state). Quest.text vs quest string causes mismatch
- Files: `App.tsx` (line 36), `src/screens/QuestScreen.tsx` (line 61 - tries to access `quest?.text`)
- Trigger: Navigate to quest screen, then return home and check quest state
- Workaround: QuestScreen has fallback `'No quest available'`, so display works but state inconsistency remains

**Home Screen Animation Reset Not Cleaned Up:**
- Issue: When user presses "Walk again" (resetMorning), animations aren't explicitly cancelled. Animation refs remain mounted
- Files: `app/(tabs)/index.tsx` (lines 305-350 loop animation, line 686-699 reset doesn't cancel)
- Impact: Memory leak if user repeatedly triggers resets. Multiple animation loops could accumulate
- Fix approach: Store animation ref, explicitly cancel in useEffect cleanup before reset

**Emotion Not Cleared After Completion:**
- Issue: After quest completion, `emotion` state remains set (line 644, 684). Pressing "Walk again" (resetMorning) sets emotion to null but doesn't prevent re-selecting
- Files: `app/(tabs)/index.tsx` (lines 686-699)
- Impact: UI state fragility. Rapid navigation could trigger unexpected state combos
- Workaround: UI guards prevent this (line 859 checks `!emotion`), but state is fragile

**Day Count Doesn't Reset at Midnight:**
- Issue: `totalDaysVisited` only increments if `lastVisitDate !== today` (lib/storage.ts line 57). But what if user visits at 11:59 PM, then again at 12:01 AM?
- Files: `lib/storage.ts` (lines 52-59), called from `app/(tabs)/index.tsx` (line 648)
- Trigger: Visit app at 23:50, close, reopen after midnight
- Impact: Can count same day twice if timezone boundaries crossed. Day counter becomes unreliable
- Fix approach: Use strict date comparison with full ISO string check

## Security Considerations

**No Data Validation on Load:**
- Risk: AsyncStorage data is JSON.parse() directly without schema validation. Malformed data crashes app
- Files: `lib/storage.ts` (lines 42-45), `src/storage/storage.ts` (lines 42-45)
- Current mitigation: Try/catch returns default state, but no schema checking
- Recommendations: Add Zod or runtime schema validation. Reject invalid structures before assigning

**No Encryption for Local Storage:**
- Risk: AsyncStorage on Android stores data in plain text. User emotion logs and idea seeds readable to anyone with device access
- Files: All storage operations use AsyncStorage without encryption
- Current mitigation: None
- Recommendations: For future versions, use `react-native-keychain` for sensitive data. Idea seeds < encryption threshold, but emotions could be personal

**First Lantern State Persists:**
- Risk: Once `first-lantern-seen` is set to 'true', onboarding can never be shown again. No reset mechanism (except `clearAllData()` which clears everything)
- Files: `lib/storage.ts` (lines 8-15)
- Current mitigation: None
- Recommendations: Add `clearFirstLanternSeen()` function for testing/reset scenarios

## Performance Bottlenecks

**Gesture Pan Listener on Every Frame:**
- Problem: `panGesture.onUpdate()` loops through all FOG_WISPS and LEAVES on every touch move (lines 606-626)
- Files: `app/(tabs)/index.tsx` (lines 600-628)
- Cause: No debouncing or hit-testing optimization. Distance check happens for every particle on every move
- Cause impact: ~6 wisps + 3 leaves = 9 distance checks per touch frame. On low-end devices, can jank
- Improvement path: 
  - Add spatial hashing or quad-tree for hit detection
  - Debounce pan updates to 16ms intervals (1 frame at 60fps)
  - Or: Use native pan responder with calculateHitSlop for touch detection

**Memoization Gap in RedPanda Component:**
- Problem: `RedPanda` receives `pathPoints` array. Every scene reconfig (orientation change) creates new array reference, even if values identical
- Files: `app/(tabs)/index.tsx` (line 491, passed to RedPanda line 804)
- Cause: `getSceneConfig()` called in useMemo, but it's recreated on `[width, height, insets.top]` changes. PathPoints are new objects
- Impact: RedPanda rerenders unnecessarily, animations restart
- Improvement path: Memoize pathPoints independently in RedPanda, or use useCallback for getSceneConfig

**World State Loaded Synchronously, Blocks Render:**
- Problem: `loadWorldState()` and `loadTodayLog()` run async but no loading skeleton shown
- Files: `app/(tabs)/index.tsx` (lines 514-538)
- Cause: useEffect runs, but render completes before async data arrives
- Impact: First render shows blank state (~2-5ms AsyncStorage latency), then updates. Slight flicker on cold start
- Improvement path: Add `isLoading` state while data fetches. Show skeleton UI in ritual panel

**Region Unlock Logic Runs on Every Daily Visit:**
- Problem: `checkRegionUnlocks()` iterates through 5 unlock conditions every time emotion is recorded
- Files: `lib/storage.ts` (lines 75-95)
- Cause: No caching or early return
- Impact: Negligible on single record (one per visit), but becomes waste if called multiple times per day
- Improvement path: Check only conditions that changed (e.g., if inspired count incremented, check inspired unlock only)

## Fragile Areas

**Emotion Selection State Machine:**
- Files: `app/(tabs)/index.tsx` (state spread across lines 499, 644, 686)
- Why fragile: Complex conditional rendering based on 5+ states (`emotion`, `questDone`, `alreadyCheckedIn`, `readyForCheckIn`, `pathCleared`). Combinations aren't validated
- Example: What if `emotion` is set but `questDone` also true? UI guards may conflict
- Safe modification: Extract into explicit enum-based state machine. Define all valid states + transitions
- Test coverage: No tests for state combinations. Recommend unit tests for `resetMorning()` flow

**Pan Gesture With Animated Position:**
- Files: `app/(tabs)/index.tsx` (lines 600-628, fog/leaf rendering lines 774-796)
- Why fragile: Pan updates are synchronous but animations are async. Clearing a fog wisp while animation mid-flight can cause visual artifacts
- Example: User swipes while fog is fading out from previous gesture
- Safe modification: Track `isAnimating` state per wisp. Prevent new clears until fade completes
- Test coverage: Manual testing only. Needs automated gesture tests

**Hard-coded Safe Area Offsets:**
- Files: `app/(tabs)/index.tsx` (lines 27-61, especially line 32: `SAFE_OFFSET = topInset + SCENE_HEIGHT * 0.20`)
- Why fragile: Magic number `0.20` assumes specific screen ratios. On ultra-wide or ultra-tall devices, path positioning breaks
- Example: Foldable phones, landscape mode (if added)
- Safe modification: Calculate offset as percentage of remaining viewport, validate path doesn't exceed bounds
- Test coverage: Only tested on standard portrait phones

**Dialogue Text Not Escaped:**
- Files: `app/(tabs)/index.tsx` (lines 502-503, 543, etc. - hardcoded strings)
- Why fragile: If dialogue ever pulled from external source, XSS-like issues in TextInput possible (low risk for current static case)
- Example: Currently safe, but dialogue map (lines 574-581) could be loaded from JSON
- Safe modification: Define all dialogue in typed constants. Validate strings against allowlist
- Test coverage: Not applicable yet since strings are hardcoded

## Scaling Limits

**AsyncStorage Limitations at Scale:**
- Current capacity: Logs kept to 100 entries (line 65, `src/storage/storage.ts`), seeds to 200 (line 87)
- Limit: AsyncStorage has ~10MB limit on most platforms. At ~500 bytes per log entry, ~20k entries max before hitting limit
- Scaling path: Migrate to local SQLite (via `expo-sqlite`) when data exceeds 1MB. Implement pagination UI for historical logs

**Animated Values Not Released:**
- Current capacity: ~10 animation refs per screen (fogOpacity, aetherlingOpacity, lanternGlow, etc. in first-lantern.tsx; posX, posY, scale in RedPanda)
- Limit: Each animated value uses memory. Accumulate across multiple navigation cycles without cleanup
- Scaling path: Ensure cleanup on screen unmount. Profile with React DevTools to catch leaks

**Region Unlock Model Doesn't Scale Beyond 5 Regions:**
- Current capacity: 5 hard-coded regions (workshop-glade, fog-valley, etc.) with manual if-checks
- Limit: Adding 10+ regions requires rewriting unlock logic
- Scaling path: Move to data-driven unlock system. Define regions in JSON with unlock conditions as function references

## Dependencies at Risk

**React 19 + React Native 0.81 Compatibility:**
- Risk: React 19.1.0 (package.json line 32) with React Native 0.81.5 (line 34) is cutting edge. RN 0.81 is one of the first stable releases with React 19
- Impact: Breaking changes in React 19 (server components, async hooks) not yet tested with RN ecosystem. Navigation or state management may break on point version update
- Migration plan: Pin exact versions in package-lock.json. Test thoroughly before updating. Consider using Expo SDK 55 (when stable) which has official RN 0.81 support

**Expo Router 6.0 Stability:**
- Risk: Using `expo-router@~6.0.21` which is relatively new. No major version bump history yet
- Impact: API changes or regressions could break app routing. First-lantern screen uses `router.replace()` which may behave differently on updates
- Migration plan: Lock major version (`~6.0.21`). Monitor expo-router release notes. Test before updating

**Gesture Handler Performance:**
- Risk: `react-native-gesture-handler@~2.28.0` used for pan gesture. Heavy animations + pan can cause jank
- Impact: Already identified pan gesture bottleneck above. Future versions may not improve perf
- Migration plan: Evaluate react-native-reanimated's built-in gesture handling. Reanimated is already a dependency (line 36)

**No Testing Framework:**
- Risk: Zero test infrastructure. No jest.config, no test files found
- Impact: Can't catch regressions. Refactoring dangerous. Manual testing only
- Migration plan: Install jest + @testing-library/react-native. Start with storage layer tests (deterministic, no UI)

## Missing Critical Features

**No Error Boundary:**
- Problem: Any component crash crashes entire app. No fallback UI
- Blocks: Graceful error handling, user trust
- Recommendation: Add ErrorBoundary wrapper in `app/_layout.tsx`

**No Analytics or Crash Reporting:**
- Problem: Silent crashes (caught in try/catch) never surfaced. No visibility into real user issues
- Blocks: Understanding production problems, improving reliability
- Recommendation: Add Sentry or similar for crash reporting

**No Data Export:**
- Problem: User emotion logs and idea seeds are locked in AsyncStorage. No way to backup or migrate to new device
- Blocks: User data portability, competitive feature parity
- Recommendation: Add "Export as JSON" button in settings (future screen)

**No Offline Indicator:**
- Problem: App is fully offline, but no UI indication. User might expect cloud sync
- Blocks: Clear user expectations
- Recommendation: Add footer badge "Local storage only" on home screen

## Test Coverage Gaps

**Storage Layer Untested:**
- What's not tested: `loadState()`, `saveLog()`, `saveSeed()`, `loadWorldState()`, `recordDailyVisit()`, `checkRegionUnlocks()`
- Files: `lib/storage.ts`, `src/storage/storage.ts`
- Risk: Data corruption on edge cases. Timezone bugs (day rollover). Unlock logic broken silently
- Priority: **High** - Core data persistence, no safety net

**Gesture Interaction Untested:**
- What's not tested: Pan detection, fog/leaf clearing collision, animation sequencing
- Files: `app/(tabs)/index.tsx` (lines 600-628, 567-583, 585-598)
- Risk: Swipe interaction breaks on certain devices. Fog doesn't clear reliably
- Priority: **High** - Core user interaction, easy to regress

**State Transitions Untested:**
- What's not tested: Complete flow from home → emotion select → quest → done → home
- Files: `app/(tabs)/index.tsx` entire screen, interaction with `App.tsx` (if used)
- Risk: State machines become unmaintainable. Edge cases like "select emotion, immediately press Walk Again" cause crashes
- Priority: **Medium** - Complex but navigable with guards

**Animation Consistency Untested:**
- What's not tested: First-lantern onboarding animation sequence, timing, phase transitions
- Files: `app/first-lantern.tsx` (lines 44-81, 84-98, 100-111)
- Risk: Animations jank on low-end devices. Phase transitions race condition (phase set before animation completes)
- Priority: **Medium** - Visual but non-critical to functionality

---

*Concerns audit: 2026-04-11*
