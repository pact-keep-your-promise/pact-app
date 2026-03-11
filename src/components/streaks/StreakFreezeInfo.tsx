import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { FreezeInfo } from '@/data/types';

interface StreakFreezeInfoProps {
  freezeInfo: FreezeInfo;
  color: string;
  frequency?: 'daily' | 'weekly';
}

export default function StreakFreezeInfo({ freezeInfo, color, frequency = 'daily' }: StreakFreezeInfoProps) {
  const { colors } = useTheme();

  const freezeColor = '#5BC0EB';
  const maxFreezes = freezeInfo.maxFreezes ?? 2;
  const isWeekly = frequency === 'weekly';
  const earnPeriod = isWeekly ? 3 : 7;
  const earnUnit = isWeekly ? 'week' : 'day';
  const missUnit = isWeekly ? 'submissions this week' : 'a day';

  // For large maxFreezes (5+), use compact display
  const useCompactDots = maxFreezes > 4;

  const statusText = freezeInfo.onCooldown && freezeInfo.available > 0
    ? `Cooldown active — next use available in ${isWeekly ? 'a couple weeks' : 'a few days'}`
    : freezeInfo.available > 0
      ? `Auto-protects your streak if you miss ${missUnit}`
      : freezeInfo.nextFreezeIn > 0
        ? `${freezeInfo.nextFreezeIn} more ${earnUnit}${freezeInfo.nextFreezeIn === 1 ? '' : 's'} to earn a freeze`
        : `Complete ${earnPeriod} consecutive ${earnUnit}s to earn a freeze`;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="snow" size={18} color={freezeColor} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Streak Freeze</Text>
      </View>

      {/* Freeze dots or compact count */}
      <View style={styles.dotsRow}>
        {useCompactDots ? (
          <>
            {Array.from({ length: Math.min(freezeInfo.available, 3) }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.freezeDot,
                  {
                    backgroundColor: freezeColor,
                    borderColor: freezeColor,
                  },
                ]}
              >
                <Ionicons name="snow" size={14} color="#fff" />
              </View>
            ))}
            {freezeInfo.available > 3 && (
              <Text style={[styles.countText, { color: freezeColor }]}>
                +{freezeInfo.available - 3}
              </Text>
            )}
          </>
        ) : (
          Array.from({ length: maxFreezes }).map((_, i) => (
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
          ))
        )}
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {freezeInfo.available}/{maxFreezes}
        </Text>
      </View>

      {/* Status line */}
      <Text style={[styles.statusText, { color: colors.textTertiary }]}>
        {statusText}
      </Text>

      {/* Progress to next freeze */}
      {freezeInfo.available < maxFreezes && freezeInfo.nextFreezeIn > 0 && (
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: freezeColor,
                  width: `${((earnPeriod - freezeInfo.nextFreezeIn) / earnPeriod) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>
            {earnPeriod - freezeInfo.nextFreezeIn}/{earnPeriod}
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
