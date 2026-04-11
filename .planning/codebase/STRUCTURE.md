# Codebase Structure

**Analysis Date:** 2026-04-11

## Directory Layout

```
lanternkeeper-emberfall/
├── app/                          # Expo Router file-based routing (pages)
│   ├── _layout.tsx               # Root layout, theme setup, Stack config
│   ├── index.tsx                 # Landing page (onboarding router)
│   ├── first-lantern.tsx         # Onboarding scene (11-phase animation)
│   ├── modal.tsx                 # Modal page (unused template)
│   └── (tabs)/                   # Tab-based navigation
│       ├── _layout.tsx           # Tab navigation config (Home + Explore)
│       ├── index.tsx             # Home screen (Aetherling + Emberfall scene)
│       └── explore.tsx           # Explore screen (world state debug view)
│
├── src/                          # Core app logic
│   ├── data/                     # Domain data + types
│   │   ├── types.ts              # Emotion, Quest, DailyLog, IdeaSeed, AppState types
│   │   ├── quests.ts             # 40 micro-quests grouped by emotion
│   │   └── feedback.ts           # Aetherling feedback lines by emotion
│   ├── screens/                  # Unused modular screen components (legacy)
│   │   ├── HomeScreen.tsx        # Template (actual Home is in app/(tabs)/index.tsx)
│   │   ├── CheckInScreen.tsx     # Emotion selection screen (imported, not routed)
│   │   ├── QuestScreen.tsx       # Quest display + completion (imported, not routed)
│   │   └── IdeaSeedScreen.tsx    # Idea capture screen (not implemented)
│   └── storage/                  # AsyncStorage wrapper (legacy)
│       └── storage.ts            # Deprecated — use lib/storage.ts instead
│
├── lib/                          # Utilities & storage
│   └── storage.ts                # Primary storage abstraction for AsyncStorage
│
├── components/                   # Reusable UI components
│   ├── themed-text.tsx           # Themed Text wrapper
│   ├── themed-view.tsx           # Themed View wrapper
│   ├── parallax-scroll-view.tsx  # Parallax scroll container
│   ├── haptic-tab.tsx            # Tab button with haptic feedback
│   ├── hello-wave.tsx            # Greeting animation (unused)
│   ├── external-link.tsx         # Link wrapper with web fallback
│   └── ui/                       # Low-level UI components
│       ├── icon-symbol.tsx       # SF Symbols icon wrapper
│       ├── icon-symbol.ios.tsx   # iOS-specific version
│       └── collapsible.tsx       # Collapsible section
│
├── constants/                    # Global constants
│   └── theme.ts                  # Color & font definitions (light/dark modes)
│
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts       # React Native color scheme hook
│   ├── use-color-scheme.web.ts   # Web fallback
│   └── use-theme-color.ts        # Theme color hook
│
├── assets/                       # Static images & icons
│   └── images/                   # App icons, splash screen, favicon
│
├── .planning/                    # GSD documentation
│   └── codebase/                 # Codebase analysis docs (this file)
│
├── .claude/                      # Claude Code planning
│   └── plans/                    # Previous phase documentation
│
├── .vscode/                      # VS Code workspace settings
│
├── app.json                      # Expo app configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── expo-env.d.ts                 # Expo type definitions
└── README.md                     # Project documentation
```

## Directory Purposes

