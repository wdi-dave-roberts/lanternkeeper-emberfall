# Architecture

**Analysis Date:** 2026-04-11

## Pattern Overview

**Overall:** Mobile-first React Native app using Expo Router file-based routing with a three-layer architecture (UI → State Management → Storage).

**Key Characteristics:**
- Screen-driven navigation with Expo Router
- Local-only persistence via AsyncStorage (no cloud sync)
- Emotion-state-driven quest selection and feedback
- Animated scene with interactive gestures
- Progressive world unlocking based on emotional check-ins and visit count

## Layers

**Navigation (Router Layer):**
- Purpose: Client-side routing and screen orchestration
- Location: `app/` directory with Expo Router file-based routing
- Contains: Entry points (`app/index.tsx`), tab layouts (`app/(tabs)/_layout.tsx`), onboarding (`app/first-lantern.tsx`)
- Depends on: AsyncStorage for onboarding state, React Navigation theming
- Used by: All screens to navigate between pages

**UI Layer (Screens & Components):**
- Purpose: Render user interface and capture interactions
- Location: `app/(tabs)/`, `src/screens/`, `components/`
- Contains: Functional React Native screens, interactive gesture components, themed views
- Depends on: Data/Quests/Feedback, Storage functions, React Native Animated API
- Used by: Router layer to render page content

**Business Logic & Storage Layer:**
- Purpose: Manage app state, persistence, and domain rules
- Location: `lib/storage.ts`, `src/data/`, `src/storage/`
- Contains: AsyncStorage wrapper, quest/feedback data, world state management, region unlock logic
- Depends on: AsyncStorage (React Native)
- Used by: All screens and routers for state reads/writes

## Data Flow

**Daily Check-In Flow:**

1. User taps "Check In" on Home screen (`app/(tabs)/index.tsx`)
2. Home screen calls `recordDailyVisit()` from `lib/storage.ts`
3. World state loads: emotion counts, region unlocks evaluated
4. Navigation pushes to CheckInScreen (`src/screens/CheckInScreen.tsx`)
5. User selects emotion (Stuck/Frustrated/Inspired/Alright)
6. CheckInScreen calls `getRandomQuest(emotion)` from `src/data/quests.ts`
7. Navigation pushes to QuestScreen (`src/screens/QuestScreen.tsx`)
8. User taps "Done" → `completeQuest()` saves to daily log
9. QuestScreen calls `getRandomFeedback(emotion)` from `src/data/feedback.ts`
10. Aetherling's feedback line displays
11. User navigates back to Home

**State Management:**
- Ephemeral UI state: Managed locally in screen components via `useState`
- Persistent data: Stored via `lib/storage.ts` → AsyncStorage
  - `world-state` key: Tracks total visits, emotion histogram, unlocked regions
  - `daily-log:YYYY-MM-DD` keys: Tracks completed quests per date
  - `first-lantern-seen` key: Onboarding flag
- No Redux/Context API used — data fetched on demand from storage

## Key Abstractions

**Emotion:**
- Purpose: Represents user's internal state (stuck → frustrated → inspired → alright)
- Type: `type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright'`
- Used: Quest selection, feedback selection, world state tracking
- Examples: `src/data/types.ts`, `src/data/quests.ts`, `lib/storage.ts`

**Quest:**
- Purpose: A micro-task suggesting one small action aligned to emotion
- Structure: `{ id: string, emotion: Emotion, text: string }`
- Pattern: Pre-authored list (10 quests per emotion × 4 emotions = 40 total)
- Examples: `src/data/quests.ts`

**WorldState:**
- Purpose: Track Emberfall's evolution based on user emotional activity
- Structure: Tracks visit count, emotion histogram, unlocked regions
- Pattern: Persisted to AsyncStorage, re-evaluated on each check-in
- Examples: `lib/storage.ts:WorldState` interface, region unlock logic at line 75-95

