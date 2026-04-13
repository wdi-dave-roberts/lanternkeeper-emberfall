/**
 * RedPanda (Aetherling)
 * Animates Aetherling walking the path from start to door.
 * Receives path points and walk trigger from the home screen.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface Props {
  isWalking: boolean;
  onWalkComplete: () => void;
  pathPoints: { x: number; y: number }[];
}

export function RedPanda({ isWalking, onWalkComplete, pathPoints }: Props) {
  const posX = useRef(new Animated.Value(pathPoints[0]?.x ?? 0)).current;
  const posY = useRef(new Animated.Value(pathPoints[0]?.y ?? 0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const bobble = useRef(new Animated.Value(0)).current;

  // Reset position when path changes — but only when not walking (WR-03)
  useEffect(() => {
    if (!isWalking && pathPoints[0]) {
      posX.setValue(pathPoints[0].x);
      posY.setValue(pathPoints[0].y);
      opacity.setValue(1);
      bobble.setValue(0);
    }
  }, [isWalking, pathPoints, posX, posY, opacity, bobble]);

  // Walk animation — includes pathPoints in deps (WR-04)
  useEffect(() => {
    if (isWalking && pathPoints.length > 1) {
      const bobbleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(bobble, { toValue: -3, duration: 150, useNativeDriver: true }),
          Animated.timing(bobble, { toValue: 0, duration: 150, useNativeDriver: true }),
        ])
      );
      bobbleAnim.start();

      const walkAnimations = pathPoints.slice(1).map((point, index) => {
        const duration = index === pathPoints.length - 2 ? 400 : 600;
        return Animated.parallel([
          Animated.timing(posX, { toValue: point.x, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(posY, { toValue: point.y, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]);
      });

      const fadeOut = Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true });

      Animated.sequence([...walkAnimations, fadeOut]).start(() => {
        bobbleAnim.stop();
        onWalkComplete();
      });
    }
  }, [isWalking, pathPoints, posX, posY, opacity, bobble, onWalkComplete]);

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

const styles = StyleSheet.create({
  redPanda: {
    position: 'absolute',
    zIndex: 50,
  },
  aetherlingBody: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ears: {
    position: 'absolute',
    top: -6,
    flexDirection: 'row',
    width: 54,
    justifyContent: 'space-between',
  },
  ear: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#A0522D',
    borderWidth: 2,
    borderColor: '#CD853F',
  },
  face: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DEB887',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  eyes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 3,
  },
  eye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1a0a00',
  },
  nose: {
    width: 5,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a0a00',
  },
});
