/**
 * Door
 * Animates the door opening when Aetherling's path is clear.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface Props {
  isOpen: boolean;
}

export function Door({ isOpen }: Props) {
  const doorRotation = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(doorRotation, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      doorRotation.setValue(0);
      glowOpacity.setValue(0);
    }
  }, [isOpen, doorRotation, glowOpacity]);

  const rotation = doorRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-70deg'],
  });

  return (
    <View style={styles.doorContainer}>
      <Animated.View style={[styles.doorGlow, { opacity: glowOpacity }]} />
      <View style={styles.doorFrame}>
        <View style={styles.doorInner}>
          <Animated.View style={[styles.doorLight, { opacity: glowOpacity }]} />
        </View>
        <Animated.View
          style={[styles.doorPanel, { transform: [{ perspective: 200 }, { rotateY: rotation }] }]}
        >
          <View style={styles.doorHandle} />
        </Animated.View>
      </View>
      <View style={styles.doorArch} />
    </View>
  );
}

const styles = StyleSheet.create({
  doorContainer: {
    width: 70,
    height: 100,
    alignItems: 'center',
  },
  doorGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 200, 100, 0.15)',
    top: -10,
    left: -25,
  },
  doorFrame: {
    width: 60,
    height: 85,
    backgroundColor: '#2a1f1a',
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#4a3a2a',
    overflow: 'hidden',
  },
  doorInner: {
    flex: 1,
    backgroundColor: '#0a0808',
  },
  doorLight: {
    flex: 1,
    backgroundColor: 'rgba(255, 220, 150, 0.3)',
  },
  doorPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#3d2d1d',
    borderWidth: 2,
    borderColor: '#5a4a3a',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  doorHandle: {
    width: 6,
    height: 12,
    backgroundColor: '#8B7355',
    borderRadius: 3,
  },
  doorArch: {
    position: 'absolute',
    top: -8,
    width: 70,
    height: 20,
    backgroundColor: '#4a3a2a',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
});
