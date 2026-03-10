import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { useFlatPactSubmissions } from '@/api/queries';
import { useLeavePact, useNudge, useInviteToPact, useToggleReaction, useUpdatePact } from '@/api/mutations';
import { useUsers } from '@/api/queries';
import { Submission, ReactionSummary } from '@/data/types';
import Avatar from '@/components/ui/Avatar';
import PactDetailHeader from '@/components/pacts/PactDetailHeader';
import ParticipantRow from '@/components/pacts/ParticipantRow';
import CalendarGrid from '@/components/streaks/CalendarGrid';
import StreakFlame from '@/components/streaks/StreakFlame';
import MilestoneBadge from '@/components/streaks/MilestoneBadge';
import TodayProgress from '@/components/streaks/TodayProgress';
import WeeklyProgressBar from '@/components/streaks/WeeklyProgressBar';
import ReactionBar from '@/components/shared/ReactionBar';
import StreakFreezeInfo from '@/components/streaks/StreakFreezeInfo';
import IconSelector from '@/components/create/IconSelector';
import FrequencyPicker from '@/components/create/FrequencyPicker';
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
  const {
    data: submissions,
    fetchNextPage: fetchMoreSubmissions,
    hasNextPage: hasMoreSubmissions,
    isFetchingNextPage: isFetchingMoreSubmissions,
  } = useFlatPactSubmissions(id);
  const leavePactMutation = useLeavePact();
  const nudgeMutation = useNudge();
  const inviteMutation = useInviteToPact();
  const toggleReaction = useToggleReaction();
  const updatePactMutation = useUpdatePact();
  const { data: friends = [] } = useUsers();

  // Subscribe to real-time updates for this pact
  usePactSocket(id);

  const [showInvite, setShowInvite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editIcon, setEditIcon] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('');
  const [editFrequency, setEditFrequency] = useState<'daily' | 'weekly'>('daily');
  const [editTimesPerWeek, setEditTimesPerWeek] = useState(3);

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

  const openEditModal = () => {
    setEditTitle(pact.title);
    setEditIcon(pact.icon);
    setEditColor(pact.color);
    setEditFrequency(pact.frequency);
    setEditTimesPerWeek(pact.timesPerWeek || 3);
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      if (Platform.OS === 'web') window.alert('Title cannot be empty');
      else Alert.alert('Error', 'Title cannot be empty');
      return;
    }
    if (!editIcon) {
      if (Platform.OS === 'web') window.alert('Please select an icon');
      else Alert.alert('Error', 'Please select an icon');
      return;
    }

    const updates: any = { pactId: pact.id };
    if (editTitle.trim() !== pact.title) updates.title = editTitle.trim();
    if (editIcon !== pact.icon) updates.icon = editIcon;
    if (editColor !== pact.color) updates.color = editColor;

    const canEditFrequency = (pactStreak?.currentStreak || 0) === 0;
    if (canEditFrequency) {
      if (editFrequency !== pact.frequency) updates.frequency = editFrequency;
      if (editFrequency === 'weekly' && editTimesPerWeek !== pact.timesPerWeek) updates.timesPerWeek = editTimesPerWeek;
    }

    // Only send if there are actual changes
    if (Object.keys(updates).length <= 1) {
      setShowEdit(false);
      return;
    }

    try {
      await updatePactMutation.mutateAsync(updates);
      setShowEdit(false);
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert(e.message || 'Failed to update pact');
      else Alert.alert('Error', e.message || 'Failed to update pact');
    }
  };

  const canEditFrequency = (pactStreak?.currentStreak || 0) === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button + Edit */}
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
          </Pressable>
          <Pressable style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="pencil" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

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
          {pactStreak?.weeklyProgress ? (
            <View style={styles.todayProgressRow}>
              <WeeklyProgressBar
                progress={pactStreak.weeklyProgress}
                color={pactColor}
                centered
              />
            </View>
          ) : pactStreak?.todayStatus ? (
            <View style={styles.todayProgressRow}>
              <TodayProgress
                completed={pactStreak.todayStatus.completed}
                total={pactStreak.todayStatus.total}
                color={pactColor}
                centered
              />
            </View>
          ) : null}
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

        {/* Streak Freeze */}
        {pactStreak?.freezeInfo && (
          <View style={styles.section}>
            <StreakFreezeInfo freezeInfo={pactStreak.freezeInfo} color={pactColor} />
          </View>
        )}

        {/* Pact Streak Calendar (unified — everyone must complete) */}
        {pactStreak && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pact Streak</Text>
            <View style={[styles.calendarCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <CalendarGrid
                completedDates={pactStreak.completedDates}
                freezeDates={pactStreak.freezeInfo?.freezeDates}
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

        {/* Submissions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Submissions
          </Text>
          <View style={styles.photoGrid}>
            {submissions.map((sub) => (
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
          {hasMoreSubmissions && (
            <Pressable
              onPress={() => fetchMoreSubmissions()}
              disabled={isFetchingMoreSubmissions}
              style={[styles.loadMoreBtn, { borderColor: colors.border }]}
            >
              {isFetchingMoreSubmissions ? (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              ) : (
                <Text style={[styles.loadMoreText, { color: colors.textSecondary }]}>Load more</Text>
              )}
            </Pressable>
          )}
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

      {/* Edit Pact Modal */}
      <Modal visible={showEdit} transparent animationType="slide" onRequestClose={() => setShowEdit(false)}>
        <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.editModal, { backgroundColor: colors.background }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.textPrimary }]}>Edit Pact</Text>
              <Pressable onPress={() => setShowEdit(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.editScrollContent}>
              {/* Title */}
              <View style={styles.editSection}>
                <Text style={[styles.editLabel, { color: colors.textPrimary }]}>Name</Text>
                <TextInput
                  style={[styles.editInput, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  maxLength={40}
                  placeholder="Pact name"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Icon */}
              <View style={styles.editSection}>
                <Text style={[styles.editLabel, { color: colors.textPrimary }]}>Icon</Text>
                <IconSelector
                  selectedIcon={editIcon}
                  onSelect={(icon, color) => { setEditIcon(icon); setEditColor(color); }}
                />
              </View>

              {/* Frequency */}
              <View style={styles.editSection}>
                <Text style={[styles.editLabel, { color: colors.textPrimary }]}>Frequency</Text>
                {canEditFrequency ? (
                  <FrequencyPicker
                    frequency={editFrequency}
                    timesPerWeek={editTimesPerWeek}
                    onChangeFrequency={setEditFrequency}
                    onChangeTimesPerWeek={setEditTimesPerWeek}
                  />
                ) : (
                  <View>
                    <Text style={[styles.editFreqValue, { color: colors.textSecondary }]}>
                      {pact.frequency === 'daily' ? 'Daily' : `${pact.timesPerWeek}x per week`}
                    </Text>
                    <Text style={[styles.editFreqHint, { color: colors.textTertiary }]}>
                      Streak must be 0 to change frequency
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Save Button */}
            <Pressable
              style={[styles.editSaveBtn, { backgroundColor: colors.primary }, updatePactMutation.isPending && styles.disabled]}
              onPress={handleSaveEdit}
              disabled={updatePactMutation.isPending}
            >
              {updatePactMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.editSaveBtnText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  editButton: {
    padding: spacing.sm,
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
  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  loadMoreText: {
    ...typography.caption,
    fontWeight: '600',
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
  editOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  editModal: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '85%',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  editModalTitle: {
    ...typography.h2,
  },
  editScrollContent: {
    flexGrow: 0,
  },
  editSection: {
    marginBottom: spacing.xl,
  },
  editLabel: {
    ...typography.bodyBold,
    marginBottom: spacing.md,
  },
  editInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body,
  },
  editFreqValue: {
    ...typography.body,
  },
  editFreqHint: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  editSaveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  editSaveBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});
