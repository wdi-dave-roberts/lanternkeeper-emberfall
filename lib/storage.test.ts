import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveDailyLog, loadDailyLog, saveDailyRitual, getTodayKey } from './storage';
import type { DailyLog, Emotion, Quest } from '@/src/data/types';

describe('DailyLog persistence (round-trip)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  const sampleQuest: Quest = {
    id: 'q-inspired-01',
    emotion: 'inspired',
    text: 'Write one sentence about what you are building.',
  };

  const sampleLog: DailyLog = {
    date: '2026-04-12',
    emotion: 'inspired',
    quest: sampleQuest,
    completed: true,
    completedAt: '2026-04-12T14:00:00.000Z',
  };

  it('saves and retrieves a daily log entry unchanged', async () => {
    await saveDailyLog(sampleLog);
    const retrieved = await loadDailyLog('2026-04-12');
    expect(retrieved).toEqual(sampleLog);
  });

  it('returns null when no log exists for a date', async () => {
    const result = await loadDailyLog('2026-01-01');
    expect(result).toBeNull();
  });

  it('saves and retrieves logs for different dates independently', async () => {
    const log2: DailyLog = {
      date: '2026-04-13',
      emotion: 'stuck',
      quest: { id: 'q-stuck-01', emotion: 'stuck', text: 'Close one browser tab.' },
      completed: true,
      completedAt: '2026-04-13T09:00:00.000Z',
    };

    await saveDailyLog(sampleLog);
    await saveDailyLog(log2);

    const retrieved1 = await loadDailyLog('2026-04-12');
    const retrieved2 = await loadDailyLog('2026-04-13');

    expect(retrieved1).toEqual(sampleLog);
    expect(retrieved2).toEqual(log2);
  });
});

describe('saveDailyRitual', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('creates and persists a complete DailyLog from emotion and quest', async () => {
    const emotion: Emotion = 'frustrated';
    const quest: Quest = {
      id: 'q-frustrated-03',
      emotion: 'frustrated',
      text: 'Step outside for two minutes.',
    };

    const result = await saveDailyRitual(emotion, quest);

    expect(result.emotion).toBe('frustrated');
    expect(result.quest).toEqual(quest);
    expect(result.completed).toBe(true);
    expect(result.completedAt).toBeDefined();
    expect(result.date).toBe(getTodayKey());

    // Verify persistence
    const loaded = await loadDailyLog(result.date);
    expect(loaded).toEqual(result);
  });
});
