import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Pact } from '@/data/types';
import { getParticipants, getStreakForUserPact } from '@/data/mock';
import Card from '@/components/ui/Card';
import IconBadge from '@/components/ui/IconBadge';
import AvatarGroup from '@/components/ui/AvatarGroup';

interface PactCardProps {
  pact: Pact;
  onPress: () => void;
}

export default function PactCard({ pact, onPress }: PactCardProps) {
  const participants = getParticipants(pact);
  const myStreak = getStreakForUserPact(pact.id, 'u1');

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <IconBadge icon={pact.icon} color={pact.color} size={48} />

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{pact.title}</Text>
          <Text style={styles.frequency}>
            {pact.frequency === 'daily' ? 'Daily' : `${pact.timesPerWeek}x / week`}
          </Text>
        </View>

        <View style={styles.right}>
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakCount, { color: colors.streakFire }]}>
              {myStreak?.currentStreak || 0}
            </Text>
          </View>
          <AvatarGroup
            users={participants.map((p) => ({ avatar: p.avatar, name: p.name }))}
            max={3}
            size={24}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  frequency: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakCount: {
    ...typography.bodyBold,
  },
});
