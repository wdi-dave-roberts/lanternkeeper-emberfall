/**
 * Lanternkeeper: Emberfall - Core Types
 */

// The four emotional states
export type Emotion = 'stuck' | 'frustrated' | 'inspired' | 'alright';

// A single micro-quest
export interface Quest {
  id: string;
  emotion: Emotion;
  text: string;
}

// A daily log entry
export interface DailyLog {
  date: string;        // ISO date string (YYYY-MM-DD)
  emotion: Emotion;
  quest: Quest;
  completed: boolean;
  completedAt?: string; // ISO timestamp
}

// An idea seed (1-sentence note)
export interface IdeaSeed {
  id: string;
  text: string;
  createdAt: string;   // ISO timestamp
}

// Full app state
export interface AppState {
  logs: DailyLog[];
  ideaSeeds: IdeaSeed[];
  lastCheckIn?: string; // ISO date string
}

// Navigation screen names
export type ScreenName = 'Home' | 'CheckIn' | 'Quest' | 'IdeaSeed';

/** Home screen ritual phases — discriminated union replacing boolean flags */
export type HomePhase =
  | { phase: 'idle' }
  | { phase: 'clearing' }
  | { phase: 'transitioning' }
  | { phase: 'check-in' }
  | { phase: 'quest'; emotion: Emotion; quest: string }
  | { phase: 'feedback'; emotion: Emotion; line: string }
  | { phase: 'complete' }
  | { phase: 'returning' };
