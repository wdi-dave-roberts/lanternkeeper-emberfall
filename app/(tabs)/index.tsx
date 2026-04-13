import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  completeQuest,
  FogState,
  getTodayKey,
  loadFogState,
  loadTodayLog,
  loadWorldState,
  recordDailyVisit,
  saveFogState,
  WorldState,
} from "@/lib/storage";
import { GAME_CONFIG } from "@/src/config/game";

type Emotion = "stuck" | "frustrated" | "inspired" | "alright";

// Helper to generate positions based on screen dimensions (mobile-first)
function getSceneConfig(width: number, height: number, topInset: number) {
  // Scene takes up a portion of screen - controlled by GAME_CONFIG.scene.heightRatio
  const SCENE_HEIGHT = height * GAME_CONFIG.scene.heightRatio;

  // Account for safe area in positioning - offset controlled by GAME_CONFIG.scene.safeOffsetMultiplier
  const SAFE_OFFSET = topInset + SCENE_HEIGHT * GAME_CONFIG.scene.safeOffsetMultiplier;

  const [fogSize1, fogSize2, fogSize3] = GAME_CONFIG.scene.fogWispSizes;

  // Path goes from bottom (where panda starts) to top (where door is)
  // All y positions include safe area offset
  return {
    SCENE_HEIGHT,
    PATH_POINTS: [
      { x: width * 0.5, y: SAFE_OFFSET + SCENE_HEIGHT * 0.55 },   // Start (bottom) - panda starts here
      { x: width * 0.28, y: SAFE_OFFSET + SCENE_HEIGHT * 0.45 },  // Curve left
      { x: width * 0.68, y: SAFE_OFFSET + SCENE_HEIGHT * 0.35 },  // Curve right
      { x: width * 0.32, y: SAFE_OFFSET + SCENE_HEIGHT * 0.25 },  // Curve left
      { x: width * 0.5, y: SAFE_OFFSET + SCENE_HEIGHT * 0.15 },   // Approach door
      { x: width * 0.5, y: SAFE_OFFSET + SCENE_HEIGHT * 0.08 },   // At door
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

const EMOTION_LABELS: Record<Emotion, string> = {
  stuck: "Stuck",
  frustrated: "Frustrated",
  inspired: "Inspired",
  alright: "Alright",
};

const FEEDBACK: Record<Emotion, string[]> = {
  stuck: [
    "Fog lost a little ground.",
    "That was enough to move.",
    "We didn't rush.",
    "Small steps count.",
    "We're still on the path.",
  ],
  frustrated: [
    "That made space.",
    "We carried it more lightly.",
    "The tension eased.",
    "That mattered.",
    "We kept it kind.",
  ],
  inspired: [
    "That belongs in the world.",
    "We protected something important.",
    "One piece became real.",
    "That's how ideas survive.",
    "We built today.",
  ],
  alright: [
    "Quiet progress.",
    "That was enough.",
    "We'll continue when it makes sense.",
    "Nothing to prove.",
    "This is steady.",
  ],
};

const QUESTS: Record<Emotion, string[]> = {
  stuck: [
    "Open your project for 2 minutes.",
    "Write one sentence about what feels blocked.",
    "Name one small thing you've already built.",
  ],
  frustrated: [
    "Put a hand on your chest. Breathe slowly for 3 breaths.",
    "Stretch your shoulders for 30 seconds.",
    "Say one kind thing to yourself (quietly).",
  ],
  inspired: [
    "Write one mechanic idea.",
    "Build one imperfect thing.",
    "Capture today's idea before it fades.",
  ],
  alright: [
    "Enjoy one simple comfort.",
    "Drink a glass of water.",
    "Rest for 5 minutes without guilt.",
  ],
};


// Interactive fog wisp component
function FogWisp({
  x,
  y,
  size,
  rotation,
  cleared,
  onClear,
}: {
  x: number;
  y: number;
  size: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cleared) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: GAME_CONFIG.animation.fogClearDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: GAME_CONFIG.animation.fogClearScale,
          duration: GAME_CONFIG.animation.fogClearDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -GAME_CONFIG.animation.fogClearLiftPx,
          duration: GAME_CONFIG.animation.fogClearDurationMs,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when not cleared
      opacity.setValue(1);
      scale.setValue(1);
      translateY.setValue(0);
    }
  }, [cleared, opacity, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.fogWisp,
        {
          left: x - size / 2,
          top: y - 30,
          width: size,
          height: 60,
          transform: [{ rotate: `${rotation}deg` }, { scale }, { translateY }],
          opacity,
        },
      ]}
      pointerEvents={cleared ? "none" : "auto"}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClear} />
    </Animated.View>
  );
}

