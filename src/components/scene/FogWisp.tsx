/** FogWisp — interactive fog wisp that fades when cleared */

import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { GAME_CONFIG } from '@/src/config/game';

interface FogWispProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  cleared: boolean;
  onClear: () => void;
}

export function FogWisp({ x, y, size, rotation, cleared, onClear }: FogWispProps) {
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

const styles = StyleSheet.create({
  fogWisp: {
    position: "absolute",
    backgroundColor: "rgba(180, 200, 220, 0.12)",
    borderRadius: 50,
    zIndex: 20,
  },
});
