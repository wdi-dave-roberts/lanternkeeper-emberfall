/**
 * Storage
 * Persist data locally using AsyncStorage
 * No cloud. No sync. Just your device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, DailyLog, IdeaSeed } from '../data/types';

// Storage keys
const KEYS = {
  LOGS: '@lanternkeeper_logs',
  SEEDS: '@lanternkeeper_seeds',
  LAST_CHECK_IN: '@lanternkeeper_lastCheckIn',
};

// ----------------------------------------
// Default state
// ----------------------------------------

export function getDefaultState(): AppState {
  return {
    logs: [],
    ideaSeeds: [],
    lastCheckIn: undefined,
  };
}

// ----------------------------------------
// Load all data
// ----------------------------------------

export async function loadState(): Promise<AppState> {
  try {
    const [logsRaw, seedsRaw, lastCheckIn] = await Promise.all([
      AsyncStorage.getItem(KEYS.LOGS),
      AsyncStorage.getItem(KEYS.SEEDS),
      AsyncStorage.getItem(KEYS.LAST_CHECK_IN),
    ]);

    return {
      logs: logsRaw ? JSON.parse(logsRaw) : [],
      ideaSeeds: seedsRaw ? JSON.parse(seedsRaw) : [],
      lastCheckIn: lastCheckIn ?? undefined,
    };
  } catch (error) {
    console.log('Error loading state:', error);
    return getDefaultState();
  }
}

// ----------------------------------------
// Save daily log
// ----------------------------------------

export async function saveLog(log: DailyLog): Promise<void> {
  try {
    const logsRaw = await AsyncStorage.getItem(KEYS.LOGS);
    const logs: DailyLog[] = logsRaw ? JSON.parse(logsRaw) : [];

    // Add new log at the beginning
    const updated = [log, ...logs];

    // Keep only last 100 entries
    const trimmed = updated.slice(0, 100);

    await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(trimmed));
    await AsyncStorage.setItem(KEYS.LAST_CHECK_IN, log.date);
  } catch (error) {
    console.log('Error saving log:', error);
  }
}

// ----------------------------------------
// Save idea seed
// ----------------------------------------

export async function saveSeed(seed: IdeaSeed): Promise<void> {
  try {
    const seedsRaw = await AsyncStorage.getItem(KEYS.SEEDS);
    const seeds: IdeaSeed[] = seedsRaw ? JSON.parse(seedsRaw) : [];

    // Add new seed at the beginning
    const updated = [seed, ...seeds];

    // Keep only last 200 entries
    const trimmed = updated.slice(0, 200);

    await AsyncStorage.setItem(KEYS.SEEDS, JSON.stringify(trimmed));
  } catch (error) {
    console.log('Error saving seed:', error);
  }
}

// ----------------------------------------
// Get today's date as string (YYYY-MM-DD)
// ----------------------------------------

export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ----------------------------------------
// Check if already checked in today
// ----------------------------------------

export function hasCheckedInToday(lastCheckIn: string | undefined): boolean {
  if (!lastCheckIn) return false;
  return lastCheckIn === getTodayDate();
}

// ----------------------------------------
// Clear all data (for testing)
// ----------------------------------------

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.LOGS, KEYS.SEEDS, KEYS.LAST_CHECK_IN]);
  } catch (error) {
    console.log('Error clearing data:', error);
  }
}