// Interactive leaf component
function Leaf({
  x,
  y,
  rotation,
  cleared,
  onClear,
}: {
  x: number;
  y: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cleared) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: GAME_CONFIG.animation.leafClearDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: direction * (GAME_CONFIG.animation.leafClearHorizontalMin + Math.random() * (GAME_CONFIG.animation.leafClearHorizontalMax - GAME_CONFIG.animation.leafClearHorizontalMin)),
          duration: GAME_CONFIG.animation.leafClearDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -(GAME_CONFIG.animation.leafClearVerticalMin + Math.random() * (GAME_CONFIG.animation.leafClearVerticalMax - GAME_CONFIG.animation.leafClearVerticalMin)),
          duration: GAME_CONFIG.animation.leafClearDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(spin, {
          toValue: direction * 2,
          duration: GAME_CONFIG.animation.leafClearDurationMs,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when not cleared
      opacity.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      spin.setValue(0);
    }
  }, [cleared, opacity, translateX, translateY, spin]);

  const spinInterpolate = spin.interpolate({
    inputRange: [-2, 2],
    outputRange: ["-360deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.leaf,
        {
          left: x - 12,
          top: y - 8,
          transform: [
            { rotate: `${rotation}deg` },
            { translateX },
            { translateY },
            { rotate: spinInterpolate },
          ],
          opacity,
        },
      ]}
      pointerEvents={cleared ? "none" : "auto"}
    >
      <Pressable style={styles.leafTouchArea} onPress={onClear}>
        <View style={styles.leafBody}>
          <View style={styles.leafStem} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Red Panda (Aetherling) component with walking animation
function RedPanda({
  isWalking,
  onWalkComplete,
  pathPoints,
}: {
  isWalking: boolean;
  onWalkComplete: () => void;
  pathPoints: { x: number; y: number }[];
}) {
  const posX = useRef(new Animated.Value(pathPoints[0]?.x ?? 0)).current;
  const posY = useRef(new Animated.Value(pathPoints[0]?.y ?? 0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const bobble = useRef(new Animated.Value(0)).current;

  // Update initial position when pathPoints change and reset opacity
  useEffect(() => {
    if (pathPoints[0]) {
      posX.setValue(pathPoints[0].x);
      posY.setValue(pathPoints[0].y);
      opacity.setValue(1);
      bobble.setValue(0);
    }
  }, [pathPoints, posX, posY, opacity, bobble]);

  useEffect(() => {
    if (isWalking && pathPoints.length > 1) {
      // Create walking bobble animation
      const bobbleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(bobble, {
            toValue: -3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bobble, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      );
      bobbleAnim.start();

      // Walk along path points
      const walkAnimations = pathPoints.slice(1).map((point, index) => {
        const duration = index === pathPoints.length - 2 ? 400 : 600;
        return Animated.parallel([
          Animated.timing(posX, {
            toValue: point.x,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(posY, {
            toValue: point.y,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
      });

      // Add fade out at the door
      const fadeOut = Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      });

      Animated.sequence([...walkAnimations, fadeOut]).start(() => {
        bobbleAnim.stop();
        onWalkComplete();
      });
    }
  }, [isWalking, posX, posY, opacity, bobble, onWalkComplete]);

  return (
    <Animated.View
      style={[
        styles.redPanda,
        {
          transform: [
            { translateX: Animated.subtract(posX, 32) },
            { translateY: Animated.subtract(posY, 32) },
            { translateY: bobble },
          ],
          opacity,
        },
      ]}
    >
      <View style={styles.aetherlingBody}>
        <View style={styles.ears}>
          <View style={styles.ear} />
          <View style={styles.ear} />
        </View>
        <View style={styles.face}>
          <View style={styles.eyes}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          <View style={styles.nose} />
        </View>
      </View>
    </Animated.View>
  );
}

// Door component
function Door({ isOpen }: { isOpen: boolean }) {
  const doorRotation = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(doorRotation, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset door when closed
      doorRotation.setValue(0);
      glowOpacity.setValue(0);
    }
  }, [isOpen, doorRotation, glowOpacity]);

  const rotation = doorRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-70deg"],
  });

  return (
    <View style={styles.doorContainer}>
      {/* Door glow */}
      <Animated.View style={[styles.doorGlow, { opacity: glowOpacity }]} />

      {/* Door frame */}
      <View style={styles.doorFrame}>
        {/* Inner darkness / light */}
        <View style={styles.doorInner}>
          <Animated.View
            style={[styles.doorLight, { opacity: glowOpacity }]}
          />
        </View>

        {/* Door panel */}
        <Animated.View
          style={[
            styles.doorPanel,
            { transform: [{ perspective: 200 }, { rotateY: rotation }] },
          ]}
        >
          <View style={styles.doorHandle} />
        </Animated.View>
      </View>

      {/* Arch top */}
      <View style={styles.doorArch} />
    </View>
  );
}

// Speech bubble component
function SpeechBubble({ text, visible }: { text: string; visible: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (visible && text) {
      if (prevTextRef.current !== text) {
        prevTextRef.current = text;
        fadeAnim.setValue(0);
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [text, visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.speechBubble, { opacity: fadeAnim }]}>
      <Text style={styles.speechText}>{text}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Calculate scene config based on current dimensions (account for safe area)
  const sceneConfig = useMemo(
    () => getSceneConfig(width, height, insets.top),
    [width, height, insets.top]
  );
  const { SCENE_HEIGHT, PATH_POINTS, FOG_WISPS, LEAVES, DOOR_POSITION } = sceneConfig;

  const [clearedFog, setClearedFog] = useState<Set<number>>(new Set());
  const [clearedLeaves, setClearedLeaves] = useState<Set<number>>(new Set());
  const [pathCleared, setPathCleared] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [pandaGone, setPandaGone] = useState(false);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [quest, setQuest] = useState<string>("");
  const [questDone, setQuestDone] = useState(false);
  const [dialogue, setDialogue] = useState("The path is blocked...");
  const [showDialogue, setShowDialogue] = useState(true);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  const fogCleared = clearedFog.size >= FOG_WISPS.length;
  const leavesCleared = clearedLeaves.size >= LEAVES.length;
  const allCleared = fogCleared && leavesCleared;

  // Load saved state on mount
  useEffect(() => {
    async function loadState() {
      const [state, todayLog, fogState] = await Promise.all([
        loadWorldState(),
        loadTodayLog(),
        loadFogState(),
      ]);
      setWorldState(state);

      // Restore fog/leaf clearing from persistence (no-op in reset mode)
      if (fogState) {
        setClearedFog(new Set(fogState.clearedFogIds));
        setClearedLeaves(new Set(fogState.clearedLeafIds));
      }

      const today = getTodayKey();
      if (state.lastVisitDate === today) {
        setAlreadyCheckedIn(true);
        setClearedFog(new Set(FOG_WISPS.map((f) => f.id)));
        setClearedLeaves(new Set(LEAVES.map((l) => l.id)));
        setPathCleared(true);
        setDoorOpen(true);
        setPandaGone(true);
        if (todayLog.completedQuests.length > 0) {
          setQuestDone(true);
          setDialogue("Welcome back, Lanternkeeper.");
        } else {
          setDialogue("The path awaits.");
        }
      }
    }
    loadState();
  }, [FOG_WISPS, LEAVES]);

  // Check if path is cleared and trigger walking
  useEffect(() => {
    if (allCleared && !pathCleared && !isWalking) {
      setDialogue("The way is clear!");
      setShowDialogue(true);

      // Short delay then open door and start walking
      const timer = setTimeout(() => {
        setDoorOpen(true);
        setTimeout(() => {
          setIsWalking(true);
          setShowDialogue(false);
        }, GAME_CONFIG.timing.doorOpenToWalkStartMs);
      }, GAME_CONFIG.timing.pathClearedToDoorsOpenMs);

      return () => clearTimeout(timer);
    }
  }, [allCleared, pathCleared, isWalking]);

  const handleWalkComplete = useCallback(() => {
    setIsWalking(false);
    setPandaGone(true);
    setPathCleared(true);
    setDialogue("A new day begins.");
    setShowDialogue(true);
  }, []);

  const handleClearFog = useCallback((id: number) => {
    setClearedFog((prev) => {
      if (prev.has(id)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = new Set(prev);
      next.add(id);

      // Update dialogue
      if (next.size === 1) {
        setDialogue("The fog begins to lift...");
      } else if (next.size === FOG_WISPS.length) {
        setDialogue("The fog has cleared.");
      }

      return next;
    });
  }, [FOG_WISPS.length]);

  const handleClearLeaf = useCallback((id: number) => {
    setClearedLeaves((prev) => {
      if (prev.has(id)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = new Set(prev);
      next.add(id);

      if (next.size === LEAVES.length && clearedFog.size < FOG_WISPS.length) {
        setDialogue("Leaves swept aside.");
      }

      return next;
    });
  }, [clearedFog.size, LEAVES.length, FOG_WISPS.length]);

  // Persist fog/leaf clearing state when it changes (no-op in reset mode)
  useEffect(() => {
    if (clearedFog.size > 0 || clearedLeaves.size > 0) {
      saveFogState([...clearedFog], [...clearedLeaves]);
    }
  }, [clearedFog, clearedLeaves]);

  // Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const touchX = event.x;
      const touchY = event.y;

      FOG_WISPS.forEach((wisp) => {
        if (!clearedFog.has(wisp.id)) {
          const dx = touchX - wisp.x;
          const dy = touchY - wisp.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < wisp.size / 2 + GAME_CONFIG.scene.fogTouchRadiusBuffer) {
            handleClearFog(wisp.id);
          }
        }
      });

      LEAVES.forEach((leaf) => {
        if (!clearedLeaves.has(leaf.id)) {
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

  const pickFeedback = (e: Emotion) => {
    const options = FEEDBACK[e];
    return options[Math.floor(Math.random() * options.length)];
  };

  const pickQuest = (e: Emotion) => {
    const options = QUESTS[e];
    return options[Math.floor(Math.random() * options.length)];
  };

  const onSelectEmotion = useCallback(
    async (e: Emotion) => {
      setEmotion(e);
      setQuest(pickQuest(e));
      setQuestDone(false);
      setShowDialogue(false);

      const previousRegions = worldState?.unlockedRegions ?? ["lantern-clearing"];
      const updatedState = await recordDailyVisit(e);
      setWorldState(updatedState);
      setAlreadyCheckedIn(true);

      const newlyUnlocked = updatedState.unlockedRegions.filter(
        (r) => !previousRegions.includes(r)
      );
      if (newlyUnlocked.length > 0) {
        setNewUnlocks(newlyUnlocked);
      }
    },
    [worldState]
  );

  const onDone = useCallback(async () => {
    setQuestDone(true);
    const fb = pickFeedback(emotion!);

    if (newUnlocks.length > 0) {
      const regionNames: Record<string, string> = {
        "workshop-glade": "Workshop Glade",
        "fog-valley": "Fog Valley",
        "warm-river": "Warm River",
        "observatory-balcony": "Observatory Balcony",
        "the-long-path": "The Long Path",
      };
      const unlockName = regionNames[newUnlocks[0]] ?? newUnlocks[0];
      setDialogue(`New region: ${unlockName}`);
      setNewUnlocks([]);
    } else {
      setDialogue(fb);
    }
    setShowDialogue(true);

    const questId = `${getTodayKey()}-${emotion}`;
    await completeQuest(questId);
  }, [emotion, newUnlocks]);

  const resetMorning = () => {
    setClearedFog(new Set());
    setClearedLeaves(new Set());
    setPathCleared(false);
    setIsWalking(false);
    setDoorOpen(false);
    setPandaGone(false);
    setEmotion(null);
    setQuest("");
    setQuestDone(false);
    setAlreadyCheckedIn(false);
    setDialogue("The path is blocked...");
    setShowDialogue(true);
  };

  const readyForCheckIn = pathCleared && pandaGone;

  // Memoize star positions so they don't flicker
  const stars = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random(),
      top: Math.random() * 0.3,
      opacity: 0.3 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0a0f1a", "#1a1a2e", "#0a0f1a"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* === SCENE === */}
      <GestureDetector gesture={panGesture}>
        <View style={[styles.scene, { height: SCENE_HEIGHT }]}>
          {/* Stars */}
          {stars.map((star) => (
            <View
              key={star.id}
              style={[
                styles.star,
                {
                  left: star.left * width,
                  top: star.top * SCENE_HEIGHT,
                  opacity: star.opacity,
                  width: star.size,
                  height: star.size,
                },
              ]}
            />
          ))}

          {/* Winding path */}
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
                  style={[
                    styles.pathSegment,
                    {
                      left: point.x,
                      top: point.y,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Door at top of path */}
          <View style={[styles.doorPosition, { top: DOOR_POSITION.top, left: DOOR_POSITION.left }]}>
            <Door isOpen={doorOpen} />
          </View>

          {/* Fog wisps */}
          {FOG_WISPS.map((wisp) => (
            <FogWisp
              key={wisp.id}
              x={wisp.x}
              y={wisp.y}
              size={wisp.size}
              rotation={wisp.rotation}
              cleared={clearedFog.has(wisp.id)}
              onClear={() => handleClearFog(wisp.id)}
            />
          ))}

          {/* Leaves */}
          {LEAVES.map((leaf) => (
            <Leaf
              key={leaf.id}
              x={leaf.x}
              y={leaf.y}
              rotation={leaf.rotation}
              cleared={clearedLeaves.has(leaf.id)}
              onClear={() => handleClearLeaf(leaf.id)}
            />
          ))}

          {/* Red Panda */}
          {!pandaGone && (
            <RedPanda
              isWalking={isWalking}
              onWalkComplete={handleWalkComplete}
              pathPoints={PATH_POINTS}
            />
          )}
        </View>
      </GestureDetector>

      {/* === UI ZONE (between scene and ritual) === */}
      <View style={styles.uiZone}>
        {/* Speech bubble */}
        <SpeechBubble text={dialogue} visible={showDialogue && !isWalking} />

        {/* Progress hints */}
        {!pathCleared && !isWalking && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {clearedFog.size > 0 || clearedLeaves.size > 0
                ? "Keep clearing the path..."
                : "Swipe to clear the path"}
            </Text>
            <View style={styles.progressDots}>
              <View style={styles.progressGroup}>
                <Text style={styles.progressLabel}>Fog</Text>
                <View style={styles.dots}>
                  {FOG_WISPS.map((_, i) => (
                    <View
                      key={`fog-${i}`}
                      style={[
                        styles.dot,
                        clearedFog.size > i && styles.dotFilled,
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.progressGroup}>
                <Text style={styles.progressLabel}>Leaves</Text>
                <View style={styles.dots}>
                  {LEAVES.map((_, i) => (
                    <View
                      key={`leaf-${i}`}
                      style={[
                        styles.dot,
                        clearedLeaves.size > i && styles.dotFilled,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* === RITUAL PANEL === */}
      <View style={[styles.ritual, { paddingBottom: insets.bottom + 20 }]}>
        {/* Emotion selection */}
        {readyForCheckIn && !emotion && !alreadyCheckedIn && (
          <View style={styles.emotionSection}>
            <Text style={styles.sectionLabel}>How are you feeling?</Text>
            <View style={styles.emotionRow}>
              {(Object.keys(EMOTION_LABELS) as Emotion[]).map((e) => (
                <Pressable
                  key={e}
                  style={styles.emotionChip}
                  onPress={() => onSelectEmotion(e)}
                >
                  <Text style={styles.emotionText}>{EMOTION_LABELS[e]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Already checked in */}
        {readyForCheckIn && !emotion && alreadyCheckedIn && !questDone && (
          <View style={styles.restSection}>
            {worldState && worldState.totalDaysVisited > 0 && (
              <Text style={styles.dayCount}>Day {worldState.totalDaysVisited}</Text>
            )}
            <Text style={styles.alreadyCheckedIn}>
              You've walked the path today.
            </Text>
          </View>
        )}

        {/* Quest */}
        {emotion && !questDone && (
          <View style={styles.questSection}>
            <Text style={styles.sectionLabel}>Today's small thing</Text>
            <View style={styles.questCard}>
              <Text style={styles.questText}>{quest}</Text>
            </View>
            <Pressable style={styles.doneBtn} onPress={onDone}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        )}

        {/* Rest */}
        {questDone && (
          <View style={styles.restSection}>
            {worldState && worldState.totalDaysVisited > 0 && (
              <Text style={styles.dayCount}>Day {worldState.totalDaysVisited}</Text>
            )}
            <Pressable style={styles.restBtn} onPress={resetMorning}>
              <Text style={styles.restBtnText}>Walk again</Text>
            </Pressable>
          </View>
        )}

        {/* Waiting state */}
        {!readyForCheckIn && !isWalking && (
          <View style={styles.waitingSection}>
            <Text style={styles.waitingText}>Clear the path to continue</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },

  // === SCENE ===
  scene: {
    overflow: "hidden",
  },

  // Stars
  star: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 1,
  },

  // Path
  pathContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  pathSegment: {
    position: "absolute",
    height: 24,
    backgroundColor: "rgba(139, 119, 101, 0.25)",
    borderRadius: 12,
    transformOrigin: "left center",
  },

  // Door
  doorPosition: {
    position: "absolute",
  },
  doorContainer: {
    width: 70,
    height: 100,
    alignItems: "center",
  },
  doorGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 200, 100, 0.15)",
    top: -10,
    left: -25,
  },
  doorFrame: {
    width: 60,
    height: 85,
    backgroundColor: "#2a1f1a",
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#4a3a2a",
    overflow: "hidden",
  },
  doorInner: {
    flex: 1,
    backgroundColor: "#0a0808",
  },
  doorLight: {
    flex: 1,
    backgroundColor: "rgba(255, 220, 150, 0.3)",
  },
  doorPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#3d2d1d",
    borderWidth: 2,
    borderColor: "#5a4a3a",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  doorHandle: {
    width: 6,
    height: 12,
    backgroundColor: "#8B7355",
    borderRadius: 3,
  },
  doorArch: {
    position: "absolute",
    top: -8,
    width: 70,
    height: 20,
    backgroundColor: "#4a3a2a",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  // Fog
  fogWisp: {
    position: "absolute",
    backgroundColor: "rgba(180, 200, 220, 0.12)",
    borderRadius: 50,
    zIndex: 20,
  },

  // Leaves
  leaf: {
    position: "absolute",
    zIndex: 25,
  },
  leafTouchArea: {
    padding: 15,
  },
  leafBody: {
    width: 24,
    height: 16,
    backgroundColor: "#8B6914",
    borderRadius: 12,
    borderTopLeftRadius: 3,
  },
  leafStem: {
    position: "absolute",
    bottom: -4,
    left: 10,
    width: 2,
    height: 8,
    backgroundColor: "#5D4A1A",
    borderRadius: 1,
  },

  // Red Panda
  redPanda: {
    position: "absolute",
    zIndex: 50,
  },
  aetherlingBody: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#8B4513",
    alignItems: "center",
    justifyContent: "center",
  },
  ears: {
    position: "absolute",
    top: -6,
    flexDirection: "row",
    width: 54,
    justifyContent: "space-between",
  },
  ear: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#A0522D",
    borderWidth: 2,
    borderColor: "#CD853F",
  },
  face: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DEB887",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  eyes: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 3,
  },
  eye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1a0a00",
  },
  nose: {
    width: 5,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1a0a00",
  },

  // UI Zone (between scene and ritual)
  uiZone: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 100,
  },

  // Speech bubble
  speechBubble: {
    backgroundColor: "rgba(255, 250, 240, 0.1)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 200, 150, 0.2)",
    maxWidth: 280,
    marginBottom: 12,
  },
  speechText: {
    fontSize: 15,
    color: "rgba(255, 248, 240, 0.85)",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },

  // Hints
  hintContainer: {
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    color: "rgba(255, 200, 150, 0.4)",
    marginBottom: 10,
  },
  progressDots: {
    flexDirection: "row",
    gap: 24,
  },
  progressGroup: {
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 10,
    color: "rgba(255, 200, 150, 0.3)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 200, 150, 0.15)",
  },
  dotFilled: {
    backgroundColor: "rgba(255, 200, 150, 0.6)",
  },

  // === RITUAL ===
  ritual: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-start",
    paddingTop: 8,
  },

  sectionLabel: {
    fontSize: 11,
    color: "rgba(255, 200, 150, 0.4)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 16,
  },

  // Emotions
  emotionSection: {
    alignItems: "center",
  },
  emotionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  emotionChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 200, 150, 0.1)",
  },
  emotionText: {
    fontSize: 13,
    color: "rgba(255, 248, 240, 0.6)",
  },

  // Quest
  questSection: {
    alignItems: "center",
  },
  questCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 200, 150, 0.08)",
    marginBottom: 20,
    maxWidth: 280,
  },
  questText: {
    fontSize: 15,
    color: "rgba(255, 248, 240, 0.75)",
    textAlign: "center",
    lineHeight: 22,
  },
  doneBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 22,
    backgroundColor: "rgba(255, 200, 150, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 200, 150, 0.2)",
  },
  doneBtnText: {
    fontSize: 13,
    color: "rgba(255, 215, 175, 0.7)",
    letterSpacing: 0.5,
  },

  // Rest
  restSection: {
    alignItems: "center",
  },
  dayCount: {
    fontSize: 11,
    color: "rgba(255, 200, 150, 0.35)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  alreadyCheckedIn: {
    fontSize: 14,
    color: "rgba(255, 248, 240, 0.5)",
    fontStyle: "italic",
    textAlign: "center",
  },
  restBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  restBtnText: {
    fontSize: 12,
    color: "rgba(255, 200, 150, 0.4)",
  },

  // Waiting
  waitingSection: {
    alignItems: "center",
  },
  waitingText: {
    fontSize: 13,
    color: "rgba(255, 200, 150, 0.3)",
    fontStyle: "italic",
  },
});
