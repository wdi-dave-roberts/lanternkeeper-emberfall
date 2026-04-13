/**
 * useHomeScene
 * Owns all scene interaction logic: fog/leaf clearing, pan gesture,
 * door open trigger, panda walk, and fog persistence.
 *
 * The screen passes phase/setPhase/setDialogue and receives back
 * all the state and handlers it needs to render the scene.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { loadFogState, saveFogState } from '@/lib/storage';
import { GAME_CONFIG } from '@/src/config/game';
import { HomePhase } from '@/src/data/types';

// ----------------------------------------
// Scene config type — matches the return of getSceneConfig in index.tsx
// ----------------------------------------
interface FogWisp {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

interface Leaf {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

export interface SceneConfig {
  SCENE_HEIGHT: number;
  FOG_WISPS: FogWisp[];
  LEAVES: Leaf[];
  PATH_POINTS: { x: number; y: number }[];
  DOOR_POSITION: { top: number; left: number };
}

interface UseHomeSceneParams {
  phase: HomePhase;
  setPhase: (phase: HomePhase) => void;
  setDialogue: (text: string) => void;
  setShowDialogue: (show: boolean) => void;
  sceneConfig: SceneConfig;
}

export function useHomeScene({
  phase,
  setPhase,
  setDialogue,
  setShowDialogue,
  sceneConfig,
}: UseHomeSceneParams) {
  const { FOG_WISPS, LEAVES } = sceneConfig;

  const [clearedFog, setClearedFog] = useState<Set<number>>(new Set());
  const [clearedLeaves, setClearedLeaves] = useState<Set<number>>(new Set());

  // Refs for gesture callback — avoids stale closure captures (WR-01)
  const clearedFogRef = useRef(clearedFog);
  clearedFogRef.current = clearedFog;
  const clearedLeavesRef = useRef(clearedLeaves);
  clearedLeavesRef.current = clearedLeaves;
  const [doorOpen, setDoorOpen] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [pandaGone, setPandaGone] = useState(false);

  // ----------------------------------------
  // Mount: restore fog/leaf state from persistence (no-op in reset mode)
  // ----------------------------------------
  useEffect(() => {
    async function restoreFog() {
      const fogState = await loadFogState();
      if (fogState) {
        setClearedFog(new Set(fogState.clearedFogIds));
        setClearedLeaves(new Set(fogState.clearedLeafIds));
      }
    }
    restoreFog();
  }, []);

  // ----------------------------------------
  // When all fog and leaves are cleared, open the door and start the walk
  // ----------------------------------------
  useEffect(() => {
    const allFogCleared = clearedFog.size >= FOG_WISPS.length;
    const allLeavesCleared = clearedLeaves.size >= LEAVES.length;
    const allCleared = allFogCleared && allLeavesCleared;

    if (allCleared && phase.phase === 'clearing') {
      setDialogue('The way is clear!');
      setShowDialogue(true);
      setPhase({ phase: 'transitioning' });

      let walkTimer: ReturnType<typeof setTimeout>;
      const doorTimer = setTimeout(() => {
        setDoorOpen(true);
        walkTimer = setTimeout(() => {
          setIsWalking(true);
          setShowDialogue(false);
        }, GAME_CONFIG.timing.doorOpenToWalkStartMs);
      }, GAME_CONFIG.timing.pathClearedToDoorsOpenMs);

      return () => {
        clearTimeout(doorTimer);
        clearTimeout(walkTimer);
      };
    }
  }, [clearedFog, clearedLeaves, FOG_WISPS.length, LEAVES.length, phase.phase, setDialogue, setPhase, setShowDialogue]);

  // ----------------------------------------
  // Persist fog/leaf clearing state when it changes (no-op in reset mode)
  // ----------------------------------------
  useEffect(() => {
    if (clearedFog.size > 0 || clearedLeaves.size > 0) {
      saveFogState([...clearedFog], [...clearedLeaves]);
    }
  }, [clearedFog, clearedLeaves]);

  // ----------------------------------------
  // Fog cleared — move one wisp of fog off the path
  // ----------------------------------------
  const handleClearFog = useCallback((id: number) => {
    setClearedFog((prev) => {
      if (prev.has(id)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = new Set(prev);
      next.add(id);

      // First fog cleared: hint that the path is opening
      if (next.size === 1) {
        setDialogue('The fog begins to lift...');
      } else if (next.size === FOG_WISPS.length) {
        setDialogue('The fog has cleared.');
      }

      return next;
    });

    // Transition from idle to clearing on first interaction
    if (phase.phase === 'idle') {
      setPhase({ phase: 'clearing' });
    }
  }, [FOG_WISPS.length, phase.phase, setDialogue, setPhase]);

  // ----------------------------------------
  // Leaf cleared — sweep one leaf off the path
  // ----------------------------------------
  const handleClearLeaf = useCallback((id: number) => {
    setClearedLeaves((prev) => {
      if (prev.has(id)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = new Set(prev);
      next.add(id);

      // All leaves cleared but fog still remains — acknowledge progress
      if (next.size === LEAVES.length && clearedFog.size < FOG_WISPS.length) {
        setDialogue('Leaves swept aside.');
      }

      return next;
    });

    // Transition from idle to clearing on first interaction
    if (phase.phase === 'idle') {
      setPhase({ phase: 'clearing' });
    }
  }, [clearedFog.size, LEAVES.length, FOG_WISPS.length, phase.phase, setDialogue, setPhase]);

  // ----------------------------------------
  // Walk complete — Aetherling arrives at the door, ready for check-in
  // ----------------------------------------
  const handleWalkComplete = useCallback(() => {
    setIsWalking(false);
    setPandaGone(true);
    setDialogue('A new day begins.');
    setShowDialogue(true);
    setPhase({ phase: 'check-in' });
  }, [setDialogue, setPhase, setShowDialogue]);

  // ----------------------------------------
  // Pan gesture — detect swipes over fog wisps and leaves
  // Per D-10: pan gesture lives in the hook; screen wraps JSX in GestureDetector
  // ----------------------------------------
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const touchX = event.x;
      const touchY = event.y;

      FOG_WISPS.forEach((wisp) => {
        if (!clearedFogRef.current.has(wisp.id)) {
          const dx = touchX - wisp.x;
          const dy = touchY - wisp.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < wisp.size / 2 + GAME_CONFIG.scene.fogTouchRadiusBuffer) {
            handleClearFog(wisp.id);
          }
        }
      });

      LEAVES.forEach((leaf) => {
        if (!clearedLeavesRef.current.has(leaf.id)) {
          const dx = touchX - leaf.x;
          const dy = touchY - leaf.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < GAME_CONFIG.scene.leafTouchRadius) {
            handleClearLeaf(leaf.id);
          }
        }
      });
    })
    .minDistance(0);

  // ----------------------------------------
  // Reset scene — used by "Walk again" button or when starting fresh
  // ----------------------------------------
  const resetScene = useCallback(() => {
    setClearedFog(new Set());
    setClearedLeaves(new Set());
    setDoorOpen(false);
    setIsWalking(false);
    setPandaGone(false);
  }, []);

  return {
    panGesture,
    clearedFog,
    clearedLeaves,
    doorOpen,
    isWalking,
    pandaGone,
    handleClearFog,
    handleClearLeaf,
    handleWalkComplete,
    resetScene,
  };
}
