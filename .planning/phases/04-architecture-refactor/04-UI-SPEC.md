---
phase: 4
slug: architecture-refactor
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-13
platform: react-native
note: "Preservation contract — Phase 4 is a refactor. Visual output must not change. CHECKER NOTE: Standard maximums for typography sizes (4) and spacing multiples-of-4 apply to new design specs only. This contract documents existing production values that are locked as-is."
---

# Phase 4 — UI Design Contract

> **PRESERVATION CONTRACT — NOT A NEW DESIGN SPEC**
>
> This contract documents what MUST stay the same when FogWisp, Leaf, and scene
> components are extracted. It captures existing production values verbatim from
> `app/(tabs)/index.tsx`. Checker maximums (e.g. 4-size typography limit,
> multiples-of-4 spacing rule) constrain NEW design decisions — they do not
> invalidate existing production values recorded here. Executor and auditor use
> this as the locked reference. Nothing in this file may be changed during the
> refactor unless a decision is explicitly re-opened.

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | none | React Native StyleSheet (not Tailwind, not shadcn) |
| Component library | none | Hand-rolled with `StyleSheet.create()` — no third-party UI lib |
| Animation library | react-native-reanimated ~4.1.1 + Animated API | CLAUDE.md tech stack |
| Gesture library | react-native-gesture-handler ~2.28.0 | CLAUDE.md tech stack |
| Icon library | @expo/vector-icons ^15.0.3 | CLAUDE.md tech stack — not used on home screen |
| Font | Platform system font (ios: ui-serif for content, system-ui elsewhere) | constants/theme.ts |
| Registry | not applicable | React Native — no shadcn registry |

---

## Spacing Scale

Declared values extracted from `app/(tabs)/index.tsx` styles (lines 941-1296).
All values are multiples of 4 except where noted as preservation-contract exceptions.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Star border radius, dot spacing (gap: 6) |
| sm | 8px | Section label margin-bottom, day count margin-bottom |
| md | 16px | UI zone paddingVertical, sectionLabel margin-bottom |
| lg | 24px | Ritual paddingHorizontal, quest card paddingHorizontal, progress dots gap |
| xl | 32px | Done button paddingHorizontal |
| 2xl | 48px | Not in current use |
| 3xl | 64px | Aetherling body width/height |

Exceptions — PRESERVATION-CONTRACT EXCEPTIONS (existing production values, must not change during refactor):

- `uiZone` paddingHorizontal: 20px — existing production value, preserve as-is
- `leafTouchArea` padding: **15px** — existing production touch target value. This is NOT a multiple of 4, and that is intentional. The value predates this spec and must not be altered during refactor. The multiples-of-4 rule constrains new spacing additions only; it does not require changing existing touch target measurements.
- `speechBubble` paddingVertical: 12px — existing production value, preserve as-is
- `speechBubble` paddingHorizontal: 20px — existing production value, preserve as-is

**Rule for this refactor:** No new spacing values may be introduced. If a new spacing need arises, use the nearest declared scale token above.

---

## Typography

> **PRESERVATION-CONTRACT NOTE — 6 SIZES ARE EXISTING PRODUCTION VALUES**
>
> This section records 6 font sizes (10, 11, 12, 13, 14, 15) extracted verbatim
> from the current production StyleSheet. The standard 4-size maximum applies to
> new design specs. This preservation contract is capturing existing code, not
> specifying new typography. No new font sizes may be introduced during the
> refactor. The 6 sizes below are locked as-is.

All fonts use React Native system font stack (no custom font loaded on home screen).
All sizes extracted verbatim from `StyleSheet.create()` in `app/(tabs)/index.tsx`.

