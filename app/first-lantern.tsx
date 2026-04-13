import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { markFirstLanternSeen } from "@/lib/storage";

const { width, height } = Dimensions.get("window");

type Phase =
  | "fog"
  | "aetherling-appears"
  | "dialogue-1"
  | "dialogue-2"
  | "dialogue-3"
  | "choice"
  | "lighting"
  | "response-1"
  | "response-2"
  | "response-3"
  | "welcome"
  | "fade-out";

export default function FirstLanternScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>("fog");
  const [choiceMade, setChoiceMade] = useState<"light" | "judge" | null>(null);

  // Animations
  const fogOpacity = useRef(new Animated.Value(1)).current;
  const aetherlingOpacity = useRef(new Animated.Value(0)).current;
  const lanternGlow = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  // Auto-advance through initial phases
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (phase === "fog") {
      timers.push(setTimeout(() => setPhase("aetherling-appears"), 2000));
    } else if (phase === "aetherling-appears") {
      Animated.timing(aetherlingOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      timers.push(setTimeout(() => setPhase("dialogue-1"), 1200));
    } else if (phase === "lighting") {
      // Animate lantern glow
      Animated.timing(lanternGlow, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
      // Clear some fog
      Animated.timing(fogOpacity, {
        toValue: 0.3,
        duration: 2000,
        useNativeDriver: true,
      }).start();
      timers.push(setTimeout(() => setPhase("response-1"), 2000));
    } else if (phase === "fade-out") {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/(tabs)");
      });
    }

    return () => timers.forEach(clearTimeout);
  }, [phase, aetherlingOpacity, lanternGlow, fogOpacity, screenFade]);

  // Animate text changes
  useEffect(() => {
    if (
      phase.startsWith("dialogue") ||
      phase.startsWith("response") ||
      phase === "choice" ||
      phase === "welcome"
    ) {
      textOpacity.setValue(0);
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [phase, textOpacity]);

  const handleTapToContinue = () => {
    if (phase === "dialogue-1") setPhase("dialogue-2");
    else if (phase === "dialogue-2") setPhase("dialogue-3");
    else if (phase === "dialogue-3") setPhase("choice");
    else if (phase === "response-1") setPhase("response-2");
    else if (phase === "response-2") setPhase("response-3");
    else if (phase === "response-3") setPhase("welcome");
    else if (phase === "welcome") {
      markFirstLanternSeen();
      setPhase("fade-out");
    }
  };

  const handleChoice = async (choice: "light" | "judge") => {
    setChoiceMade(choice);
    if (choice === "light") {
      setPhase("lighting");
    } else {
      // Judge the fog - still proceed but with different flavor
      setTimeout(() => {
        setPhase("lighting");
      }, 1500);
    }
  };

  const renderDialogue = () => {
    let text = "";
    let showTapHint = true;

    switch (phase) {
      case "dialogue-1":
        text = "This thing and I have been having a philosophical disagreement.";
        break;
      case "dialogue-2":
        text = "It refuses to be warm.";
        break;
      case "dialogue-3":
        text =
          "I'm building a world. Slowly. With a concerning amount of optimism.";
        break;
      case "response-1":
        text = "Progress has been detected. Quietly.";
        break;
      case "response-2":
        text = "I'll build Emberfall. You build Atlas.";
        break;
      case "response-3":
        text = "We'll compare notes later.";
        break;
      case "welcome":
        text = "Welcome, Lanternkeeper.";
        break;
      default:
        showTapHint = false;
    }

    if (!text) return null;

    return (
      <Pressable style={styles.dialogueArea} onPress={handleTapToContinue}>
        <View style={styles.speechBubble}>
          <View style={styles.bubbleTail} />
          <Animated.Text style={[styles.dialogueText, { opacity: textOpacity }]}>
            {text}
          </Animated.Text>
        </View>
        {showTapHint && <Text style={styles.tapHint}>tap to continue</Text>}
      </Pressable>
    );
  };

  const renderChoice = () => {
    if (phase !== "choice") return null;

    return (
      <Animated.View style={[styles.choiceArea, { opacity: textOpacity }]}>
        <Text style={styles.choicePrompt}>
          We can light it together.{"\n"}Or we can sit here and judge the fog for a while.{"\n"}Both are valid.
        </Text>
        <View style={styles.choiceButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.choiceButton,
              pressed && styles.choiceButtonPressed,
            ]}
            onPress={() => handleChoice("light")}
          >
            <Text style={styles.choiceButtonText}>Light the lantern</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.choiceButton,
              styles.choiceButtonSecondary,
              pressed && styles.choiceButtonPressed,
            ]}
            onPress={() => handleChoice("judge")}
          >
            <Text style={styles.choiceButtonTextSecondary}>Judge the fog</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  // Interpolate lantern glow color
  const glowSize = lanternGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });
  const glowOpacity = lanternGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });
  const flameOpacity = lanternGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <LinearGradient
        colors={["#080c14", "#0f1520", "#080c14"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Fog layers */}
      <Animated.View style={[styles.fogLayer, { opacity: fogOpacity }]}>
        <View style={[styles.fog, styles.fog1]} />
        <View style={[styles.fog, styles.fog2]} />
        <View style={[styles.fog, styles.fog3]} />
        <View style={[styles.fog, styles.fog4]} />
        <View style={[styles.fog, styles.fog5]} />
      </Animated.View>

      {/* Scene content */}
      <View style={[styles.scene, { paddingTop: insets.top + 40 }]}>
        {/* Lantern glow (animated) */}
        <Animated.View
          style={[
            styles.lanternGlow,
            {
              width: glowSize,
              height: glowSize,
              opacity: glowOpacity,
              borderRadius: 100,
            },
          ]}
        />

        {/* Lantern */}
        <View style={styles.lantern}>
          <View style={styles.lanternTop} />
          <View style={styles.lanternBody}>
            <Animated.View
              style={[styles.lanternFlame, { opacity: flameOpacity }]}
            />
          </View>
          <View style={styles.lanternBase} />
        </View>

        {/* Aetherling */}
        <Animated.View
          style={[styles.aetherling, { opacity: aetherlingOpacity }]}
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
      </View>

      {/* Dialogue / Choice area */}
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 40 }]}>
        {renderDialogue()}
        {renderChoice()}
        {choiceMade === "judge" && phase === "lighting" && (
          <Text style={styles.judgeResponse}>
            ...Fair enough. The fog is pretty suspicious.
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c14",
  },

  // Fog
  fogLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  fog: {
    position: "absolute",
    backgroundColor: "rgba(150, 170, 190, 0.08)",
    borderRadius: 100,
  },
  fog1: {
    top: "10%",
    left: -50,
    width: width * 0.9,
    height: 80,
    transform: [{ rotate: "-3deg" }],
  },
  fog2: {
    top: "25%",
    right: -40,
    width: width * 0.8,
    height: 70,
    transform: [{ rotate: "2deg" }],
  },
  fog3: {
    top: "45%",
    left: -30,
    width: width * 1.1,
    height: 90,
    transform: [{ rotate: "-1deg" }],
  },
  fog4: {
    top: "60%",
    right: -20,
    width: width * 0.7,
    height: 60,
    transform: [{ rotate: "4deg" }],
  },
  fog5: {
    bottom: "20%",
    left: 0,
    width: width,
    height: 100,
  },

  // Scene
  scene: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // Lantern glow
  lanternGlow: {
    position: "absolute",
    backgroundColor: "#ffb060",
  },

  // Lantern
  lantern: {
    alignItems: "center",
    marginBottom: 30,
  },
  lanternTop: {
    width: 16,
    height: 8,
    backgroundColor: "#3d2a1a",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  lanternBody: {
    width: 28,
    height: 40,
    backgroundColor: "rgba(60, 45, 30, 0.6)",
    borderWidth: 2,
    borderColor: "#4a3525",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  lanternFlame: {
    width: 12,
    height: 18,
    backgroundColor: "#ffb347",
    borderRadius: 6,
  },
  lanternBase: {
    width: 20,
    height: 6,
    backgroundColor: "#3d2a1a",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },

  // Aetherling
  aetherling: {
    alignItems: "center",
  },
  aetherlingBody: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8B4513",
    alignItems: "center",
    justifyContent: "center",
  },
  ears: {
    position: "absolute",
    top: -5,
    flexDirection: "row",
    width: 48,
    justifyContent: "space-between",
  },
  ear: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#A0522D",
    borderWidth: 2,
    borderColor: "#CD853F",
  },
  face: {
    width: 38,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DEB887",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  eyes: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 2,
  },
  eye: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#1a0a00",
  },
  nose: {
    width: 4,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#1a0a00",
  },

  // Bottom area
  bottomArea: {
    paddingHorizontal: 32,
    zIndex: 20,
  },

  // Dialogue
  dialogueArea: {
    alignItems: "center",
  },
  speechBubble: {
    backgroundColor: "rgba(255, 250, 240, 0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 200, 150, 0.15)",
    maxWidth: 320,
  },
  bubbleTail: {
    position: "absolute",
    top: -6,
    left: "50%",
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: "rgba(255, 250, 240, 0.1)",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(255, 200, 150, 0.15)",
    transform: [{ rotate: "45deg" }],
  },
  dialogueText: {
    fontSize: 17,
    color: "rgba(255, 248, 240, 0.9)",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 26,
  },
  tapHint: {
    marginTop: 16,
    fontSize: 11,
    color: "rgba(255, 200, 150, 0.3)",
    letterSpacing: 1,
  },

  // Choice
  choiceArea: {
    alignItems: "center",
  },
  choicePrompt: {
    fontSize: 15,
    color: "rgba(255, 248, 240, 0.7)",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  choiceButtons: {
    gap: 12,
    width: "100%",
    maxWidth: 280,
  },
  choiceButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255, 200, 150, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 200, 150, 0.25)",
    alignItems: "center",
  },
  choiceButtonSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 200, 150, 0.1)",
  },
  choiceButtonPressed: {
    backgroundColor: "rgba(255, 200, 150, 0.2)",
  },
  choiceButtonText: {
    fontSize: 15,
    color: "rgba(255, 220, 180, 0.9)",
    letterSpacing: 0.3,
  },
  choiceButtonTextSecondary: {
    fontSize: 15,
    color: "rgba(255, 248, 240, 0.5)",
    letterSpacing: 0.3,
  },

  // Judge response
  judgeResponse: {
    fontSize: 14,
    color: "rgba(255, 248, 240, 0.6)",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
});
