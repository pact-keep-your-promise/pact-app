import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { spacing, typography, borderRadius, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Pact } from '@/data/types';
import { useAuth } from '@/contexts/AuthContext';
import { useDataHelpers } from '@/api/helpers';
import { useNudge } from '@/api/mutations';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Card from '@/components/ui/Card';
import IconBadge from '@/components/ui/IconBadge';
import AvatarGroup from '@/components/ui/AvatarGroup';
import Avatar from '@/components/ui/Avatar';
import StreakFlame from '@/components/streaks/StreakFlame';
import TodayProgress from '@/components/streaks/TodayProgress';
import WeeklyProgressBar from '@/components/streaks/WeeklyProgressBar';
import { adaptColor } from '@/utils/colorUtils';

interface PactCardProps {
  pact: Pact;
  onPress: () => void;
}

export default function PactCard({ pact, onPress }: PactCardProps) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { getParticipants, getStreakForPact, getPendingParticipants } = useDataHelpers();
  const nudgeMutation = useNudge();
  const pactColor = adaptColor(pact.color, isDark);
  const participants = getParticipants(pact);
  const pactStreak = getStreakForPact(pact.id);
  const pendingFriends = getPendingParticipants(pact);

  const [nudgedIds, setNudgedIds] = useState<Set<string>>(new Set());
  const shakeX = useRef(new Animated.Value(0)).current;

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleNudge = (userId: string) => {
    runShake();
    setNudgedIds((prev) => new Set(prev).add(userId));
    nudgeMutation.mutate({ pactId: pact.id, targetUserId: userId });
    setTimeout(() => {
      setNudgedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }, 2000);
  };

  const handleNudgeAll = () => {
    runShake();
    const allIds = new Set(pendingFriends.map((f) => f.id));
    setNudgedIds(allIds);
    nudgeMutation.mutate({ pactId: pact.id });
    setTimeout(() => setNudgedIds(new Set()), 2000);
  };

  const allNudged = pendingFriends.length > 0 && pendingFriends.every((f) => nudgedIds.has(f.id));

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <IconBadge icon={pact.icon} color={pactColor} size={48} />

        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{pact.title}</Text>
          <Text style={[styles.frequency, { color: colors.textSecondary }]}>
            {pact.frequency === 'daily' ? 'Daily' : `${pact.timesPerWeek}x / week`}
          </Text>
        </View>

        <View style={styles.right}>
          <View style={styles.streakRow}>
            <StreakFlame size={16} color={colors.streakFireText} streak={pactStreak?.currentStreak || 0} />
            <Text style={[styles.streakCount, { color: colors.streakFireText }]}>
              {pactStreak?.currentStreak || 0}
            </Text>
          </View>
          {pactStreak?.weeklyProgress ? (
            <WeeklyProgressBar
              progress={pactStreak.weeklyProgress}
              color={pactColor}
              compact
            />
          ) : pactStreak?.todayStatus ? (
            <TodayProgress
              completed={pactStreak.todayStatus.completed}
              total={pactStreak.todayStatus.total}
              color={pactColor}
              compact
            />
          ) : null}
          <AvatarGroup
            users={participants.map((p) => ({ avatar: p.avatar, name: p.name }))}
            max={3}
            size={24}
          />
        </View>
      </View>

      {pendingFriends.length > 0 && (
        <Animated.View style={[styles.nudgeRow, { borderTopColor: colors.border, transform: [{ translateX: shakeX }] }]}>
          <View style={styles.pendingAvatars}>
            {pendingFriends.map((friend) => (
              <Pressable
                key={friend.id}
                onPress={() => handleNudge(friend.id)}
                style={styles.pendingItem}
              >
                <Avatar uri={friend.avatar} name={friend.name} size={28} />
                {nudgedIds.has(friend.id) && (
                  <View style={[styles.nudgedBadge, { backgroundColor: colors.success }]}>
                    <Ionicons name="checkmark" size={8} color={colors.onSuccess} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
          <Text style={[styles.pendingLabel, { color: colors.textTertiary }]}>
            {pendingFriends.length} pending
          </Text>
          <Pressable
            onPress={handleNudgeAll}
            style={[styles.nudgeButton, { backgroundColor: withAlpha(colors.primary, 0.09), borderColor: withAlpha(colors.primary, 0.25) }]}
          >
            <Ionicons name="hand-left-outline" size={14} color={colors.primary} />
            <Text style={[styles.nudgeText, { color: colors.primary }]}>
              {allNudged ? 'Sent!' : 'Nudge'}
            </Text>
          </Pressable>
        </Animated.View>
      )}
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
  },
  frequency: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  streakCount: {
    ...typography.bodyBold,
  },
  nudgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  pendingAvatars: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pendingItem: {
    position: 'relative',
  },
  nudgedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingLabel: {
    ...typography.caption,
    flex: 1,
    marginLeft: spacing.sm,
  },
  nudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  nudgeText: {
    ...typography.tiny,
    fontWeight: '600',
  },
});
