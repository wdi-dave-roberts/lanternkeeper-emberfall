# Lanternkeeper: Emberfall -- Claude Guide

> Single source of truth for project constraints.
> Full teaching reference: https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/

---

## Project Summary

Lanternkeeper: Emberfall is a calm, ritual-based mobile companion game built with Expo + React Native. A red panda named Aetherling walks alongside the player through Emberfall, offering emotion check-ins, micro-quests, and quiet encouragement. Never pressure.

Built as a gift for Garrett (solo indie game dev building Atlas), and as a bonding/learning project between Dave and Allie.

---

## Tech Stack

- Expo 54 + React Native + TypeScript
- Expo Router (file-based routing)
- AsyncStorage (local-only, no backend)
- React Native Reanimated + Gesture Handler (animations)

---

## Design Pillars

1. **Understood** -- The app mirrors the user's inner state without judgment
2. **Inspired** -- The app protects creative momentum and meaning
3. **Less Pressured** -- No streaks, no penalties, time is neutral, rest is normal

---

## Core Loop

1. Home screen shows Aetherling and Emberfall scene
2. User clears fog and brushes leaves
3. User selects emotion: Stuck / Frustrated / Inspired / Alright
4. App suggests one micro-quest
5. User taps Done
6. Aetherling shows a feedback line

---

## Aetherling Voice Rules

Tone: Calm, dry, warm-under-the-surface, respectful, non-performative

**Language constraints:**
- Short sentences
- No exclamation points
- No slang or emojis
- No motivational cliches

Aetherling is a quiet builder, a steady companion, a thoughtful observer.
Aetherling is not a cheerleader, a therapist, or a productivity coach.

Full voice reference: https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/game-design/voice/

---

## Game Content

- Quest catalog (40 quests): `src/data/quests.ts`
- Feedback lines (20 lines): `src/data/feedback.ts`
- Type definitions: `src/data/types.ts`

Do not duplicate game content in this file. The source of truth is `src/data/`.

---

## Implementation Rules

- Make one small change at a time
- Never refactor the whole project without permission
- Stop after each major step and ask for confirmation
- Keep visuals simple until the logic is solid

---

## File Structure

```
app/              # Expo Router screens and layouts
src/components/   # Reusable UI components
src/screens/      # Screen-level components
src/data/         # Game content (quests, feedback, types)
src/logic/        # Game logic
src/storage/      # Storage utilities (legacy -- migrating to lib/)
lib/              # Current storage abstraction
```

---

## Final Rule

If a change does not make the user feel:
- more understood
- more inspired
- less pressured

Then do not build it.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Lanternkeeper: Emberfall**

A calm, ritual-based mobile companion game for solo indie developers. A red panda named Aetherling walks alongside the player through a world called Emberfall, offering emotion check-ins, micro-quests, and quiet encouragement — never pressure. Built with Expo + React Native as a gift for Garrett (solo indie game dev building a game called Atlas), and as a bonding/learning project between Dave and Allie.

Allie built a working prototype through vibe coding — fog clearing, leaf brushing, emotion check-ins, micro-quests, region unlocks. This milestone is about evaluating and refining that foundation before building further.

**Core Value:** The app makes the user feel understood, inspired, and less pressured — or it doesn't ship.

### Constraints

