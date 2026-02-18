import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import {
  getPactById,
  getParticipants,
  getSubmissionsForPact,
  getStreakForUserPact,
} from '@/data/mock';
import IconBadge from '@/components/ui/IconBadge';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import NudgeButton from '@/components/pacts/NudgeButton';
import CalendarGrid from '@/components/streaks/CalendarGrid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pact = getPactById(id);
  if (!pact) return null;

  const participants = getParticipants(pact);
  const submissions = getSubmissionsForPact(pact.id);
  const myStreak = getStreakForUserPact(pact.id, 'u1');

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: pact.color + '12' }]}>
          <IconBadge icon={pact.icon} color={pact.color} size={64} />
          <Text style={styles.pactTitle}>{pact.title}</Text>
          <Text style={styles.pactFrequency}>
            {pact.frequency === 'daily' ? 'Daily' : `${pact.timesPerWeek}x per week`}
          </Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakNumber, { color: pact.color }]}>
              {myStreak?.currentStreak || 0}
            </Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          {participants.map((user) => {
            const userStreak = getStreakForUserPact(pact.id, user.id);
            const userSubmissions = submissions.filter(
              (s) => s.userId === user.id
            );
            const hasSubmittedToday = userSubmissions.some(
              (s) => s.timestamp.split('T')[0] === today
            );

            return (
              <View
                key={user.id}
                style={styles.participantRow}
              >
                <Avatar uri={user.avatar} name={user.name} size={44} />
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>
                    {user.isCurrentUser ? 'You' : user.name}
                  </Text>
                  <View style={styles.participantStats}>
                    <Ionicons
                      name={hasSubmittedToday ? 'checkmark-circle' : 'time-outline'}
                      size={14}
                      color={hasSubmittedToday ? colors.success : colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.participantStatus,
                        { color: hasSubmittedToday ? colors.success : colors.textTertiary },
                      ]}
                    >
                      {hasSubmittedToday ? 'Submitted today' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <View style={styles.participantRight}>
                  <Badge
                    label={`🔥 ${userStreak?.currentStreak || 0}`}
                    color={colors.backgroundTertiary}
                    textColor={colors.streakFire}
                  />
                  {!user.isCurrentUser && !hasSubmittedToday && (
                    <NudgeButton
                      onPress={() => {}}
                      userName={user.name}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* My Streak Calendar */}
        {myStreak && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Streak</Text>
            <View style={styles.calendarCard}>
              <CalendarGrid
                completedDates={myStreak.completedDates}
                color={pact.color}
              />
              <View style={styles.streakStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{myStreak.currentStreak}</Text>
                  <Text style={styles.statLabel}>Current</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{myStreak.longestStreak}</Text>
                  <Text style={styles.statLabel}>Longest</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{myStreak.completedDates.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent Submissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Submissions</Text>
          <View style={styles.photoGrid}>
            {submissions.slice(0, 6).map((sub) => (
              <View key={sub.id}>
                <Image source={{ uri: sub.photoUri }} style={styles.gridPhoto} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const PHOTO_SIZE = (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 2) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.xxl,
  },
  pactTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  pactFrequency: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  streakEmoji: {
    fontSize: 20,
  },
  streakNumber: {
    ...typography.h1,
  },
  streakLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  participantInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  participantName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  participantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  participantStatus: {
    ...typography.caption,
  },
  participantRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  calendarCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.md,
  },
});
