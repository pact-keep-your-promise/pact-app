import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { WeeklyProgress } from '@/data/types';

interface WeeklyProgressBarProps {
  progress: WeeklyProgress;
  color: string;
  compact?: boolean;
  centered?: boolean;
}

export default function WeeklyProgressBar({ progress, color, compact = false, centered = false }: WeeklyProgressBarProps) {
  const { colors } = useTheme();
  const { completed, target, adjustedTarget, isFirstWeek, daysLeft } = progress;
  const effectiveTarget = isFirstWeek ? adjustedTarget : target;
  const metTarget = completed >= effectiveTarget;
  const overTarget = completed > target;

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: withAlpha(metTarget ? colors.success : color, 0.1) }]}>
        <Ionicons
          name={metTarget ? 'checkmark-circle' : 'calendar'}
          size={12}
          color={metTarget ? colors.successText : color}
        />
        <Text style={[styles.compactText, { color: metTarget ? colors.successText : color }]}>
          {completed}/{target}
        </Text>
      </View>
    );
  }

  // Full version with dot indicators
  const dots = [];
  for (let i = 0; i < Math.max(target, completed); i++) {
    const isFilled = i < completed;
    const isExtra = i >= target;
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          isFilled && !isExtra && { backgroundColor: color },
          isFilled && isExtra && { backgroundColor: colors.success },
          !isFilled && { backgroundColor: withAlpha(color, 0.15), borderWidth: 1, borderColor: withAlpha(color, 0.3) },
        ]}
      >
        {isFilled && (
          <Ionicons name="checkmark" size={10} color="#fff" />
        )}
      </View>
    );
  }

  const label = metTarget
    ? overTarget
      ? `${completed}/${target} — ${completed - target} extra!`
      : 'Weekly target met!'
    : `${completed}/${target} this week`;

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow, centered && styles.labelRowCentered]}>
        <Ionicons
          name={metTarget ? 'checkmark-circle' : 'calendar-outline'}
          size={16}
          color={metTarget ? colors.successText : colors.textTertiary}
        />
        <Text style={[styles.label, { color: metTarget ? colors.successText : colors.textSecondary }]}>
          {label}
        </Text>
      </View>
      <View style={[styles.dotsRow, centered && styles.dotsRowCentered]}>
        {dots}
        {!metTarget && daysLeft > 0 && (
          <Text style={[styles.daysLeft, { color: colors.textTertiary }]}>
            {daysLeft}d left
          </Text>
        )}
      </View>
      {isFirstWeek && (
        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          Free pass week — streak starts next week
        </Text>
      )}
    </View>
  );
}

const DOT_SIZE = 20;

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
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dotsRowCentered: {
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysLeft: {
    ...typography.tiny,
    marginLeft: spacing.xs,
  },
  hint: {
    ...typography.tiny,
    fontStyle: 'italic',
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
