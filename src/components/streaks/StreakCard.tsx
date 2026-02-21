import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Pact } from '@/data/types';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import ProgressRing from '@/components/ui/ProgressRing';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import IconBadge from '@/components/ui/IconBadge';
import StreakCounter from './StreakCounter';
import CalendarGrid from './CalendarGrid';
import { adaptColor } from '@/utils/colorUtils';

interface StreakCardProps {
  pact: Pact;
}

export default function StreakCard({ pact }: StreakCardProps) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { getParticipants, getStreakForUserPact, getCompletionRate } = useData();
  const pactColor = adaptColor(pact.color, isDark);
  const streak = getStreakForUserPact(pact.id, user?.id || '');
  const participants = getParticipants(pact).filter(u => !u.isCurrentUser);
  const completion = getCompletionRate(pact.id, user?.id || '');
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
      </View>

      <CalendarGrid completedDates={streak.completedDates} color={pactColor} />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.longestLabel, { color: colors.textTertiary }]}>Longest streak</Text>
        <Text style={[styles.longestValue, { color: colors.textSecondary }]}>
          {streak.longestStreak} {streak.streakType === 'weekly' ? 'weeks' : 'days'}
        </Text>
      </View>

      {participants.length > 0 && (
        <View style={[styles.friendsRow, { borderTopColor: colors.border }]}>
          {participants.map((friend) => {
            const friendStreak = getStreakForUserPact(pact.id, friend.id);
            return (
              <View key={friend.id} style={styles.friendItem}>
                <Avatar uri={friend.avatar} name={friend.name} size={28} />
                <Text style={[styles.friendStreak, { color: colors.textSecondary }]}>
                  {friendStreak?.currentStreak || 0}
                </Text>
              </View>
            );
          })}
        </View>
      )}
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
    marginBottom: spacing.xl,
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
  friendsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  friendItem: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  friendStreak: {
    ...typography.tiny,
    fontWeight: '600',
  },
});