- **Tech stack**: Expo 54 + React Native + TypeScript + AsyncStorage + Expo Router — established, not changing
- **Local-only**: No backend, no cloud — by design
- **Timeline**: No deadline — quality over speed, "when it's ready"
- **Approach**: Evaluate and refine existing code, not rewrite — respect Allie's work
- **Code clarity**: Code should be readable enough for Allie to learn from and contribute to
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.2 - All application code and configuration
- JavaScript - Package scripts and build tooling
## Runtime
- Node.js - Build and development environment
- Expo - Runtime for iOS, Android, and web
- npm - Dependency management
- Lockfile: `package-lock.json` present
## Frameworks
- Expo ~54.0.31 - Cross-platform runtime and build system
- React Native 0.81.5 - UI framework
- React 19.1.0 - Component library and hooks
- Expo Router ~6.0.21 - File-based routing system
- React Navigation 7.1.8 - Navigation infrastructure
- expo-linear-gradient ~15.0.8 - Gradient rendering
- react-native-reanimated ~4.1.1 - Gesture-driven animation library
- react-native-gesture-handler ~2.28.0 - Touch gesture detection
- expo-haptics ~15.0.8 - Haptic feedback (vibration)
- @expo/vector-icons ^15.0.3 - Icon library
- expo-symbols ~1.0.8 - Apple SF Symbols support
- expo-image ~3.0.11 - Optimized image component
- expo-font ~14.0.10 - Custom font loading
- react-native-safe-area-context ~5.6.0 - Safe area handling for notches
- react-native-screens ~4.16.0 - Native screen management
- react-native-web ~0.21.0 - Web support for React Native components
## Key Dependencies
- @react-native-async-storage/async-storage ^2.2.0 - Local persistent storage for logs and idea seeds
- react-native-worklets 0.5.1 - Low-level animation worklets
- expo-status-bar ~3.0.9 - Status bar management
- expo-system-ui ~6.0.9 - System UI customization
- expo-splash-screen ~31.0.13 - Splash screen configuration
- expo-linking ~8.0.11 - Deep linking support
- expo-web-browser ~15.0.10 - Web browser integration
- expo-constants ~18.0.13 - Expo app constants access
- react-dom 19.1.0 - DOM rendering for web platform
## Configuration
- Config: `tsconfig.json`
- Extends: `expo/tsconfig.base`
- Strict mode: enabled
- Path aliases: `@/*` resolves to project root
- ESLint 9.25.0
- Config: `eslint.config.js`
- Preset: `eslint-config-expo` ~10.0.0 (Expo linting rules)
- File: `app.json`
- Orientation: portrait
- New Architecture: enabled (`newArchEnabled: true`)
- React Compiler: enabled (`reactCompiler: true`)
- Typed Routes: enabled (`typedRoutes: true`)
- iOS (supports tablet)
- Android (edge-to-edge mode, adaptive icon)
- Web (static output)
## Platform Requirements
- Node.js (version via npm/package manager)
- TypeScript 5.9.2+
- Expo CLI (included via `expo` package)
- iOS: iOS 12+ (configured in `app.json`)
- Android: API level varies by Expo version
- Web: Modern browsers with React support
## Development Scripts
## Data Storage
- No cloud synchronization
- No backend API integration
- Device-local persistence via AsyncStorage
## Notable Tech Choices
- Designed for local data only (user privacy first)
- Logs stored in `@lanternkeeper_logs` AsyncStorage key
- Idea seeds stored in `@lanternkeeper_seeds` AsyncStorage key
- Max 100 log entries, 200 idea seeds retained per device
- Single codebase for iOS, Android, web
- Fast development iteration
- No native code required
- Built-in Expo services for builds and updates
- Smooth 60 FPS animations for interactive elements
- Native gesture recognition without network calls
- Fog/leaf clearing animations driven by touch
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Component files: PascalCase with `.tsx` extension (e.g., `HomeScreen.tsx`, `CheckInScreen.tsx`, `IdeaSeedScreen.tsx`)
- Utility/library files: camelCase with `.ts` extension (e.g., `storage.ts`, `quests.ts`, `feedback.ts`)
- Hook files: camelCase prefixed with `use-` (e.g., `use-color-scheme.ts`, `use-theme-color.ts`)
- camelCase for all functions (e.g., `getRandomQuest`, `hasCheckedInToday`, `loadWorldState`)
- Utility/helper functions often have descriptive verb prefixes: `get`, `load`, `save`, `check`, `record`, `calculate`
- Example pattern: `getTodayKey()`, `recordDailyVisit()`, `checkRegionUnlocks()`
- camelCase for all variables, including state variables
- Boolean variables often prefixed with `is`, `has`, `should` (e.g., `isLoading`, `hasCheckedInToday`, `shouldShowFirstLantern`)
- Animated values: descriptive names with "Opacity", "Scale", "Value" suffix (e.g., `fogOpacity`, `aetherlingOpacity`, `lanternGlow`, `screenFade`)
- `interface` for object structures: PascalCase (e.g., `Props`, `Quest`, `DailyLog`, `IdeaSeed`, `AppState`, `WorldState`)
- Union types (type unions): lowercase with pipes (e.g., `type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright'`)
- Screen phase types: lowercase with hyphens for multi-word phases (e.g., `type Phase = "fog" | "aetherling-appears" | "dialogue-1"`)
## Code Style
- eslint-config-expo is used for linting
- No explicit prettier config detected; uses Expo defaults
- Indentation: 2 spaces
- Max line length: no explicit limit, but code respects natural boundaries
- ESLint with `eslint-config-expo` extends standard Expo patterns
- Run `npm run lint` to check code
- Configuration in `eslint.config.js` is minimal and delegates to Expo's flat config
- Consistent use of arrow functions in components and callbacks
- StyleSheet.create() for React Native styles (collocated in same file)
- Descriptive comments above functions with JSDoc-style headers
## Import Organization
- `@/*` is configured to resolve to project root in `tsconfig.json`
- Used consistently: `@/lib/storage`, `@/hooks/use-color-scheme`, `@/data/types`
- Allows clean imports without relative path traversal
## Error Handling
- Try/catch blocks wrap async operations that interact with AsyncStorage
- Graceful fallbacks: if JSON parsing fails, return empty arrays or default state
- Silent failures logged to console: `console.log('Error loading state:', error)`
- Recovery: on AsyncStorage errors, `loadState()` returns `getDefaultState()` instead of throwing
- No explicit error boundary patterns detected; simple fallback approach preferred
## Logging
- `console.log()` for errors and debug info
- Prefixed with context: `console.log('Error loading state:', error)`
- No debug levels (info, warn, error) differentiation
- Simple approach appropriate for local-only storage app
## Comments
- File-level JSDoc comments describing purpose (present on most core files)
- Section separators with dashes for logical grouping (e.g., `// ----------------------------------------`)
- Comments explain "why" not "what" the code does
- File headers follow this pattern:
- `/**  HomeScreen\n * Shows Aetherling and Emberfall scene\n * Entry point to the core loop\n */`
- `/** Micro-Quests\n * 40 small, kind tasks grouped by emotion\n * No pressure. No guilt. Just one small thing.\n */`
## Function Design
- Storage functions: 10-20 lines
- Screen components: 40-100 lines (including JSX)
- Helper utilities: 5-15 lines
- Props passed as single interface object (React convention)
- Example: `interface Props { onStartCheckIn: () => void; onOpenIdeaSeeds: () => void; alreadyCheckedIn?: boolean; }`
- Callbacks passed as optional props with handler names prefixed `on`: `onSelectEmotion`, `onComplete`, `onSkip`, `onBack`
- Functions return specific types, not unions unless necessary
- Async functions explicitly return `Promise<T>`
- Storage functions return promises: `Promise<void>`, `Promise<WorldState>`, `Promise<DailyLog>`
- Utility getters return direct values: `getRandomQuest(emotion: Emotion): Quest`
## Module Design
- Primary exports: named exports for functions and types
- Components: default exports (e.g., `export default function HomeScreen(...)`)
- Types and utilities: named exports (e.g., `export type Emotion = ...`, `export const QUESTS = ...`)
- `src/data/types.ts`: Central type definitions
- `src/data/quests.ts`: Quest data and related utility functions
- `src/data/feedback.ts`: Feedback line data and utility functions
- `src/storage/storage.ts`: Async storage operations (older structure, being migrated to `lib/storage.ts`)
- `lib/storage.ts`: Newer storage abstraction with world state, daily logs
- Stored in dedicated files: `QUESTS`, `FEEDBACK`, `KEYS`, `DEFAULT_WORLD_STATE`
- Exported as `Record<Type, Type[]>` objects for data lookup (e.g., `QUESTS: Record<Emotion, Quest[]>`)
## TypeScript Configuration
- Props interfaces always defined at component file top
- Types re-exported from `src/data/types.ts` as central source
- No `any` types; specific types used throughout
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Screen-driven navigation with Expo Router
- Local-only persistence via AsyncStorage (no cloud sync)
- Emotion-state-driven quest selection and feedback
- Animated scene with interactive gestures
- Progressive world unlocking based on emotional check-ins and visit count
## Layers
- Purpose: Client-side routing and screen orchestration
- Location: `app/` directory with Expo Router file-based routing
- Contains: Entry points (`app/index.tsx`), tab layouts (`app/(tabs)/_layout.tsx`), onboarding (`app/first-lantern.tsx`)
- Depends on: AsyncStorage for onboarding state, React Navigation theming
- Used by: All screens to navigate between pages
- Purpose: Render user interface and capture interactions
- Location: `app/(tabs)/`, `src/screens/`, `components/`
- Contains: Functional React Native screens, interactive gesture components, themed views
- Depends on: Data/Quests/Feedback, Storage functions, React Native Animated API
- Used by: Router layer to render page content
- Purpose: Manage app state, persistence, and domain rules
- Location: `lib/storage.ts`, `src/data/`, `src/storage/`
- Contains: AsyncStorage wrapper, quest/feedback data, world state management, region unlock logic
- Depends on: AsyncStorage (React Native)
- Used by: All screens and routers for state reads/writes
## Data Flow
- Ephemeral UI state: Managed locally in screen components via `useState`
- Persistent data: Stored via `lib/storage.ts` → AsyncStorage
- No Redux/Context API used — data fetched on demand from storage
## Key Abstractions
- Purpose: Represents user's internal state (stuck → frustrated → inspired → alright)
- Type: `type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright'`
- Used: Quest selection, feedback selection, world state tracking
- Examples: `src/data/types.ts`, `src/data/quests.ts`, `lib/storage.ts`
- Purpose: A micro-task suggesting one small action aligned to emotion
- Structure: `{ id: string, emotion: Emotion, text: string }`
- Pattern: Pre-authored list (10 quests per emotion × 4 emotions = 40 total)
- Examples: `src/data/quests.ts`
- Purpose: Track Emberfall's evolution based on user emotional activity
- Structure: Tracks visit count, emotion histogram, unlocked regions
- Pattern: Persisted to AsyncStorage, re-evaluated on each check-in
- Examples: `lib/storage.ts:WorldState` interface, region unlock logic at line 75-95
- Purpose: Gate world progression — regions unlock when emotional/temporal thresholds are hit
- Rules (in `lib/storage.ts:checkRegionUnlocks()`):
- Purpose: Track per-day quest completion without enforcing streaks
- Structure: `{ date: YYYY-MM-DD, completedQuests: string[] }`
- Pattern: One entry per date, stored under `daily-log:` prefixed key
- Examples: `lib/storage.ts:DailyLog` interface
## Entry Points
- Location: `app/_layout.tsx`
- Triggers: App launch
- Responsibilities: 
- Location: `app/index.tsx`
- Triggers: Direct app launch (before any navigation)
- Responsibilities:
- Location: `app/(tabs)/index.tsx`
- Triggers: After onboarding or tab selection
- Responsibilities:
- Location: `app/first-lantern.tsx`
- Triggers: First app launch only
- Responsibilities:
- Location: `app/(tabs)/_layout.tsx`
- Triggers: After index routing
- Responsibilities:
## Error Handling
- Storage operations wrapped in try-catch; returns empty defaults on error
- Missing quests: Falls back to first quest in emotion pool
- AsyncStorage failures log to console but don't crash
- Navigation redirects on missing prerequisites (e.g., no first lantern → show onboarding)
## Cross-Cutting Concerns
- Emotion enum validation via TypeScript (4 literal strings)
- Date strings use ISO format (YYYY-MM-DD) with consistent formatting via `getTodayKey()`
- AsyncStorage data assumes valid JSON; parse errors handled gracefully
- Root layout defines custom `EmberTheme` dark theme with warm colors (`#f4a040` primary, `#fff8f0` text)
- Theme colors defined in `constants/theme.ts` (light/dark color schemes)
- No live theme switching; fixed dark theme on app runtime
- ISO date format (YYYY-MM-DD) stored in AsyncStorage
- `getTodayKey()` in `lib/storage.ts` generates today's key
- Same-day check via string comparison of dates (no timezone complexity)
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

### setup-environment
**Trigger:** "setup my environment", "set up my environment", "setup", "get started"
Detects platform, checks for Node.js, installs dependencies, starts Expo dev server, walks user through connecting phone. Designed for non-technical users.
Instructions: `.claude/skills/setup-environment.md`

### test-walkthrough
**Trigger:** `@TESTING-GUIDE.md`, "run the testing guide", "start testing", "test the app"
Interactive step-by-step testing walkthrough. Explains each test, collects feedback to `testing/FEEDBACK.md`, handles commit/push at the end.
Instructions: `TESTING-GUIDE.md`
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
