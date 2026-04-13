/**
 * useQuest
 * Owns quest completion and feedback selection.
 * Called when the user taps Done after completing their micro-quest.
 */

import { useCallback } from 'react';
import { completeQuest, getTodayKey } from '@/lib/storage';
import { getRandomFeedback } from '@/src/data/feedback';
import { HomePhase, Quest } from '@/src/data/types';

// Region display names for unlock announcements
const REGION_NAMES: Record<string, string> = {
  'workshop-glade': 'Workshop Glade',
  'fog-valley': 'Fog Valley',
  'warm-river': 'Warm River',
  'observatory-balcony': 'Observatory Balcony',
  'the-long-path': 'The Long Path',
};

interface UseQuestParams {
  phase: HomePhase;
  setPhase: (phase: HomePhase) => void;
  setDialogue: (text: string) => void;
  setShowDialogue: (show: boolean) => void;
  currentQuest: Quest | null;
  newUnlocks: string[];
  clearNewUnlocks: () => void;
}

export function useQuest({
  phase,
  setPhase,
  setDialogue,
  setShowDialogue,
  currentQuest,
  newUnlocks,
  clearNewUnlocks,
}: UseQuestParams) {
  // ----------------------------------------
  // Quest marked done — show Aetherling's response and save the ritual
  // ----------------------------------------
  const onDone = useCallback(async () => {
    // Phase must be 'quest' to call onDone — extract emotion from phase context
    if (phase.phase !== 'quest') return;
    const { emotion } = phase;

    // Pick Aetherling's feedback line for this emotion
    const feedbackLine = getRandomFeedback(emotion);

    // If a new region unlocked, announce it first before the feedback line
    if (newUnlocks.length > 0) {
      const regionKey = newUnlocks[0];
      const regionName = REGION_NAMES[regionKey] ?? regionKey;
      setDialogue(`New region: ${regionName}`);
      clearNewUnlocks();
    } else {
      setDialogue(feedbackLine);
    }

    setShowDialogue(true);

    // Storage write: mark today's quest as complete
    const questId = `${getTodayKey()}-${emotion}`;
    await completeQuest(questId);

    // Advance to feedback phase, carrying emotion and feedback line
    setPhase({ phase: 'feedback', emotion, line: feedbackLine });
  }, [phase, newUnlocks, clearNewUnlocks, setDialogue, setShowDialogue, setPhase]);

  return {
    onDone,
  };
}
