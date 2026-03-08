import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  Image,
  Dimensions,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { adaptColor } from '@/utils/colorUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useDataHelpers } from '@/api/helpers';
import { usePactSubmissions } from '@/api/queries';
import { useLeavePact, useNudge, useInviteToPact, useToggleReaction } from '@/api/mutations';
import { useUsers } from '@/api/queries';
import { Submission, ReactionSummary } from '@/data/types';
import Avatar from '@/components/ui/Avatar';
import PactDetailHeader from '@/components/pacts/PactDetailHeader';
import ParticipantRow from '@/components/pacts/ParticipantRow';
import CalendarGrid from '@/components/streaks/CalendarGrid';
import StreakFlame from '@/components/streaks/StreakFlame';
import MilestoneBadge from '@/components/streaks/MilestoneBadge';
import TodayProgress from '@/components/streaks/TodayProgress';
import ReactionBar from '@/components/shared/ReactionBar';
import PactChat from '@/components/pacts/PactChat';
import { usePactSocket } from '@/api/socket';
import { featureFlags } from '@/config/featureFlags';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const { user } = useAuth();
  const { getPactById, getParticipants, getStreakForPact } = useDataHelpers();
  const { data: submissions = [] } = usePactSubmissions(id);
  const leavePactMutation = useLeavePact();
  const nudgeMutation = useNudge();
  const inviteMutation = useInviteToPact();
  const toggleReaction = useToggleReaction();
  const { data: friends = [] } = useUsers();

  // Subscribe to real-time updates for this pact
  usePactSocket(id);

  const [showInvite, setShowInvite] = useState(false);

  const [lightboxSubmission, setLightboxSubmission] = useState<(Submission & { user?: any }) | null>(null);
  const [givingUp, setGivingUp] = useState(false);

  const pact = getPactById(id);

  if (!pact) return null;
  const pactColor = adaptColor(pact.color, isDark);

  const participants = getParticipants(pact);
  const pactStreak = getStreakForPact(pact.id);

  const handleGiveUp = async () => {
    const streakCount = pactStreak?.currentStreak || 0;
    const hasFriends = participants.length > 1;

    let title: string;
    let confirmMessage: string;

    if (streakCount < 2) {
      title = 'Leave Pact?';
      confirmMessage = hasFriends
        ? `You're just getting started! Give it a few more days with your friends before deciding.`
        : `You're just getting started! Give it a few more days before deciding.`;
    } else {
      title = 'Give Up?';
      confirmMessage = hasFriends
        ? `Are you sure? Your friends are counting on you! You'll lose your ${streakCount}-day streak and leave the pact.`
        : `Are you sure? You'll lose your ${streakCount}-day streak and all progress on this pact.`;
    }

    const doLeave = async () => {
      setGivingUp(true);
      try {
        await leavePactMutation.mutateAsync(pact.id);
        router.replace('/');
      } catch (e: any) {
        setGivingUp(false);
        if (Platform.OS === 'web') {
          window.alert(e.message || 'Failed to leave pact');
        } else {
          Alert.alert('Error', e.message || 'Failed to leave pact');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (!window.confirm(`${title}\n\n${confirmMessage}`)) return;
      await doLeave();
    } else {
      Alert.alert(
        title,
        confirmMessage,
        [
          { text: streakCount < 2 ? 'Stay' : 'Keep Going!', style: 'cancel' },
          {
            text: streakCount < 2 ? 'Leave' : 'I Give Up',
            style: 'destructive',
            onPress: doLeave,
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </Pressable>

        {/* Header */}
        <PactDetailHeader pact={pact}>
          <View style={styles.streakRow}>
            <StreakFlame size={22} color={pactColor} streak={pactStreak?.currentStreak || 0} />
            <Text style={[styles.streakNumber, { color: pactColor }]}>{pactStreak?.currentStreak || 0}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              {pactStreak?.streakType === 'weekly' ? 'week' : 'day'} streak
            </Text>
          </View>
          {pactStreak && pactStreak.currentStreak >= 3 && (
            <View style={{ marginTop: spacing.sm }}>
              <MilestoneBadge streak={pactStreak.currentStreak} color={pactColor} />
            </View>
          )}
          {pactStreak?.todayStatus && (
            <View style={styles.todayProgressRow}>
              <TodayProgress
                completed={pactStreak.todayStatus.completed}
                total={pactStreak.todayStatus.total}
                color={pactColor}
                centered
              />
            </View>
          )}
        </PactDetailHeader>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Participants</Text>
          {participants.map((u) => (
            <ParticipantRow key={u.id} user={u} pact={pact} onNudge={() => nudgeMutation.mutate({ pactId: pact.id, targetUserId: u.id })} />
          ))}
          {pact.pendingParticipants && pact.pendingParticipants.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={[styles.pendingLabel, { color: colors.textTertiary }]}>Invited</Text>
              {pact.pendingParticipants.map((p: any) => (
                <View key={p.id} style={[styles.pendingRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                  <View style={[styles.pendingAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.pendingAvatarText, { color: colors.textTertiary }]}>
                      {p.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <Text style={[styles.pendingName, { color: colors.textTertiary }]}>{p.name}</Text>
                  <Text style={[styles.pendingStatus, { color: colors.textTertiary }]}>Pending</Text>
                </View>
              ))}
            </View>
          )}

          {/* Invite friends */}
          {(() => {
            const allPactUserIds = new Set([
              ...participants.map(p => p.id),
              ...(pact.pendingParticipants || []).map((p: any) => p.id),
            ]);
            const invitableFriends = friends.filter(f => !allPactUserIds.has(f.id));

            if (invitableFriends.length === 0) return null;

            return (
              <View style={styles.pendingSection}>
                <Pressable
                  onPress={() => setShowInvite(!showInvite)}
                  style={[styles.inviteToggle, { borderColor: colors.primary }]}
                >
                  <Ionicons name={showInvite ? 'chevron-up' : 'person-add'} size={16} color={colors.primary} />
                  <Text style={[styles.inviteToggleText, { color: colors.primary }]}>
                    {showInvite ? 'Hide' : 'Invite Friends'}
                  </Text>
                </Pressable>
                {showInvite && invitableFriends.map((friend) => (
                  <View key={friend.id} style={[styles.pendingRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, opacity: 1 }]}>
                    <Avatar uri={friend.avatar} name={friend.name} size={36} />
                    <Text style={[styles.pendingName, { color: colors.textPrimary }]}>{friend.name}</Text>
                    <Pressable
                      style={[styles.inviteBtn, { backgroundColor: colors.primary }]}
                      onPress={async () => {
                        await inviteMutation.mutateAsync({ pactId: pact.id, userIds: [friend.id] });
                      }}
                      disabled={inviteMutation.isPending}
                    >
                      <Text style={styles.inviteBtnText}>Invite</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            );
          })()}
        </View>

        {/* Pact Streak Calendar (unified — everyone must complete) */}
        {pactStreak && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pact Streak</Text>
            <View style={[styles.calendarCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <CalendarGrid
                completedDates={pactStreak.completedDates}
                color={pactColor}
              />
              <View style={[styles.streakStats, { borderTopColor: colors.border }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{pactStreak.currentStreak}</Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Current</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{pactStreak.longestStreak}</Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Longest</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{pactStreak.completedDates.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Total</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent Submissions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Submissions</Text>
          <View style={styles.photoGrid}>
            {submissions.slice(0, 6).map((sub) => (
              <Pressable key={sub.id} onPress={() => setLightboxSubmission(sub)} style={styles.gridPhotoContainer}>
                <Image source={{ uri: sub.photoUri }} style={styles.gridPhoto} resizeMode="cover" />
                {sub.reactions && sub.reactions.length > 0 && (
                  <View style={[styles.reactionIndicator, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Text style={styles.reactionIndicatorText}>
                      {sub.reactions.map(r => r.emoji).join('')}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Group Chat (feature-flagged) */}
        {featureFlags.pactChat && (
          <View style={styles.section}>
            <PactChat pactId={pact.id} />
          </View>
        )}

        {/* Give Up */}
        <View style={styles.giveUpSection}>
          <Text style={[styles.giveUpWarning, { color: colors.textTertiary }]}>
            {(pactStreak?.currentStreak || 0) < 2
              ? 'Not feeling it? You can leave, but consider giving it a few more days.'
              : `Giving up means losing your ${pactStreak?.currentStreak || 0}-day streak${participants.length > 1 ? ' and letting your friends down' : ''}.`}
          </Text>
          <Pressable
            style={[styles.giveUpButton, { borderColor: colors.error }, givingUp && styles.disabled]}
            onPress={handleGiveUp}
            disabled={givingUp}
          >
            {givingUp ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Ionicons name="flag-outline" size={16} color={colors.error} />
                <Text style={[styles.giveUpText, { color: colors.error }]}>Give Up</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Photo Lightbox */}
      <Modal visible={!!lightboxSubmission} transparent animationType="fade" onRequestClose={() => setLightboxSubmission(null)}>
        <Pressable style={styles.lightboxOverlay} onPress={() => setLightboxSubmission(null)}>
          <Pressable style={styles.lightboxClose} onPress={() => setLightboxSubmission(null)}>
            <Ionicons name="close" size={28} color={colors.overlayTextPrimary} />
          </Pressable>
          {lightboxSubmission && (
            <>
              <Image source={{ uri: lightboxSubmission.photoUri }} style={styles.lightboxImage} resizeMode="contain" />
              {lightboxSubmission.user && (
                <View style={styles.lightboxUser}>
                  <Avatar uri={lightboxSubmission.user.avatar} name={lightboxSubmission.user.name} size={24} />
                  <Text style={styles.lightboxUserName}>{lightboxSubmission.user.name}</Text>
                </View>
              )}
              <Pressable onPress={(e) => e.stopPropagation()} style={styles.lightboxReactions}>
                <ReactionBar
                  reactions={lightboxSubmission.reactions || []}
                  onToggle={(emoji) => {
                    toggleReaction.mutate(
                      { submissionId: lightboxSubmission.id, emoji },
                      {
                        onSuccess: (data) => {
                          setLightboxSubmission(prev =>
                            prev ? { ...prev, reactions: data.reactions } : null
                          );
                        },
                      }
                    );
                  }}
                  disabled={toggleReaction.isPending}
                />
              </Pressable>
            </>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const PHOTO_SIZE = (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 2) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  streakNumber: {
    ...typography.h1,
  },
  streakLabel: {
    ...typography.body,
  },
  todayProgressRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  calendarCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridPhotoContainer: {
    position: 'relative',
  },
  gridPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  reactionIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  reactionIndicatorText: {
    fontSize: 10,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 60,
    right: spacing.xl,
    zIndex: 1,
  },
  lightboxImage: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: '60%',
    borderRadius: borderRadius.lg,
  },
  lightboxUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  lightboxUserName: {
    ...typography.bodyBold,
    color: '#fff',
  },
  lightboxReactions: {
    marginTop: spacing.md,
    width: SCREEN_WIDTH - spacing.xl * 2,
  },
  pendingSection: {
    marginTop: spacing.md,
  },
  pendingLabel: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    opacity: 0.6,
  },
  pendingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAvatarText: {
    ...typography.bodyBold,
  },
  pendingName: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.md,
  },
  pendingStatus: {
    ...typography.caption,
  },
  inviteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: spacing.sm,
  },
  inviteToggleText: {
    ...typography.bodyBold,
  },
  inviteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  inviteBtnText: {
    ...typography.captionBold,
    color: '#fff',
  },
  giveUpSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  giveUpWarning: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  giveUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  giveUpText: {
    ...typography.bodyBold,
  },
  disabled: {
    opacity: 0.5,
  },
});
