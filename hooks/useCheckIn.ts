/**
 * useCheckIn
 * Owns emotion selection and daily visit recording.
 * Called when the user picks how they are feeling after Aetherling arrives.
 */

import { useCallback, useState } from 'react';
import { recordDailyVisit } from '@/lib/storage';
import { getRandomQuest } from '@/src/data/quests';
import { HomePhase, Emotion, Quest } from '@/src/data/types';
import { WorldState } from '@/lib/storage';

interface UseCheckInParams {
  setPhase: (phase: HomePhase) => void;
  setShowDialogue: (show: boolean) => void;
  worldState: WorldState | null;
  setWorldState: (state: WorldState) => void;
}

export function useCheckIn({
  setPhase,
  setShowDialogue,
  worldState,
  setWorldState,
}: UseCheckInParams) {
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);

  // ----------------------------------------
  // User chose how they are feeling — record the visit and pick a quest
  // ----------------------------------------
  const onSelectEmotion = useCallback(async (emotion: Emotion) => {
    // Record previous regions so we can detect newly unlocked ones
    const previousRegions = worldState?.unlockedRegions ?? ['lantern-clearing'];

    // Storage write: record today's visit and emotion count
    const updatedState = await recordDailyVisit(emotion);
    setWorldState(updatedState);

    // Pick a quest appropriate for this emotion
    const questObj = getRandomQuest(emotion);
    setCurrentQuest(questObj);

    // Detect any regions that unlocked from this visit
    const newlyUnlocked = updatedState.unlockedRegions.filter(
      (r) => !previousRegions.includes(r)
    );
    if (newlyUnlocked.length > 0) {
      setNewUnlocks(newlyUnlocked);
    }

    // Hide dialogue during transition — quest screen shows the quest text
    setShowDialogue(false);

    // Advance to quest phase, carrying emotion and quest text
    setPhase({ phase: 'quest', emotion, quest: questObj.text });
  }, [worldState, setWorldState, setPhase, setShowDialogue]);

  const clearNewUnlocks = useCallback(() => {
    setNewUnlocks([]);
  }, []);

  return {
    onSelectEmotion,
    newUnlocks,
    clearNewUnlocks,
    currentQuest,
  };
}
