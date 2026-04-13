/**
 * SpeechBubble
 * Aetherling's voice — fades in when visible, fades out when hidden.
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface Props {
  text: string;
  visible: boolean;
}

export function SpeechBubble({ text, visible }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (visible && text) {
      if (prevTextRef.current !== text) {
        prevTextRef.current = text;
        fadeAnim.setValue(0);
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [text, visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.speechBubble, { opacity: fadeAnim }]}>
      <Text style={styles.speechText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  speechBubble: {
    backgroundColor: 'rgba(255, 250, 240, 0.1)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 150, 0.2)',
    maxWidth: 280,
    marginBottom: 12,
  },
  speechText: {
    fontSize: 15,
    color: 'rgba(255, 248, 240, 0.85)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
});
