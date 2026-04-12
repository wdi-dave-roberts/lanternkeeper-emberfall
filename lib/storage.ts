import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAME_CONFIG } from '@/src/config/game';

const LOG_PREFIX = 'daily-log:';
const FIRST_LANTERN_KEY = 'first-lantern-seen';
const WORLD_STATE_KEY = 'world-state';
const FOG_STATE_KEY = 'fog-cleared-state';

// First Lantern (onboarding)
export async function hasSeenFirstLantern(): Promise<boolean> {
  const value = await AsyncStorage.getItem(FIRST_LANTERN_KEY);
  return value === 'true';
}

export async function markFirstLanternSeen(): Promise<void> {
  await AsyncStorage.setItem(FIRST_LANTERN_KEY, 'true');
}

// World State
export interface WorldState {
  totalDaysVisited: number;
  lastVisitDate: string | null;
  emotionCounts: {
    stuck: number;
    frustrated: number;
    inspired: number;
    alright: number;
  };
  unlockedRegions: string[];
}

const DEFAULT_WORLD_STATE: WorldState = {
  totalDaysVisited: 0,
  lastVisitDate: null,
  emotionCounts: {
    stuck: 0,
    frustrated: 0,
    inspired: 0,
    alright: 0,
  },
  unlockedRegions: [GAME_CONFIG.regionUnlocks.defaultRegion],
};

export async function loadWorldState(): Promise<WorldState> {
  const data = await AsyncStorage.getItem(WORLD_STATE_KEY);
  if (!data) return { ...DEFAULT_WORLD_STATE };
  return JSON.parse(data) as WorldState;
}

export async function saveWorldState(state: WorldState): Promise<void> {
  await AsyncStorage.setItem(WORLD_STATE_KEY, JSON.stringify(state));
}

export async function recordDailyVisit(emotion: string): Promise<WorldState> {
  const state = await loadWorldState();
  const today = getTodayKey();

  // Only count once per day
  if (state.lastVisitDate !== today) {
    state.totalDaysVisited += 1;
    state.lastVisitDate = today;
  }

  // Track emotion
  if (emotion in state.emotionCounts) {
    state.emotionCounts[emotion as keyof typeof state.emotionCounts] += 1;
  }

  // Check for region unlocks
  const unlocks = checkRegionUnlocks(state);
  state.unlockedRegions = [...new Set([...state.unlockedRegions, ...unlocks])];

  await saveWorldState(state);
  return state;
}

function checkRegionUnlocks(state: WorldState): string[] {
  const unlocks: string[] = [];

  if (state.emotionCounts.inspired >= GAME_CONFIG.regionUnlocks.workshopGlade.inspiredCount && !state.unlockedRegions.includes('workshop-glade')) {
    unlocks.push('workshop-glade');
  }
  if (state.emotionCounts.stuck >= GAME_CONFIG.regionUnlocks.fogValley.stuckCount && !state.unlockedRegions.includes('fog-valley')) {
    unlocks.push('fog-valley');
  }
  if (state.emotionCounts.frustrated >= GAME_CONFIG.regionUnlocks.warmRiver.frustratedCount && !state.unlockedRegions.includes('warm-river')) {
    unlocks.push('warm-river');
  }
  if (state.totalDaysVisited >= GAME_CONFIG.regionUnlocks.observatoryBalcony.daysVisited && !state.unlockedRegions.includes('observatory-balcony')) {
    unlocks.push('observatory-balcony');
  }
  if (state.totalDaysVisited >= GAME_CONFIG.regionUnlocks.theLongPath.daysVisited && !state.unlockedRegions.includes('the-long-path')) {
    unlocks.push('the-long-path');
  }

  return unlocks;
}

// Fog persistence state — supports reset, persist, and hybrid modes (see GAME_CONFIG.scene.fogPersistence)
export interface FogState {
  clearedFogIds: number[];
  clearedLeafIds: number[];
  date: string;
}

export async function loadFogState(): Promise<FogState | null> {
  if (GAME_CONFIG.scene.fogPersistence === 'reset') {
    return null; // Reset mode: never load persisted state
  }
  try {
    const raw = await AsyncStorage.getItem(FOG_STATE_KEY);
    if (!raw) return null;
    const state: FogState = JSON.parse(raw);
    if (GAME_CONFIG.scene.fogPersistence === 'hybrid') {
      // Hybrid: only load if same day
      const today = getTodayKey();
      if (state.date !== today) return null;
    }
    return state;
  } catch {
    return null;
  }
}

export async function saveFogState(fogIds: number[], leafIds: number[]): Promise<void> {
  if (GAME_CONFIG.scene.fogPersistence === 'reset') return; // No-op in reset mode
  const state: FogState = {
    clearedFogIds: fogIds,
    clearedLeafIds: leafIds,
    date: getTodayKey(),
  };
  try {
    await AsyncStorage.setItem(FOG_STATE_KEY, JSON.stringify(state));
  } catch {
    // Silent failure — fog persistence is non-critical
  }
}

// Get today's date as YYYY-MM-DD
export function getTodayKey(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Get storage key for a date
function getStorageKey(date: string): string {
  return `${LOG_PREFIX}${date}`;
}

// Save daily log
export async function saveDailyLog(log: DailyLog): Promise<void> {
  const key = getStorageKey(log.date);
  await AsyncStorage.setItem(key, JSON.stringify(log));
}

// Load daily log for a specific date
export async function loadDailyLog(date: string): Promise<DailyLog | null> {
  const key = getStorageKey(date);
  const data = await AsyncStorage.getItem(key);
  if (!data) return null;
  return JSON.parse(data) as DailyLog;
}

// Load today's log (convenience)
export async function loadTodayLog(): Promise<DailyLog> {
  const today = getTodayKey();
  const existing = await loadDailyLog(today);
  return existing ?? { date: today, completedQuests: [] };
}

// Mark a quest as completed for today
export async function completeQuest(questId: string): Promise<DailyLog> {
  const log = await loadTodayLog();
  if (!log.completedQuests.includes(questId)) {
    log.completedQuests.push(questId);
    await saveDailyLog(log);
  }
  return log;
}

