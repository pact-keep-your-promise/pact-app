import React from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/api/queries';
import { useSendFriendRequest } from '@/api/mutations';
import { adaptColor } from '@/utils/colorUtils';
import Avatar from '@/components/ui/Avatar';
import ActivityGraph from '@/components/streaks/ActivityGraph';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/shared/ErrorState';
import Button from '@/components/ui/Button';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useUserProfile(id);
  const sendRequest = useSendFriendRequest();

  const isSelf = id === currentUser?.id;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </Pressable>
        {isSelf && (
          <Pressable onPress={() => router.push('/edit-profile')}>
            <Ionicons name="pencil" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonCenter}>
            <Skeleton width={80} height={80} radius={40} />
            <Skeleton width={160} height={22} style={{ marginTop: spacing.md }} />
            <Skeleton width={100} height={14} style={{ marginTop: spacing.sm }} />
          </View>
          <View style={[styles.statsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Skeleton width={60} height={24} />
            <Skeleton width={60} height={24} />
          </View>
          <Skeleton width="100%" height={140} style={{ marginTop: spacing.xxl, marginHorizontal: spacing.xl }} />
        </View>
      ) : isError || !profile ? (
        <ErrorState message="Couldn't load this profile" onRetry={refetch} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Avatar uri={profile.avatar} name={profile.name} size={80} />
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{profile.name}</Text>
            <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>@{profile.username}</Text>
            {!!profile.bio && (
              <Text style={[styles.profileBio, { color: colors.textSecondary }]}>{profile.bio}</Text>
            )}

            {/* Friendship action */}
            {profile.friendshipStatus === 'none' && (
              <Button
                title="Add Friend"
                icon="person-add"
                variant="primary"
                onPress={() => sendRequest.mutate(profile.id)}
                loading={sendRequest.isPending}
              />
            )}
            {profile.friendshipStatus === 'pending' && (
              <View style={[styles.statusPill, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.statusPillText, { color: colors.textTertiary }]}>Request Pending</Text>
              </View>
            )}
            {profile.friendshipStatus === 'accepted' && (
              <View style={[styles.statusPill, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="people" size={14} color={colors.success} />
                <Text style={[styles.statusPillText, { color: colors.success }]}>Friends</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{profile.stats.totalPacts}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pacts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{profile.stats.totalSubmissions}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Submissions</Text>
            </View>
          </View>

          {/* Activity Graph */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Activity</Text>
            <View style={[styles.activityCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <ActivityGraph activityMap={profile.activityMap} color={adaptColor('#4ECDC4', isDark)} />
            </View>
          </View>

          {/* Shared Pacts */}
          {!isSelf && profile.sharedPacts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Shared Pacts ({profile.sharedPacts.length})
              </Text>
              {profile.sharedPacts.map((pact) => (
                <Pressable
                  key={pact.id}
                  style={[styles.sharedPactRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                  onPress={() => router.push(`/pact/${pact.id}`)}
                >
                  <View style={[styles.pactIcon, { backgroundColor: adaptColor(pact.color, isDark) + '20' }]}>
                    <Ionicons name={(pact.icon as any) || 'fitness'} size={20} color={adaptColor(pact.color, isDark)} />
                  </View>
                  <Text style={[styles.pactTitle, { color: colors.textPrimary }]} numberOfLines={1}>{pact.title}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ height: spacing.huge }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    ...typography.body,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  skeletonCenter: {
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  profileName: {
    ...typography.h2,
    marginTop: spacing.md,
  },
  profileUsername: {
    ...typography.caption,
  },
  profileBio: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  statusPillText: {
    ...typography.captionBold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h1,
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  activityCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  sharedPactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  pactIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pactTitle: {
    ...typography.body,
    flex: 1,
  },
});
