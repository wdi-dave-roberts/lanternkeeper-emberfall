/** Leaf — interactive leaf that tumbles away when cleared */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { GAME_CONFIG } from '@/src/config/game';

interface LeafProps {
  x: number;
  y: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}

export function Leaf({ x, y, rotation, cleared, onClear }: LeafProps) {
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

const styles = StyleSheet.create({
  leaf: {
    position: "absolute",
    zIndex: 25,
  },
  leafTouchArea: {
    padding: 15, // PRESERVATION CONTRACT — do not change this value
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
});
