import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Pact } from '@/data/types';
import { useDataHelpers } from '@/api/helpers';
import ProgressRing from '@/components/ui/ProgressRing';
import Card from '@/components/ui/Card';
import IconBadge from '@/components/ui/IconBadge';
import StreakCounter from './StreakCounter';
import MilestoneBadge from './MilestoneBadge';
import CalendarGrid from './CalendarGrid';
import TodayProgress from './TodayProgress';
import WeeklyProgressBar from './WeeklyProgressBar';
import { adaptColor } from '@/utils/colorUtils';

interface StreakCardProps {
  pact: Pact;
}

export default function StreakCard({ pact }: StreakCardProps) {
  const { colors, isDark } = useTheme();
  const { getStreakForPact, getCompletionRate } = useDataHelpers();
  const pactColor = adaptColor(pact.color, isDark);
  const streak = getStreakForPact(pact.id);
  const completion = getCompletionRate(pact.id);
  if (!streak) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge icon={pact.icon} color={pactColor} size={36} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>{pact.title}</Text>
        <View style={styles.headerRight}>
          <ProgressRing progress={completion} size={36} strokeWidth={3} color={pactColor} />
        </View>
      </View>

      <View style={styles.counterRow}>
        <StreakCounter count={streak.currentStreak} color={pactColor} streakType={streak.streakType} />
        {streak.currentStreak >= 3 && (
          <View style={styles.milestoneRow}>
            <MilestoneBadge streak={streak.currentStreak} color={pactColor} />
          </View>
        )}
      </View>

      {/* Progress: weekly or daily */}
      <View style={[styles.todayRow, { borderTopColor: colors.border }]}>
        {streak.weeklyProgress ? (
          <WeeklyProgressBar
            progress={streak.weeklyProgress}
            color={pactColor}
          />
        ) : (
          <TodayProgress
            completed={streak.todayStatus.completed}
            total={streak.todayStatus.total}
            color={pactColor}
          />
        )}
      </View>

      <CalendarGrid completedDates={streak.completedDates} freezeDates={streak.freezeInfo?.freezeDates} color={pactColor} />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.longestLabel, { color: colors.textTertiary }]}>Longest streak</Text>
        <Text style={[styles.longestValue, { color: colors.textSecondary }]}>
          {streak.longestStreak} {streak.streakType === 'weekly' ? (streak.longestStreak === 1 ? 'week' : 'weeks') : (streak.longestStreak === 1 ? 'day' : 'days')}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    flex: 1,
  },
  headerRight: {
    marginLeft: 'auto',
  },
  counterRow: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  milestoneRow: {
    marginTop: spacing.xxs,
  },
  todayRow: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  longestLabel: {
    ...typography.caption,
  },
  longestValue: {
    ...typography.bodyBold,
  },
});
