# Phase 3: Storage & Data Integrity - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Consolidate duplicate storage layers into a single trustworthy source, fix the DailyLog schema mismatch, remove calculateStreak(), write round-trip unit tests, and fix Emotion type duplication. No gameplay behavior changes — the app works the same, but the data layer is clean and tested.

</domain>

<decisions>
## Implementation Decisions

### DailyLog Schema Resolution
- **D-01:** Rich schema wins. The canonical DailyLog is: `{ date, emotion, quest, completed, completedAt }` — full emotional context preserved per ritual entry
- **D-02:** DailyLog is defined once in `src/data/types.ts` (the existing richer version). The simpler `{ date, completedQuests[] }` interface in `lib/storage.ts` is replaced
- **D-03:** All storage read/write functions updated to use the rich schema. The storage key pattern (`daily-log:YYYY-MM-DD`) can stay or change — Claude's discretion on storage key design

### Data Migration Strategy
- **D-04:** Fresh start — no migration code. Old AsyncStorage keys from both storage layers are orphaned (harmless). This is a pre-release app with no real user data at risk
- **D-05:** No explicit clear/reset of old keys. They sit inert in AsyncStorage until the user clears app data. Simplest approach

### Storage Consolidation
- **D-06:** `lib/storage.ts` is the surviving storage file. `src/storage/storage.ts` is deleted entirely
- **D-07:** `App.tsx` imports from `src/storage/storage.ts` — if App.tsx is dead code (Expo Router uses `app/` directory), delete it too. If it's still active, update imports to `lib/storage.ts`
- **D-08:** All types that were defined in `src/storage/storage.ts` (AppState, IdeaSeed) — evaluate if they're used anywhere. If dead, delete. If alive, move to `src/data/types.ts`

### Streak Removal
- **D-09:** Delete `calculateStreak()` from `lib/storage.ts`. Confirmed as design pillar violation in Phase 2 audit. No replacement — streaks are an anti-feature

### Emotion Type Deduplication
- **D-10:** Emotion type defined once in `src/data/types.ts`. The duplicate `type Emotion = ...` in `app/(tabs)/index.tsx` (line 28) is replaced with an import from `src/data/types.ts`

### Test Infrastructure
- **D-11:** Full test foundation installed: Jest + `@react-native-async-storage/async-storage` mock + `@testing-library/react-native` + `react-test-renderer`. Config written for all
- **D-12:** Only storage layer tests written in this phase (STOR-04: round-trip daily log persistence). Phase 4+ uses the foundation for hook and component tests
- **D-13:** Test file location follows Jest convention: `__tests__/` directory or co-located `.test.ts` files — Claude's discretion on which pattern fits better

### Claude's Discretion
- Storage key design (keep `daily-log:YYYY-MM-DD` pattern or restructure)
- Internal structure of the consolidated `lib/storage.ts` (function grouping, documentation)
- Test file organization pattern (`__tests__/` vs co-located)
- Whether App.tsx is dead code (determine from Expo Router setup and delete if so)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Storage Files (current state — consolidation targets)
- `lib/storage.ts` — Surviving storage layer. Contains WorldState, DailyLog (simple), fog persistence, calculateStreak() (to delete), region unlock logic
- `src/storage/storage.ts` — Dead storage layer to delete. Contains AppState, loadState(), saveSeed(), clearAllData()
- `src/data/types.ts` — Canonical type definitions including the rich DailyLog schema that becomes the standard

### Consumers (files that import from storage)
- `app/(tabs)/index.tsx` — Primary consumer of lib/storage.ts. Also has duplicate Emotion type on line 28
- `app/(tabs)/explore.tsx` — Imports loadWorldState, WorldState from lib/storage
- `app/first-lantern.tsx` — Imports markFirstLanternSeen from lib/storage
- `app/index.tsx` — Imports hasSeenFirstLantern from lib/storage
- `App.tsx` — Imports from src/storage/storage.ts (likely dead code)

### Config (Phase 2 output — storage reads from here)
- `src/config/game.ts` — GAME_CONFIG with region unlock thresholds, fog persistence mode. Already imported by lib/storage.ts

### Codebase Analysis
- `.planning/codebase/CONCERNS.md` — Documents all storage issues: duplicate layers, schema mismatch, dead code, missing tests, silent error handling
- `.planning/codebase/ARCHITECTURE.md` — Current architecture patterns
- `.planning/codebase/TESTING.md` — Current test infrastructure state (none)

### Design Constraints
- `.planning/REQUIREMENTS.md` — STOR-01 through STOR-05 requirements. Also documents "Emotion history charts" as out of scope (relevant to DailyLog schema decision)
- `.planning/PROJECT.md` — Design pillars, "no streaks" anti-feature

### Prior Phase Context
- `.planning/phases/02-game-mechanics-audit/02-CONTEXT.md` — D-07 through D-10 cover config extraction. calculateStreak() flagged as pillar violation (D-08 area). Fog persistence modes documented (D-11, D-12)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/data/types.ts` — Already has the rich DailyLog interface that becomes the standard
- `src/config/game.ts` — GAME_CONFIG already imported by lib/storage.ts (Phase 2 output)
- Fog persistence functions (`loadFogState`, `saveFogState`) already added to lib/storage.ts in Phase 2

### Established Patterns
- AsyncStorage wrapper pattern: typed interfaces, JSON serialize/deserialize, try-catch with silent fallback
- Key prefixing: `daily-log:` prefix for per-day entries, plain keys for singletons (`world-state`, `first-lantern-seen`, `fog-cleared-state`)
- Config import pattern: `import { GAME_CONFIG } from '@/src/config/game'` — storage already uses this

### Integration Points
- `app/(tabs)/index.tsx` is the primary consumer — all storage function calls originate here
- Expo Router file-based routing means `app/` directory is the active entry point (App.tsx likely dead)
- No existing test infrastructure — Jest config, mocks, and test utilities are all net-new

</code_context>

<specifics>
## Specific Ideas

- Rich DailyLog schema was chosen deliberately despite the emotion tracking anti-feature concern — the protection against misuse comes from design pillars and Allie understanding why, not from schema shape
- Fresh start (no migration) was chosen because this is pre-release — don't write migration code that will never run in production
- Full test foundation installed now so Phase 4 (architecture refactor with hooks) doesn't need to re-setup — but only storage tests are written in this phase

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-storage-data-integrity*
*Context gathered: 2026-04-12*