| Role | Size | Weight | Line Height | Current Usage |
|------|------|--------|-------------|---------------|
| Hint / label-caps | 10px | normal (400) | default | `progressLabel` (uppercase, letterSpacing: 1) |
| Caption / meta | 11px | normal (400) | default | `sectionLabel` (uppercase, letterSpacing: 1.5), `dayCount` (uppercase, letterSpacing: 2), `restBtnText` |
| Body / small | 12px | normal (400) | default | `hintText` |
| Body | 13px | normal (400) | default | `emotionText`, `doneBtnText` (letterSpacing: 0.5), `waitingText` (italic) |
| Body / content | 14px | normal (400) | default | `alreadyCheckedIn` (italic) |
| Body / primary | 15px | normal (400) | 22 | `speechText` (italic), `questText` |

Note: React Native does not use px in the CSS sense — these are density-independent points (dp). All values are preserved as-is.

Two weights in use:
- `normal` (400) — all body and label text
- italic style on `speechText`, `questText`-adjacent, `alreadyCheckedIn`, `waitingText` — this is `fontStyle: 'italic'`, not a weight change

---

## Color

The app uses a fixed dark EmberTheme. All values extracted from `app/(tabs)/index.tsx` StyleSheet and gradient definition.

| Role | Value | Usage |
|------|-------|-------|
| Dominant background (60%) | `#0a0f1a` | `container` backgroundColor, gradient start/end |
| Scene overlay (30%) | `#1a1a2e` | LinearGradient midpoint (deep blue-black) |
| Accent warm (10%) | `rgba(255, 200, 150, var)` | Speech bubble border, hint text, progress dots, section labels, emotion chip borders, done button border/bg — all at low opacity (0.1–0.4) |
| Accent glow | `rgba(255, 200, 100, 0.15)` | Door glow halo — reserved for door open event only |

Accent `rgba(255, 200, 150, _)` reserved for:
- Section label text
- Hint text
- Progress dot fill and empty states
- Emotion chip border
- Done button background and border
- Day count text
- Rest button text
- Waiting text

This accent color is never full opacity — it ranges from 0.08 (quest card border) to 0.6 (filled progress dot). The low-opacity treatment is intentional and must be preserved.

### Scene Element Colors (locked — do not change during refactor)

| Element | Color |
|---------|-------|
| Stars | `#fff` at 0.3–0.8 opacity |
| Path segments | `rgba(139, 119, 101, 0.25)` |
| Fog wisps | `rgba(180, 200, 220, 0.12)` |
| Leaf body | `#8B6914` |
| Leaf stem | `#5D4A1A` |
| Door frame | bg `#2a1f1a`, border `#4a3a2a` |
| Door panel | `#3d2d1d`, border `#5a4a3a` |
| Door arch | `#4a3a2a` |
| Door handle | `#8B7355` |
| Door inner | `#0a0808` |
| Door light | `rgba(255, 220, 150, 0.3)` |
| Aetherling body | `#8B4513` |
| Aetherling ears | `#A0522D`, border `#CD853F` |
| Aetherling face | `#DEB887` |
| Aetherling eyes/nose | `#1a0a00` |

### Text Colors (locked)

| Element | Color |
|---------|-------|
| Speech text | `rgba(255, 248, 240, 0.85)` |
| Quest text | `rgba(255, 248, 240, 0.75)` |
| Emotion text | `rgba(255, 248, 240, 0.6)` |
| Already checked-in text | `rgba(255, 248, 240, 0.5)` |

### Ritual Panel Backgrounds (locked)

| Element | Color |
|---------|-------|
| Speech bubble bg | `rgba(255, 250, 240, 0.1)` |
| Quest card bg | `rgba(255, 255, 255, 0.03)` |
| Emotion chip bg | `rgba(255, 255, 255, 0.04)` |
| Done button bg | `rgba(255, 200, 150, 0.1)` |

Destructive: not applicable — no destructive actions in Phase 4 or on the home screen.

---

## Copywriting Contract

All dialogue strings are locked — they are Aetherling's voice and must not change during refactor.
Source: `app/(tabs)/index.tsx` inline strings. After D-12 (CONTEXT.md), these move to `src/data/` imports but the text values stay identical.

