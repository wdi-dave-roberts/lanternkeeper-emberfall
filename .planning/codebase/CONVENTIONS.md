# Coding Conventions

**Analysis Date:** 2026-04-11

## Naming Patterns

**Files:**
- Component files: PascalCase with `.tsx` extension (e.g., `HomeScreen.tsx`, `CheckInScreen.tsx`, `IdeaSeedScreen.tsx`)
- Utility/library files: camelCase with `.ts` extension (e.g., `storage.ts`, `quests.ts`, `feedback.ts`)
- Hook files: camelCase prefixed with `use-` (e.g., `use-color-scheme.ts`, `use-theme-color.ts`)

**Functions:**
- camelCase for all functions (e.g., `getRandomQuest`, `hasCheckedInToday`, `loadWorldState`)
- Utility/helper functions often have descriptive verb prefixes: `get`, `load`, `save`, `check`, `record`, `calculate`
- Example pattern: `getTodayKey()`, `recordDailyVisit()`, `checkRegionUnlocks()`

**Variables:**
- camelCase for all variables, including state variables
- Boolean variables often prefixed with `is`, `has`, `should` (e.g., `isLoading`, `hasCheckedInToday`, `shouldShowFirstLantern`)
- Animated values: descriptive names with "Opacity", "Scale", "Value" suffix (e.g., `fogOpacity`, `aetherlingOpacity`, `lanternGlow`, `screenFade`)

**Types:**
- `interface` for object structures: PascalCase (e.g., `Props`, `Quest`, `DailyLog`, `IdeaSeed`, `AppState`, `WorldState`)
- Union types (type unions): lowercase with pipes (e.g., `type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright'`)
- Screen phase types: lowercase with hyphens for multi-word phases (e.g., `type Phase = "fog" | "aetherling-appears" | "dialogue-1"`)

## Code Style

**Formatting:**
- eslint-config-expo is used for linting
- No explicit prettier config detected; uses Expo defaults
- Indentation: 2 spaces
- Max line length: no explicit limit, but code respects natural boundaries

**Linting:**
- ESLint with `eslint-config-expo` extends standard Expo patterns
- Run `npm run lint` to check code
- Configuration in `eslint.config.js` is minimal and delegates to Expo's flat config

**Key style observations:**
- Consistent use of arrow functions in components and callbacks
- StyleSheet.create() for React Native styles (collocated in same file)
- Descriptive comments above functions with JSDoc-style headers

## Import Organization

**Order:**
1. React imports (`import React from 'react'`)
2. React Native imports (`import { View, Text, StyleSheet, ... } from 'react-native'`)
3. Expo imports (`import { Animated, router } from 'expo-router'`, etc.)
4. Third-party packages
5. Local imports using alias paths (`@/lib/storage`, `@/data/types`, `@/screens/...`)

**Path Aliases:**
- `@/*` is configured to resolve to project root in `tsconfig.json`
- Used consistently: `@/lib/storage`, `@/hooks/use-color-scheme`, `@/data/types`
- Allows clean imports without relative path traversal

**Examples from codebase:**
```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Emotion, Quest } from '../data/types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, DailyLog, IdeaSeed } from '../data/types';
```

## Error Handling

**Patterns:**
- Try/catch blocks wrap async operations that interact with AsyncStorage
- Graceful fallbacks: if JSON parsing fails, return empty arrays or default state
- Silent failures logged to console: `console.log('Error loading state:', error)`
- Recovery: on AsyncStorage errors, `loadState()` returns `getDefaultState()` instead of throwing
- No explicit error boundary patterns detected; simple fallback approach preferred

**Example from `lib/storage.ts`:**
```typescript
export async function loadWorldState(): Promise<WorldState> {
  const data = await AsyncStorage.getItem(WORLD_STATE_KEY);
  if (!data) return { ...DEFAULT_WORLD_STATE };
  return JSON.parse(data) as WorldState;
}
```

**Example error handling:**
```typescript
try {
  const [logsRaw, seedsRaw, lastCheckIn] = await Promise.all([
    AsyncStorage.getItem(KEYS.LOGS),
    AsyncStorage.getItem(KEYS.SEEDS),
    AsyncStorage.getItem(KEYS.LAST_CHECK_IN),
  ]);
  // process...
} catch (error) {
  console.log('Error loading state:', error);
  return getDefaultState();
}
```

## Logging

**Framework:** console object (no external logging library)

**Patterns:**
- `console.log()` for errors and debug info
- Prefixed with context: `console.log('Error loading state:', error)`
- No debug levels (info, warn, error) differentiation
- Simple approach appropriate for local-only storage app

## Comments

**When to Comment:**
- File-level JSDoc comments describing purpose (present on most core files)
- Section separators with dashes for logical grouping (e.g., `// ----------------------------------------`)
- Comments explain "why" not "what" the code does

**JSDoc/TSDoc:**
- File headers follow this pattern:
```typescript
/**
 * [FileName]
 * [One-line purpose]
 * [Optional details]
 */
```

Examples from codebase:
- `/**  HomeScreen\n * Shows Aetherling and Emberfall scene\n * Entry point to the core loop\n */`
- `/** Micro-Quests\n * 40 small, kind tasks grouped by emotion\n * No pressure. No guilt. Just one small thing.\n */`

**Function documentation:**
```typescript
/**
 * Get a random quest for an emotion
 */
export function getRandomQuest(emotion: Emotion): Quest {
```

## Function Design

**Size:** Typically 15-50 lines, favoring shorter, focused functions
- Storage functions: 10-20 lines
- Screen components: 40-100 lines (including JSX)
- Helper utilities: 5-15 lines

**Parameters:**
- Props passed as single interface object (React convention)
- Example: `interface Props { onStartCheckIn: () => void; onOpenIdeaSeeds: () => void; alreadyCheckedIn?: boolean; }`
- Callbacks passed as optional props with handler names prefixed `on`: `onSelectEmotion`, `onComplete`, `onSkip`, `onBack`

**Return Values:**
- Functions return specific types, not unions unless necessary
- Async functions explicitly return `Promise<T>`
- Storage functions return promises: `Promise<void>`, `Promise<WorldState>`, `Promise<DailyLog>`
- Utility getters return direct values: `getRandomQuest(emotion: Emotion): Quest`

## Module Design

**Exports:**
- Primary exports: named exports for functions and types
- Components: default exports (e.g., `export default function HomeScreen(...)`)
- Types and utilities: named exports (e.g., `export type Emotion = ...`, `export const QUESTS = ...`)

**Barrel Files:** Not used; imports reference specific files directly

**Data Organization:**
- `src/data/types.ts`: Central type definitions
- `src/data/quests.ts`: Quest data and related utility functions
- `src/data/feedback.ts`: Feedback line data and utility functions
- `src/storage/storage.ts`: Async storage operations (older structure, being migrated to `lib/storage.ts`)
- `lib/storage.ts`: Newer storage abstraction with world state, daily logs

**Constants:**
- Stored in dedicated files: `QUESTS`, `FEEDBACK`, `KEYS`, `DEFAULT_WORLD_STATE`
- Exported as `Record<Type, Type[]>` objects for data lookup (e.g., `QUESTS: Record<Emotion, Quest[]>`)

## TypeScript Configuration

**Strict Mode:** Enabled in `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Type Usage:**
- Props interfaces always defined at component file top
- Types re-exported from `src/data/types.ts` as central source
- No `any` types; specific types used throughout

---

*Convention analysis: 2026-04-11*
