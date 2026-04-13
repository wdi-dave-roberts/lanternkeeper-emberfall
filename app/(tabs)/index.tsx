/**
 * HomeScreen
 * Orchestrates the Emberfall ritual loop.
 * Logic lives in hooks. Rendering lives in scene components. This file connects them.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FogWisp } from '@/src/components/scene/FogWisp';
import { Leaf } from '@/src/components/scene/Leaf';
import { Door } from '@/src/components/scene/Door';
import { RedPanda } from '@/src/components/scene/RedPanda';
import { SpeechBubble } from '@/src/components/scene/SpeechBubble';
import { useHomeScene } from '@/hooks/useHomeScene';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useQuest } from '@/hooks/useQuest';
import type { HomePhase, Emotion } from '@/src/data/types';
import { getTodayKey, loadTodayLog, loadWorldState, type WorldState } from '@/lib/storage';
import { GAME_CONFIG } from '@/src/config/game';

// ----------------------------------------
// Scene layout: positions fog, leaves, path, and door based on screen size.
// Stays in screen because it is rendering-only geometry, not game logic.
// ----------------------------------------
function getSceneConfig(width: number, height: number, topInset: number) {
  const SCENE_HEIGHT = height * GAME_CONFIG.scene.heightRatio;
  const SAFE_OFFSET = topInset + SCENE_HEIGHT * GAME_CONFIG.scene.safeOffsetMultiplier;
  const [fogSize1, fogSize2, fogSize3] = GAME_CONFIG.scene.fogWispSizes;

  return {
    SCENE_HEIGHT,
    PATH_POINTS: [
      { x: width * 0.5,  y: SAFE_OFFSET + SCENE_HEIGHT * 0.55 },
      { x: width * 0.28, y: SAFE_OFFSET + SCENE_HEIGHT * 0.45 },
      { x: width * 0.68, y: SAFE_OFFSET + SCENE_HEIGHT * 0.35 },
      { x: width * 0.32, y: SAFE_OFFSET + SCENE_HEIGHT * 0.25 },
      { x: width * 0.5,  y: SAFE_OFFSET + SCENE_HEIGHT * 0.15 },
      { x: width * 0.5,  y: SAFE_OFFSET + SCENE_HEIGHT * 0.08 },
    ],
    FOG_WISPS: [
      { id: 1, x: width * 0.30, y: SAFE_OFFSET + SCENE_HEIGHT * 0.40, size: fogSize1, rotation: -5 },
      { id: 2, x: width * 0.65, y: SAFE_OFFSET + SCENE_HEIGHT * 0.30, size: fogSize2, rotation: 8 },
      { id: 3, x: width * 0.38, y: SAFE_OFFSET + SCENE_HEIGHT * 0.22, size: fogSize3, rotation: -3 },
    ],
    LEAVES: [
      { id: 1, x: width * 0.35, y: SAFE_OFFSET + SCENE_HEIGHT * 0.48, rotation: 45 },
      { id: 2, x: width * 0.60, y: SAFE_OFFSET + SCENE_HEIGHT * 0.35, rotation: -30 },
      { id: 3, x: width * 0.32, y: SAFE_OFFSET + SCENE_HEIGHT * 0.27, rotation: 60 },
    ],
    DOOR_POSITION: {
      top: SAFE_OFFSET,
      left: width * 0.5 - 35,
    },
  };
}

// Display labels for emotion chips — rendering concern, stays in screen
const EMOTION_LABELS: Record<Emotion, string> = {
  stuck: 'Stuck',
  frustrated: 'Frustrated',
  inspired: 'Inspired',
  alright: 'Alright',
};

// ----------------------------------------
// HomeScreen — composes hooks and scene components into the ritual flow
// ----------------------------------------
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const sceneConfig = useMemo(
    () => getSceneConfig(width, height, insets.top),
    [width, height, insets.top]
  );
  const { SCENE_HEIGHT, PATH_POINTS, FOG_WISPS, LEAVES, DOOR_POSITION } = sceneConfig;

  // -- Phase state machine (replaces 14 boolean flags) --
  const [phase, setPhase] = useState<HomePhase>({ phase: 'idle' });
  const [dialogue, setDialogue] = useState('The path is blocked...');
  const [showDialogue, setShowDialogue] = useState(true);
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  // -- Load world state on mount — screen owns the load, hooks receive it --
  useEffect(() => {
    async function init() {
      const [state, todayLog] = await Promise.all([loadWorldState(), loadTodayLog()]);
      setWorldState(state);

      const today = getTodayKey();
      if (state.lastVisitDate === today) {
        // Return visit: already walked the path today
        const message = todayLog.completedQuests.length > 0
          ? 'Welcome back, Lanternkeeper.'
          : 'The path awaits.';
        setDialogue(message);
        setPhase({ phase: 'returning' });
      }
    }
    init();
  }, []);

  // -- Scene: fog clearing, leaf sweeping, door opening, panda walking --
  const scene = useHomeScene({ phase, setPhase, setDialogue, setShowDialogue, sceneConfig });

  // -- Ritual: emotion check-in -> quest -> feedback -> complete --
  const checkIn = useCheckIn({ setPhase, setShowDialogue, worldState, setWorldState });
  const quest = useQuest({
    phase,
    setPhase,
    setDialogue,
    setShowDialogue,
    currentQuest: checkIn.currentQuest,
    newUnlocks: checkIn.newUnlocks,
    clearNewUnlocks: checkIn.clearNewUnlocks,
  });

  // -- Reset: clears scene and phase back to start --
  const handleReset = useCallback(() => {
    scene.resetScene();
    setPhase({ phase: 'idle' });
    setDialogue('The path is blocked...');
    setShowDialogue(true);
  }, [scene]);

  // -- Return visit: scene shows completed state (all cleared, door open, panda gone) --
  const isReturning = phase.phase === 'returning';
  const showDoorOpen = scene.doorOpen || isReturning;
  const showPandaGone = scene.pandaGone || isReturning;

  // -- Memoize star positions so they don't flicker on re-render --
  const stars = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random(),
      top: Math.random() * 0.3,
      opacity: 0.3 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  // -- Phase-based panel visibility --
  const isCheckIn = phase.phase === 'check-in';
  const isQuest = phase.phase === 'quest';
  const isFeedbackOrComplete = phase.phase === 'feedback' || phase.phase === 'complete';
  const isClearing = !showDoorOpen && !scene.isWalking;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0f1a', '#1a1a2e', '#0a0f1a']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* === SCENE: gradient -> stars -> path -> door -> fog -> leaves -> panda === */}
      <GestureDetector gesture={scene.panGesture}>
        <View style={[styles.scene, { height: SCENE_HEIGHT }]}>
          {stars.map((star) => (
            <View
              key={star.id}
              style={[
                styles.star,
                { left: star.left * width, top: star.top * SCENE_HEIGHT, opacity: star.opacity, width: star.size, height: star.size },
              ]}
            />
          ))}

          <View style={styles.pathContainer}>
            {PATH_POINTS.slice(0, -1).map((point, i) => {
              const nextPoint = PATH_POINTS[i + 1];
              const dx = nextPoint.x - point.x;
              const dy = nextPoint.y - point.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return (
                <View
                  key={i}
                  style={[styles.pathSegment, { left: point.x, top: point.y, width: length, transform: [{ rotate: `${angle}deg` }] }]}
                />
              );
            })}
          </View>

          <View style={[styles.doorPosition, { top: DOOR_POSITION.top, left: DOOR_POSITION.left }]}>
            <Door isOpen={showDoorOpen} />
          </View>

          {FOG_WISPS.map((wisp) => (
            <FogWisp
              key={wisp.id}
              x={wisp.x}
              y={wisp.y}
              size={wisp.size}
              rotation={wisp.rotation}
              cleared={scene.clearedFog.has(wisp.id) || isReturning}
              onClear={() => scene.handleClearFog(wisp.id)}
            />
          ))}

          {LEAVES.map((leaf) => (
            <Leaf
              key={leaf.id}
              x={leaf.x}
              y={leaf.y}
              rotation={leaf.rotation}
              cleared={scene.clearedLeaves.has(leaf.id) || isReturning}
              onClear={() => scene.handleClearLeaf(leaf.id)}
            />
          ))}

          {!showPandaGone && (
            <RedPanda
              isWalking={scene.isWalking}
              onWalkComplete={scene.handleWalkComplete}
              pathPoints={PATH_POINTS}
            />
          )}
        </View>
      </GestureDetector>

      {/* === UI ZONE: speech bubble and clearing progress hints === */}
      <View style={styles.uiZone}>
        <SpeechBubble text={dialogue} visible={showDialogue && !scene.isWalking} />

        {isClearing && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {scene.clearedFog.size > 0 || scene.clearedLeaves.size > 0
                ? 'Keep clearing the path...'
                : 'Swipe to clear the path'}
            </Text>
            <View style={styles.progressDots}>
              <View style={styles.progressGroup}>
                <Text style={styles.progressLabel}>Fog</Text>
                <View style={styles.dots}>
                  {FOG_WISPS.map((_, i) => (
                    <View key={`fog-${i}`} style={[styles.dot, scene.clearedFog.size > i && styles.dotFilled]} />
                  ))}
                </View>
              </View>
              <View style={styles.progressGroup}>
                <Text style={styles.progressLabel}>Leaves</Text>
                <View style={styles.dots}>
                  {LEAVES.map((_, i) => (
                    <View key={`leaf-${i}`} style={[styles.dot, scene.clearedLeaves.size > i && styles.dotFilled]} />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* === RITUAL PANEL: the emotional check-in and quest flow === */}
      <View style={[styles.ritual, { paddingBottom: insets.bottom + 20 }]}>

        {/* Waiting: path not yet cleared */}
        {isClearing && (
          <View style={styles.waitingSection}>
            <Text style={styles.waitingText}>Clear the path to continue</Text>
          </View>
        )}

        {/* Emotion selection — shown after Aetherling arrives */}
        {isCheckIn && (
          <View style={styles.emotionSection}>
            <Text style={styles.sectionLabel}>How are you feeling?</Text>
            <View style={styles.emotionRow}>
              {(Object.keys(EMOTION_LABELS) as Emotion[]).map((e) => (
                <Pressable key={e} style={styles.emotionChip} onPress={() => checkIn.onSelectEmotion(e)}>
                  <Text style={styles.emotionText}>{EMOTION_LABELS[e]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Return visit: already walked today */}
        {isReturning && (
          <View style={styles.restSection}>
            {worldState && worldState.totalDaysVisited > 0 && (
              <Text style={styles.dayCount}>Day {worldState.totalDaysVisited}</Text>
            )}
            <Text style={styles.alreadyCheckedIn}>You've walked the path today.</Text>
          </View>
        )}

        {/* Quest — shown after emotion is selected, reads text from phase context */}
        {isQuest && phase.phase === 'quest' && (
          <View style={styles.questSection}>
            <Text style={styles.sectionLabel}>Today's small thing</Text>
            <View style={styles.questCard}>
              <Text style={styles.questText}>{phase.quest}</Text>
            </View>
            <Pressable style={styles.doneBtn} onPress={quest.onDone}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        )}

        {/* Feedback and rest — shown after quest is marked done */}
        {isFeedbackOrComplete && (
          <View style={styles.restSection}>
            {worldState && worldState.totalDaysVisited > 0 && (
              <Text style={styles.dayCount}>Day {worldState.totalDaysVisited}</Text>
            )}
            <Pressable style={styles.restBtn} onPress={handleReset}>
              <Text style={styles.restBtnText}>Walk again</Text>
            </Pressable>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },

  // === SCENE ===
  scene: {
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  pathContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  pathSegment: {
    position: 'absolute',
    height: 24,
    backgroundColor: 'rgba(139, 119, 101, 0.25)',
    borderRadius: 12,
    transformOrigin: 'left center',
  },
  doorPosition: {
    position: 'absolute',
  },

  // === UI ZONE ===
  uiZone: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 100,
  },
  hintContainer: {
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 200, 150, 0.4)',
    marginBottom: 10,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 24,
  },
  progressGroup: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    color: 'rgba(255, 200, 150, 0.3)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 200, 150, 0.15)',
  },
  dotFilled: {
    backgroundColor: 'rgba(255, 200, 150, 0.6)',
  },

  // === RITUAL PANEL ===
  ritual: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    color: 'rgba(255, 200, 150, 0.4)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  emotionSection: {
    alignItems: 'center',
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  emotionChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 150, 0.1)',
  },
  emotionText: {
    fontSize: 13,
    color: 'rgba(255, 248, 240, 0.6)',
  },
  questSection: {
    alignItems: 'center',
  },
  questCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 150, 0.08)',
    marginBottom: 20,
    maxWidth: 280,
  },
  questText: {
    fontSize: 15,
    color: 'rgba(255, 248, 240, 0.75)',
    textAlign: 'center',
    lineHeight: 22,
  },
  doneBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 200, 150, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 150, 0.2)',
  },
  doneBtnText: {
    fontSize: 13,
    color: 'rgba(255, 215, 175, 0.7)',
    letterSpacing: 0.5,
  },
  restSection: {
    alignItems: 'center',
  },
  dayCount: {
    fontSize: 11,
    color: 'rgba(255, 200, 150, 0.35)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  alreadyCheckedIn: {
    fontSize: 14,
    color: 'rgba(255, 248, 240, 0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  restBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  restBtnText: {
    fontSize: 12,
    color: 'rgba(255, 200, 150, 0.4)',
  },
  waitingSection: {
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 13,
    color: 'rgba(255, 200, 150, 0.3)',
    fontStyle: 'italic',
  },
});
