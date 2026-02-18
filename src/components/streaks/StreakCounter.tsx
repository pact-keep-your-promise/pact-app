import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface StreakCounterProps {
  count: number;
  color?: string;
}

export default function StreakCounter({ count, color = colors.streakFire }: StreakCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.fire}>🔥</Text>
      <Text style={[styles.count, { color }]}>{count}</Text>
      <Text style={styles.label}>day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fire: {
    fontSize: 28,
  },
  count: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
