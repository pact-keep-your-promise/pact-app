import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { User, Pact } from '@/data/types';
import { getStreakForUserPact, getSubmissionsForPact } from '@/data/mock';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import NudgeButton from './NudgeButton';

interface ParticipantRowProps {
  user: User;
  pact: Pact;
  onNudge: () => void;
}

export default function ParticipantRow({ user, pact, onNudge }: ParticipantRowProps) {
  const streak = getStreakForUserPact(pact.id, user.id);
  const submissions = getSubmissionsForPact(pact.id);
  const today = new Date().toISOString().split('T')[0];
  const hasSubmittedToday = submissions.some(
    (s) => s.userId === user.id && s.timestamp.split('T')[0] === today
  );

  return (
    <View style={styles.row}>
      <Avatar uri={user.avatar} name={user.name} size={44} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.isCurrentUser ? 'You' : user.name}</Text>
        <View style={styles.statusRow}>
          <Ionicons
            name={hasSubmittedToday ? 'checkmark-circle' : 'time-outline'}
            size={14}
            color={hasSubmittedToday ? colors.success : colors.textTertiary}
          />
          <Text style={[styles.status, { color: hasSubmittedToday ? colors.success : colors.textTertiary }]}>
            {hasSubmittedToday ? 'Submitted today' : 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Badge
          label={`🔥 ${streak?.currentStreak || 0}`}
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
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  status: {
    ...typography.caption,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
});
