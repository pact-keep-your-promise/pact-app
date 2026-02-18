import React, { useState, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface NudgeButtonProps {
  onPress: () => void;
  userName: string;
}

export default function NudgeButton({ onPress, userName }: NudgeButtonProps) {
  const [nudged, setNudged] = useState(false);
  const shakeX = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setNudged(true);
    onPress();
    setTimeout(() => setNudged(false), 2000);
  };

  return (
    <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
      <Pressable onPress={handlePress} style={styles.button}>
        <Text style={styles.text}>{nudged ? 'Sent!' : '👋 Nudge'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '18',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  text: {
    ...typography.tiny,
    color: colors.primary,
  },
});