| State / Trigger | Copy |
|----------------|------|
| Initial load (fog present) | "The path is blocked..." |
| First fog wisp cleared | "The fog begins to lift..." |
| All fog cleared | "The fog has cleared." |
| Leaves cleared (fog still present) | "Leaves swept aside." |
| All cleared (path open) | "The way is clear!" |
| Walk complete | "A new day begins." |
| Return visit (already checked in) | "Welcome back, Lanternkeeper." |
| Quest done — new region unlocked | "New region: {Region Name}" |
| Already walked today (rest state) | "You've walked the path today." |
| Waiting hint (nothing cleared yet) | "Swipe to clear the path" |
| Waiting hint (partially cleared) | "Keep clearing the path..." |
| Waiting panel text | "Clear the path to continue" |
| Quest section label | "Today's small thing" |
| Emotion section label | "How are you feeling?" |
| Primary CTA (quest complete) | "Done" |
| Secondary action (reset) | "Walk again" |

Emotion labels (locked — these display in emotion chips):

| Emotion | Label |
|---------|-------|
| stuck | "Stuck" |
| frustrated | "Frustrated" |
| inspired | "Inspired" |
| alright | "Alright" |

Region name display strings (locked — shown on unlock):

| Region key | Display name |
|------------|-------------|
| workshop-glade | "Workshop Glade" |
| fog-valley | "Fog Valley" |
| warm-river | "Warm River" |
| observatory-balcony | "Observatory Balcony" |
| the-long-path | "The Long Path" |

Empty states: The home screen has no empty state in the traditional sense. The `idle` phase IS the default state (fog present, Aetherling present). The "no data" condition is handled by `getDefaultState()` in storage, which returns sensible defaults before any check-ins.

Error states: The home screen does not surface storage errors to the user — `loadState()` fails silently and returns defaults. This behavior must be preserved during refactor.

---

## Layout Contract

Three vertical zones — locked proportions.

| Zone | Style | Must Preserve |
|------|-------|---------------|
| Scene | `height: SCENE_HEIGHT` (45% of screen height via `GAME_CONFIG.scene.heightRatio`) | GestureDetector wraps entire scene view |
| UI Zone | `minHeight: 100`, `paddingVertical: 16`, `paddingHorizontal: 20`, centered content | Speech bubble + progress hints live here |
| Ritual Panel | `flex: 1`, `paddingHorizontal: 24`, `paddingTop: 8`, `paddingBottom: insets.bottom + 20` | Emotion chips, quest card, done button live here |

Primary visual anchor: Aetherling/RedPanda component (zIndex 50, center of scene).

Scene children render order (z-index, bottom to top):
1. LinearGradient (absoluteFill)
2. Stars (no zIndex — natural stacking)
3. Path segments (no zIndex)
4. Door (no zIndex)
5. FogWisp components (zIndex: 20)
6. Leaf components (zIndex: 25)
7. RedPanda / Aetherling (zIndex: 50)

This render order must be preserved when components are extracted to `src/components/scene/`.

---

## Component Extraction Contract

Phase 4 extracts these components to `src/components/scene/`. Their prop interfaces are locked.

### FogWisp (extracted to `src/components/scene/FogWisp.tsx`)

```typescript
interface FogWispProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}
```

Internal animation state: `opacity`, `scale`, `translateY` (Animated.Value). Reads `GAME_CONFIG.animation.fogClearDurationMs`, `fogClearScale`, `fogClearLiftPx` directly.

### Leaf (extracted to `src/components/scene/Leaf.tsx`)

```typescript
interface LeafProps {
  x: number;
  y: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}
```

Internal animation state: `opacity`, `translateX`, `translateY`, `spin` (Animated.Value). Reads `GAME_CONFIG.animation.leafClearDurationMs`, `leafClearHorizontalMin/Max`, `leafClearVerticalMin/Max` directly.