**Region Unlock Logic:**
- Purpose: Gate world progression — regions unlock when emotional/temporal thresholds are hit
- Rules (in `lib/storage.ts:checkRegionUnlocks()`):
  - "Lantern Clearing" (home, always unlocked)
  - "Workshop Glade" (3 Inspired check-ins)
  - "Fog Valley" (3 Stuck check-ins)
  - "Warm River" (3 Frustrated check-ins)
  - "Observatory Balcony" (7 days visited)
  - "The Long Path" (14 days visited)

**DailyLog:**
- Purpose: Track per-day quest completion without enforcing streaks
- Structure: `{ date: YYYY-MM-DD, completedQuests: string[] }`
- Pattern: One entry per date, stored under `daily-log:` prefixed key
- Examples: `lib/storage.ts:DailyLog` interface

## Entry Points

**Root Layout (`app/_layout.tsx`):**
- Location: `app/_layout.tsx`
- Triggers: App launch
- Responsibilities: 
  - Sets up theme (dark Ember theme with warm colors)
  - Wraps all navigation with ThemeProvider
  - Configures GestureHandlerRootView for gesture support
  - Sets unstable_settings anchor to `(tabs)` for default route

**Index Route (`app/index.tsx`):**
- Location: `app/index.tsx`
- Triggers: Direct app launch (before any navigation)
- Responsibilities:
  - Checks `hasSeenFirstLantern()` from AsyncStorage
  - Redirects to `/first-lantern` (onboarding) if first time
  - Redirects to `/(tabs)` (home) if returning user
  - Shows loading spinner while checking

**Home Screen (`app/(tabs)/index.tsx`):**
- Location: `app/(tabs)/index.tsx`
- Triggers: After onboarding or tab selection
- Responsibilities:
  - Renders Aetherling character (animated red panda)
  - Renders Emberfall scene (winding path, fog wisps, leaves)
  - Displays "Check In" button to start emotion flow
  - Handles fog/leaf clearing via gesture interactions
  - Loads and displays world state via `loadWorldState()`

**Onboarding (`app/first-lantern.tsx`):**
- Location: `app/first-lantern.tsx`
- Triggers: First app launch only
- Responsibilities:
  - 11-phase animated scene (fog → Aetherling → dialogue → user choice → lighting)
  - Presents user with two symbolic choices (light or judge)
  - Animates lantern glow and fog clearing
  - Marks onboarding complete via `markFirstLanternSeen()`
  - Auto-advances and transitions to Home on completion

**Tab Navigation (`app/(tabs)/_layout.tsx`):**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: After index routing
- Responsibilities:
  - Defines two tabs: Home (house icon) and Explore (paper plane icon)
  - Applies haptic feedback on tab press via `HapticTab` component
  - Uses color theme for tab tint

## Error Handling

**Strategy:** Silent fallback to defaults with console logging.

**Patterns:**
- Storage operations wrapped in try-catch; returns empty defaults on error
  - Example: `loadState()` catches parse errors and returns `getDefaultState()`
  - Example: `getTodayLog()` returns `{ date: today, completedQuests: [] }` if missing
- Missing quests: Falls back to first quest in emotion pool
  - Example: `getAnotherQuest()` returns first if pool becomes empty
- AsyncStorage failures log to console but don't crash
- Navigation redirects on missing prerequisites (e.g., no first lantern → show onboarding)

## Cross-Cutting Concerns

**Logging:** `console.log()` for storage errors only (e.g., `loadState()` error handling). No structured logging.

**Validation:** 
- Emotion enum validation via TypeScript (4 literal strings)
- Date strings use ISO format (YYYY-MM-DD) with consistent formatting via `getTodayKey()`
- AsyncStorage data assumes valid JSON; parse errors handled gracefully

**Authentication:** None. App is local-only, no user accounts or login.

**Theming:**
- Root layout defines custom `EmberTheme` dark theme with warm colors (`#f4a040` primary, `#fff8f0` text)
- Theme colors defined in `constants/theme.ts` (light/dark color schemes)
- No live theme switching; fixed dark theme on app runtime

**Date Handling:**
- ISO date format (YYYY-MM-DD) stored in AsyncStorage
- `getTodayKey()` in `lib/storage.ts` generates today's key
- Same-day check via string comparison of dates (no timezone complexity)

---

*Architecture analysis: 2026-04-11*
