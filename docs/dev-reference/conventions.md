# Conventions

This page is a quick-reference guide to naming and code style in Lanternkeeper: Emberfall. When in doubt about how to name something or structure a file, check here first.

---

## File Naming

| File type | Convention | Examples |
|-----------|-----------|---------|
| React components | PascalCase `.tsx` | `HomeScreen.tsx`, `CheckInScreen.tsx` |
| Utilities and libraries | camelCase `.ts` | `storage.ts`, `quests.ts`, `feedback.ts` |
| Hooks | `use-` prefix, kebab-case `.ts` | `use-color-scheme.ts`, `use-theme-color.ts` |

---

## Variable Naming

**General variables:** camelCase

```typescript
const questText = quest.text;
const visitCount = worldState.totalVisits;
```

**Booleans:** prefix with `is`, `has`, or `should`

```typescript
const isLoading = true;
const hasCheckedInToday = false;
const shouldShowFirstLantern = true;
```

**Animated values:** suffix with `Opacity`, `Scale`, or `Value`

```typescript
const fogOpacity = useRef(new Animated.Value(1)).current;
const aetherlingOpacity = useRef(new Animated.Value(0)).current;
const lanternGlow = useRef(new Animated.Value(0)).current;
```

---

## Function Naming

camelCase with a descriptive verb prefix:

| Prefix | Used for | Examples |
|--------|---------|---------|
| `get` | Reading a value | `getRandomQuest()`, `getTodayKey()` |
| `load` | Async reads from storage | `loadWorldState()`, `loadState()` |
| `save` | Async writes to storage | `saveWorldState()` |
| `check` | Evaluating a condition | `checkRegionUnlocks()` |
| `record` | Logging an event | `recordDailyVisit()` |
| `has` | Boolean check | `hasCheckedInToday()` |

---

## Imports

Use the `@/` alias instead of relative paths. `@/` resolves to the project root.

```typescript
// Do this
import { loadWorldState } from '@/lib/storage';
import { Emotion } from '@/src/data/types';

// Not this
import { loadWorldState } from '../../lib/storage';
```

The alias is configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Import order** (within a file):
1. React
2. React Native
3. Expo packages
4. Third-party packages
5. Local imports via `@/`

---

## Components

- Default exports for screen components
- Props interface defined at the top of the file, named `Props`
- Styles via `StyleSheet.create()` at the bottom of the same file

```typescript
interface Props {
  onSelectEmotion: (emotion: Emotion) => void;
  alreadyCheckedIn?: boolean;
}

export default function CheckInScreen({ onSelectEmotion, alreadyCheckedIn }: Props) {
  // ...
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Callback props use the `on` prefix: `onSelectEmotion`, `onComplete`, `onSkip`, `onBack`.

---

## Types

Types are defined in `src/data/types.ts` and imported from there. Do not redefine types inline.

- Use `interface` for object shapes: `Quest`, `DailyLog`, `WorldState`
- Use `type` for union types: `type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright'`
- No `any` — use specific types throughout

```typescript
// Object shape → interface
interface Quest {
  id: string;
  emotion: Emotion;
  text: string;
}

// Union type → type alias
type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright';
```

---

## Comments

- File-level JSDoc comment at the top of every file describing its purpose
- Section separators (`// ----------------------------------------`) to group related code
- Comments explain *why*, not *what* — the code should explain itself

```typescript
/**
 * CheckInScreen
 * Presents the four emotion options to the user
 * Part of the daily check-in flow
 */
```
