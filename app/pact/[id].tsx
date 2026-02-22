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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { adaptColor } from '@/utils/colorUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import PactDetailHeader from '@/components/pacts/PactDetailHeader';
import ParticipantRow from '@/components/pacts/ParticipantRow';
import CalendarGrid from '@/components/streaks/CalendarGrid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const { user } = useAuth();
  const { getPactById, getParticipants, getStreakForUserPact, fetchSubmissions, leavePact } = useData();

  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const pact = getPactById(id);

  React.useEffect(() => {
    if (id) {
      fetchSubmissions(id).then(setSubmissions).catch(console.error);
    }
  }, [id]);

  if (!pact) return null;
  const pactColor = adaptColor(pact.color, isDark);

  const participants = getParticipants(pact);
  const myStreak = getStreakForUserPact(pact.id, user?.id || '');

  const handleGiveUp = async () => {
    const streakCount = myStreak?.currentStreak || 0;
    const hasFriends = participants.length > 1;
    const confirmMessage = hasFriends
      ? `Are you sure you want to give up? Your friends are counting on you! You'll lose your ${streakCount}-day streak and leave the pact.`
      : `Are you sure you want to give up? You'll lose your ${streakCount}-day streak and all progress on this pact.`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
      try {
        await leavePact(pact.id);
        router.replace('/');
      } catch (e: any) {
        window.alert(e.message || 'Failed to leave pact');
      }
    } else {
      Alert.alert(
        'Give Up?',
        confirmMessage,
        [
          { text: 'Keep Going!', style: 'cancel' },
          {
            text: 'I Give Up',
            style: 'destructive',
            onPress: async () => {
              try {
                await leavePact(pact.id);
                router.replace('/');
              } catch (e: any) {
                Alert.alert('Error', e.message || 'Failed to leave pact');
              }
            },
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
            <Ionicons name="flame" size={22} color={pactColor} />
            <Text style={[styles.streakNumber, { color: pactColor }]}>{myStreak?.currentStreak || 0}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              {myStreak?.streakType === 'weekly' ? 'week' : 'day'} streak
            </Text>
          </View>
        </PactDetailHeader>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Participants</Text>
          {participants.map((u) => (
            <ParticipantRow key={u.id} user={u} pact={pact} onNudge={() => {}} />
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
        </View>

        {/* My Streak Calendar */}
        {myStreak && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Streak</Text>
            <View style={[styles.calendarCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <CalendarGrid
                completedDates={myStreak.completedDates}
                color={pactColor}
              />
              <View style={[styles.streakStats, { borderTopColor: colors.border }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{myStreak.currentStreak}</Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Current</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{myStreak.longestStreak}</Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Longest</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{myStreak.completedDates.length}</Text>
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
              <Pressable key={sub.id} onPress={() => setLightboxUri(sub.photoUri)}>
                <Image source={{ uri: sub.photoUri }} style={styles.gridPhoto} resizeMode="cover" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Give Up */}
        <View style={styles.giveUpSection}>
          <Text style={[styles.giveUpWarning, { color: colors.textTertiary }]}>
            Giving up means losing your {myStreak?.currentStreak || 0}-day streak{participants.length > 1 ? ' and letting your friends down' : ''}.
          </Text>
          <Pressable
            style={[styles.giveUpButton, { borderColor: colors.error }]}
            onPress={handleGiveUp}
          >
            <Ionicons name="flag-outline" size={16} color={colors.error} />
            <Text style={[styles.giveUpText, { color: colors.error }]}>Give Up</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Photo Lightbox */}
      <Modal visible={!!lightboxUri} transparent animationType="fade" onRequestClose={() => setLightboxUri(null)}>
        <Pressable style={styles.lightboxOverlay} onPress={() => setLightboxUri(null)}>
          <Pressable style={styles.lightboxClose} onPress={() => setLightboxUri(null)}>
            <Ionicons name="close" size={28} color={colors.overlayTextPrimary} />
          </Pressable>
          {lightboxUri && (
            <Image source={{ uri: lightboxUri }} style={styles.lightboxImage} resizeMode="contain" />
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
  gridPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
    height: '80%',
    borderRadius: borderRadius.lg,
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
});
