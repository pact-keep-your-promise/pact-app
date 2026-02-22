import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Pact } from '@/data/types';
import { useDataHelpers } from '@/api/helpers';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import NudgeButton from './NudgeButton';

interface ParticipantRowProps {
  user: User;
  pact: Pact;
  onNudge: () => void;
}

export default function ParticipantRow({ user, pact, onNudge }: ParticipantRowProps) {
  const { colors } = useTheme();
  const { getStreakForUserPact, recentActivity } = useDataHelpers();
  const streak = getStreakForUserPact(pact.id, user.id);
  const today = new Date().toISOString().split('T')[0];
  const hasSubmittedToday = recentActivity.some(
    (s) => s.pactId === pact.id && s.userId === user.id && s.timestamp.split('T')[0] === today
  );

  return (
    <View style={[styles.row, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Avatar uri={user.avatar} name={user.name} size={44} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{user.isCurrentUser ? 'You' : user.name}</Text>
        <View style={styles.statusRow}>
          <Ionicons
            name={hasSubmittedToday ? 'checkmark-circle' : 'time-outline'}
            size={14}
            color={hasSubmittedToday ? colors.successText : colors.textTertiary}
          />
          <Text style={[styles.status, { color: hasSubmittedToday ? colors.successText : colors.textTertiary }]}>
            {hasSubmittedToday ? 'Submitted today' : 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Badge
          icon="flame"
          label={`${streak?.currentStreak || 0}`}
          color={colors.backgroundTertiary}
          textColor={colors.streakFire}
        />
        {!user.isCurrentUser && !hasSubmittedToday && (
          <NudgeButton onPress={onNudge} userName={user.name} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.bodyBold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  status: {
    ...typography.caption,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
});
