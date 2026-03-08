import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { FreezeInfo } from '@/data/types';

const MAX_FREEZES = 2;

interface StreakFreezeInfoProps {
  freezeInfo: FreezeInfo;
  color: string;
}

export default function StreakFreezeInfo({ freezeInfo, color }: StreakFreezeInfoProps) {
  const { colors } = useTheme();

  const freezeColor = '#5BC0EB';

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="snow" size={18} color={freezeColor} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Streak Freeze</Text>
      </View>

      {/* Freeze dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: MAX_FREEZES }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.freezeDot,
              {
                backgroundColor: i < freezeInfo.available ? freezeColor : colors.backgroundTertiary,
                borderColor: i < freezeInfo.available ? freezeColor : colors.border,
              },
            ]}
          >
            <Ionicons
              name="snow"
              size={14}
              color={i < freezeInfo.available ? '#fff' : colors.textTertiary}
            />
          </View>
        ))}
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {freezeInfo.available}/{MAX_FREEZES}
        </Text>
      </View>

      {/* Status line */}
      <Text style={[styles.statusText, { color: colors.textTertiary }]}>
        {freezeInfo.onCooldown && freezeInfo.available > 0
          ? 'Cooldown active — next use available in a few days'
          : freezeInfo.available > 0
            ? 'Auto-protects your streak if you miss a day'
            : freezeInfo.nextFreezeIn > 0
              ? `${freezeInfo.nextFreezeIn} more day${freezeInfo.nextFreezeIn === 1 ? '' : 's'} to earn a freeze`
              : 'Complete 7 consecutive days to earn a freeze'}
      </Text>

      {/* Progress to next freeze */}
      {freezeInfo.available < MAX_FREEZES && freezeInfo.nextFreezeIn > 0 && (
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: freezeColor,
                  width: `${((7 - freezeInfo.nextFreezeIn) / 7) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>
            {7 - freezeInfo.nextFreezeIn}/7
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.bodyBold,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  freezeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    ...typography.bodyBold,
    marginLeft: spacing.xs,
  },
  statusText: {
    ...typography.caption,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    ...typography.caption,
    minWidth: 28,
  },
});