**app/**
- Purpose: Expo Router pages — file system maps to routes
- Contains: Route definitions, top-level screens, navigation structure
- Key files: `_layout.tsx` (root), `index.tsx` (root redirect), `(tabs)/` (main navigation)
- Route mapping:
  - `/` → `app/index.tsx`
  - `/first-lantern` → `app/first-lantern.tsx`
  - `/(tabs)` → `app/(tabs)/_layout.tsx`
  - `/(tabs)` → `app/(tabs)/index.tsx` (Home)
  - `/(tabs)/explore` → `app/(tabs)/explore.tsx` (Explore)

**src/**
- Purpose: Centralized business logic, screens, and data
- Contains: Types, quest/feedback data, screen implementations, storage
- Pattern: Logical grouping by concern (data, screens, storage)
- Note: Some screens (`src/screens/*`) are defined but not used; Home is rendered from `app/(tabs)/index.tsx` directly

**src/data/**
- Purpose: Domain-specific data and types
- Contains: Type definitions (Emotion, Quest, DailyLog), quest pool (40 items), feedback lines
- Key files: 
  - `types.ts` — Single source of truth for type definitions
  - `quests.ts` — Pre-authored quests with helper functions (getRandomQuest, getAnotherQuest)
  - `feedback.ts` — Aetherling responses with helper function (getRandomFeedback)

**src/screens/**
- Purpose: Modular screen components (template/legacy structure)
- Contains: Presentational components for CheckIn, Quest, IdeaSeed
- Note: Not routed directly; these are imported utilities, not Expo Router pages
- Pattern: Accept props from parent, emit callbacks (onSelectEmotion, onComplete)

**lib/storage.ts**
- Purpose: Primary AsyncStorage abstraction layer
- Contains: 
  - Onboarding state (hasSeenFirstLantern, markFirstLanternSeen)
  - World state (totalDaysVisited, emotionCounts, unlockedRegions)
  - Daily log (per-day quest tracking)
  - Region unlock logic
- Exports: ~18 functions for app to call

**src/storage/storage.ts**
- Purpose: Legacy storage abstraction (deprecated)
- Status: Kept for reference; use `lib/storage.ts` instead

**components/**
- Purpose: Reusable UI components (mostly theme-aware wrappers)
- Contains: Themed text/view wrappers, parallax scroll, haptic tab, icon symbols
- Pattern: Thin wrappers around React Native primitives with theme injection

**constants/theme.ts**
- Purpose: Centralized color & font definitions
- Contains: Color sets for light/dark modes, platform-specific font families
- Note: App uses fixed dark theme at runtime; light theme is defined but not used

**hooks/**
- Purpose: Custom React hooks for color scheme & theme
- Contains: Color scheme detection (delegated to React Native), theme color utilities
- Pattern: Thin wrappers around React Native hooks

## Key File Locations

**Entry Points:**
- `app/_layout.tsx` — Root layout, theme provider, gesture handler setup
- `app/index.tsx` — First-run redirect (onboarding router)
- `app/(tabs)/index.tsx` — Home screen (main interaction surface)
- `app/(tabs)/_layout.tsx` — Tab navigation structure

**Configuration:**
- `app.json` — Expo configuration (version, plugins, icons, splash)
- `tsconfig.json` — TypeScript strict mode, path aliases
- `package.json` — Dependencies (Expo, React Native, Reanimated, AsyncStorage)
- `constants/theme.ts` — App color palette

**Core Logic:**
- `lib/storage.ts` — AsyncStorage wrapper, world state, region unlocks
- `src/data/quests.ts` — Quest pool + selection helpers
- `src/data/feedback.ts` — Feedback lines + selection helpers
- `src/data/types.ts` — Type definitions (Emotion, Quest, DailyLog, WorldState)

**Testing:**
- No test files found in codebase

## Naming Conventions

**Files:**
- Screens: PascalCase (`FirstLanternScreen`, `CheckInScreen`)
- Components: PascalCase (`HapticTab`, `ThemedText`)
- Utilities/Hooks: camelCase with dash-separated words (`use-color-scheme.ts`, `parallax-scroll-view.tsx`)
- Data files: lowercase (`quests.ts`, `feedback.ts`, `types.ts`)
- Route files: lowercase or parentheses for groups (`index.tsx`, `_layout.tsx`, `(tabs)`)

**Directories:**
- Feature directories: lowercase (`src/screens/`, `src/data/`, `components/`)
- Route groups: parentheses (`(tabs)`, `(modal)` — Expo Router convention)
- UI subdirectories: lowercase (`ui/`, `images/`)

**TypeScript Types:**
- Emotion: Literal union `'stuck' | 'frustrated' | 'inspired' | 'alright'`
- Components: Props interfaces named `Props` or suffixed `Props` (e.g., `CheckInScreenProps`)
- Exports: Avoid `default` in utilities; use named exports

**Functions:**
- camelCase (`getRandomQuest`, `loadWorldState`, `recordDailyVisit`)
- Pure data accessors: `get*` or `load*` prefix
- Mutations: `save*` or `record*` prefix
- Helpers: Unprefixed (`getStorageKey`, `checkRegionUnlocks`)

## Where to Add New Code

**New Screen (Routed via Expo Router):**
- Create file in `app/` directory
- Naming: `screen-name.tsx` (kebab-case) or `(group)/screen-name.tsx`
- Structure: Default export Functional Component, no props needed (access navigation via `useRouter` from `expo-router`)
- Theme: Wrap top-level View with LinearGradient (see `app/(tabs)/explore.tsx` for pattern)
- Example: To add `/settings` route, create `app/settings.tsx`

**New Feature Screen (Not Routed):**
- Create in `src/screens/ComponentName.tsx`
- Structure: Accept props, emit callbacks (onSelectEmotion → handleSelect)
- Import & integrate in routed parent (e.g., integrate CheckInScreen into Home flow)

**New Quest or Feedback:**
- Add to `src/data/quests.ts` (append to QUESTS object)
- Add to `src/data/feedback.ts` (append to FEEDBACK object)
- Ensure same emotion key and unique ID
- Run `getRandomQuest(emotion)` test to verify

**New Component:**
- Create in `components/` for reusable UI
- Prefix `.web.ts` for web-specific versions (see `use-color-scheme.web.ts` pattern)
- Use named exports; document props interface

**New Utility Function:**
- Add to `lib/storage.ts` if data-related
- Add to `constants/theme.ts` if theme/visual constant
- Export named functions; avoid default exports

**New Type:**
- Add to `src/data/types.ts`
- Prefix interfaces with `I` or describe as union types
- Re-export from `src/data/types.ts` for import consistency

## Special Directories

**app/**
- Purpose: Expo Router routing (file → URL mapping)
- Generated: No
- Committed: Yes
- Pattern: File names become routes; `_layout.tsx` creates route groups; `(name)` syntax creates groups

**assets/images/**
- Purpose: App icons, splash screen, favicon
- Generated: No (manually added/designed)
- Committed: Yes
- Sizing: Follow Expo standard sizes (see `app.json` for icon/splash declarations)

**.planning/codebase/**
- Purpose: GSD analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: By GSD map-codebase agent
- Committed: Yes
- Pattern: Reference by other agents (gsd-plan-phase, gsd-execute-phase)

**.expo/**
- Purpose: Expo runtime cache
- Generated: Yes (by `expo start`)
- Committed: No (in .gitignore)
- Pattern: Contains compiled native code, should not be tracked

**node_modules/**
- Purpose: Installed dependencies
- Generated: Yes (by pnpm install / npm install)
- Committed: No (in .gitignore)

## Routing Map

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/index.tsx` | Root redirector (onboarding or home) |
| `/first-lantern` | `app/first-lantern.tsx` | Onboarding (one-time animation) |
| `/(tabs)` | `app/(tabs)/_layout.tsx` | Tab navigation container |
| `/(tabs)` | `app/(tabs)/index.tsx` | Home screen (Aetherling + check-in) |
| `/(tabs)/explore` | `app/(tabs)/explore.tsx` | Explore screen (world state, debug) |
| `/modal` | `app/modal.tsx` | Modal page (template, unused) |

---

*Structure analysis: 2026-04-11*
