import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface TodayProgressProps {
  completed: number;
  total: number;
  color: string;
  compact?: boolean;
  /** Center the label text (for centered parent contexts like headers) */
  centered?: boolean;
}

export default function TodayProgress({ completed, total, color, compact = false, centered = false }: TodayProgressProps) {
  const { colors } = useTheme();
  const allDone = completed >= total;
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: total > 0 ? completed / total : 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [completed, total]);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: withAlpha(allDone ? colors.success : color, 0.1) }]}>
        <Ionicons
          name={allDone ? 'checkmark-circle' : 'people'}
          size={12}
          color={allDone ? colors.successText : color}
        />
        <Text style={[styles.compactText, { color: allDone ? colors.successText : color }]}>
          {completed}/{total}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow, centered && styles.labelRowCentered]}>
        <Ionicons
          name={allDone ? 'checkmark-circle' : 'time-outline'}
          size={16}
          color={allDone ? colors.successText : colors.textTertiary}
        />
        <Text style={[styles.label, { color: allDone ? colors.successText : colors.textSecondary }]}>
          {allDone ? 'Everyone completed today!' : `${completed}/${total} completed today`}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: withAlpha(color, 0.12) }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: allDone ? colors.success : color,
              width: fillAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  labelRowCentered: {
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  compactText: {
    ...typography.micro,
    fontWeight: '600',
  },
});
