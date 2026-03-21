import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const MILESTONES: Record<number, { label: string; emoji: string }> = {
  3:   { label: 'Getting started!', emoji: '🌱' },
  7:   { label: '1 Week!', emoji: '⭐' },
  14:  { label: '2 Weeks!', emoji: '🌟' },
  21:  { label: '3 Weeks!', emoji: '💫' },
  30:  { label: '1 Month!', emoji: '🏆' },
  50:  { label: '50 Days!', emoji: '🔥' },
  100: { label: '100 Days!', emoji: '💎' },
  365: { label: '1 Year!', emoji: '👑' },
};

interface MilestoneBadgeProps {
  streak: number;
  color: string;
}

/** Returns the highest milestone achieved for a given streak count */
function getMilestone(streak: number): { label: string; emoji: string } | null {
  const keys = Object.keys(MILESTONES).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (streak >= k) return MILESTONES[k];
  }
  return null;
}

export { getMilestone };

export default function MilestoneBadge({ streak, color }: MilestoneBadgeProps) {
  const { colors } = useTheme();
  const milestone = getMilestone(streak);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!milestone) return;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [milestone]);

  if (!milestone) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: withAlpha(color, 0.1),
          borderColor: withAlpha(color, 0.3),
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.emoji}>{milestone.emoji}</Text>
      <Text style={[styles.label, { color }]}>{milestone.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    ...typography.captionBold,
  },
});
