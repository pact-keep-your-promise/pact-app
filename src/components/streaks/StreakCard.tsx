import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Pact } from '@/data/types';
import { getStreakForUserPact } from '@/data/mock';
import Card from '@/components/ui/Card';
import IconBadge from '@/components/ui/IconBadge';
import StreakCounter from './StreakCounter';
import CalendarGrid from './CalendarGrid';

interface StreakCardProps {
  pact: Pact;
}

export default function StreakCard({ pact }: StreakCardProps) {
  const streak = getStreakForUserPact(pact.id, 'u1');
  if (!streak) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge icon={pact.icon} color={pact.color} size={36} />
        <Text style={styles.title}>{pact.title}</Text>
      </View>

      <View style={styles.counterRow}>
        <StreakCounter count={streak.currentStreak} color={pact.color} />
      </View>

      <CalendarGrid completedDates={streak.completedDates} color={pact.color} />

      <View style={styles.footer}>
        <Text style={styles.longestLabel}>Longest streak</Text>
        <Text style={styles.longestValue}>{streak.longestStreak} days</Text>
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
    color: colors.textPrimary,
  },
  counterRow: {
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  longestLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  longestValue: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});
