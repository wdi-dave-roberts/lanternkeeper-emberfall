/**
 * Game Configuration
 * All tunable game parameters in one place.
 * Change values here — do not change game logic files.
 *
 * Allie: You can adjust any number in this file to change how the game
 * feels. Save the file and reload the app to see your changes.
 */

export const GAME_CONFIG = {
  /** Region unlock thresholds — how many emotion check-ins or days before a region opens */
  regionUnlocks: {
    defaultRegion: 'lantern-clearing',
    workshopGlade: { inspiredCount: 3 },
    fogValley: { stuckCount: 3 },
    warmRiver: { frustratedCount: 3 },
    observatoryBalcony: { daysVisited: 7 },
    theLongPath: { daysVisited: 14 },
  },

  /** Scene layout — how big the scene is and where things go */
  scene: {
    heightRatio: 0.45,
    safeOffsetMultiplier: 0.20,
    fogWispCount: 3,
    leafCount: 3,
    fogWispSizes: [65, 60, 55] as const,
    leafTouchRadius: 40,
    fogTouchRadiusBuffer: 25,
    /**
     * Fog persistence mode:
     * - 'reset': Every visit starts with fresh fog (current default)
     * - 'persist': Cleared fog stays cleared across sessions
     * - 'hybrid': Fog resets daily but with lighter opacity showing past clearing
     */
    fogPersistence: 'reset' as 'reset' | 'persist' | 'hybrid',
  },

  /** Animation feel — durations and distances for fog/leaf clearing */
  animation: {
    fogClearDurationMs: 600,
    fogClearLiftPx: 40,
    fogClearScale: 1.5,
    leafClearDurationMs: 800,
    leafClearHorizontalMin: 60,
    leafClearHorizontalMax: 100,
    leafClearVerticalMin: 60,
    leafClearVerticalMax: 90,
  },

  /** Timing — pauses between scene transitions */
  timing: {
    pathClearedToDoorsOpenMs: 800,
    doorOpenToWalkStartMs: 600,
  },
} as const;

/** Type helper for accessing config sections */
export type GameConfig = typeof GAME_CONFIG;

/**
 * CONVENTION: All game-feel numbers belong in this file.
 * Do not add magic numbers to logic files — add them here with a JSDoc comment.
 * Enforcement: Future phases will add a lint rule. For now, this is a team convention.
 */