### RedPanda (may stay in home screen file or extract — visual contract locked either way)

```typescript
interface RedPandaProps {
  isWalking: boolean;
  onWalkComplete: () => void;
  pathPoints: { x: number; y: number }[];
}
```

Walk bobble: 150ms per half-cycle. Per-segment duration: 600ms (intermediate), 400ms (final approach). Fade out: 300ms.

### Door (may stay in home screen file or extract)

```typescript
interface DoorProps {
  isOpen: boolean;
}
```

Open animation: doorRotation 0 → -70deg over 500ms (Easing.out), glowOpacity 0 → 1 over 400ms.

### SpeechBubble (may stay in home screen file or extract)

```typescript
interface SpeechBubbleProps {
  text: string;
  visible: boolean;
}
```

Fade in: 400ms. Fade out: 200ms. On text change: reset opacity to 0 before fading in.

---

## Animation Timing Reference

Extracted from `GAME_CONFIG` — do not hardcode these values, always read from config.

| Interaction | Duration | Config Key |
|-------------|----------|------------|
| Fog wisp cleared | 600ms | `GAME_CONFIG.animation.fogClearDurationMs` |
| Fog lift distance | 40px | `GAME_CONFIG.animation.fogClearLiftPx` |
| Fog clear scale | 1.5x | `GAME_CONFIG.animation.fogClearScale` |
| Leaf cleared | 800ms | `GAME_CONFIG.animation.leafClearDurationMs` |
| Door open rotation | 500ms | hardcoded in Door component |
| Door glow fade | 400ms | hardcoded in Door component |
| Path cleared → door opens | 800ms | `GAME_CONFIG.timing.pathClearedToDoorsOpenMs` |
| Door opens → walk starts | 600ms | `GAME_CONFIG.timing.doorOpenToWalkStartMs` |
| Speech bubble fade in | 400ms | hardcoded in SpeechBubble |
| Speech bubble fade out | 200ms | hardcoded in SpeechBubble |

---

## State Machine Contract

Discriminated union (CONTEXT.md D-01, D-02, D-03). These are the locked phase names and their contextual data.

```typescript
type HomePhase =
  | { phase: 'idle' }
  | { phase: 'clearing' }
  | { phase: 'transitioning' }
  | { phase: 'check-in' }
  | { phase: 'quest'; emotion: Emotion; quest: string }
  | { phase: 'feedback'; emotion: Emotion; line: string }
  | { phase: 'complete' }
  | { phase: 'returning' }
```

Phase transitions (mapped from current boolean flag logic):

| From | To | Trigger |
|------|----|---------|
| `idle` | `clearing` | User swipes first fog/leaf |
| `clearing` | `transitioning` | All fog + leaves cleared |
| `transitioning` | `check-in` | Walk complete + panda gone |
| `check-in` | `quest` | User selects emotion |
| `quest` | `feedback` | User taps "Done" |
| `feedback` | `complete` | Feedback displayed |
| `idle` | `returning` | `lastVisitDate === today` on mount |

Dialogue text per phase transition: set by hooks via `setDialogue` callback (CONTEXT.md D-06).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable — React Native project |
| Third-party | none | not applicable |

React Native projects do not use shadcn registries. Component isolation in Phase 4 is file-level extraction, not registry installation.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PRESERVATION CONTRACT — 6 sizes are existing production values locked as-is; no new sizes permitted
- [ ] Dimension 5 Spacing: PRESERVATION CONTRACT — 15px leafTouchArea is an existing production touch target locked as-is; multiples-of-4 applies to new additions only
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

*Phase: 04-architecture-refactor*
*Contract compiled: 2026-04-13*
*Revised: 2026-04-12 — checker exceptions added for typography (6 production sizes) and spacing (15px touch target)*
*Source of truth: `app/(tabs)/index.tsx` lines 941–1296 (StyleSheet) + CONTEXT.md decisions*
