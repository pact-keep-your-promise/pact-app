import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDataHelpers } from '@/api/helpers';
import { useUserSearch, useFriendRequests } from '@/api/queries';
import { useSendFriendRequest, useAcceptFriendRequest, useDeclineFriendRequest, useUpdateAvatar, useDeleteAccount } from '@/api/mutations';
import { useToast } from '@/contexts/ToastContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { isPushSupported, isSubscribedToPush, subscribeToPush, unsubscribeFromPush, getPushPermission } from '@/api/pushSubscription';

function useDebouncedValue(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const NEXT_MODE: Record<string, 'light' | 'dark'> = {
  system: 'light',
  light: 'dark',
  dark: 'light',
};

const FRIEND_AVATAR_SIZE = 64;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark, mode, setMode } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { users: friends, pacts, streaks: streakData, recentActivity } = useDataHelpers();
  const [signingOut, setSigningOut] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const updateAvatar = useUpdateAvatar();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery);
  const [showSearch, setShowSearch] = useState(false);
  const { data: searchResults = [], isFetching: searching } = useUserSearch(debouncedQuery);
  const { data: friendRequests = [] } = useFriendRequests();

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const deleteAccount = useDeleteAccount();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  // Push notification state (web only)
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushDenied, setPushDenied] = useState(false);
  const pushSupported = Platform.OS === 'web' && isPushSupported();

  useEffect(() => {
    if (!pushSupported) return;
    isSubscribedToPush().then(setPushEnabled);
    setPushDenied(getPushPermission() === 'denied');
  }, []);

  // Stats
  const totalPacts = pacts.length;
  const totalStreakDays = streakData
    .filter((s) => s.userId === user?.id)
    .reduce((sum, s) => sum + s.currentStreak, 0);
  const totalVerifications = recentActivity.filter((s) => s.userId === user?.id).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </Pressable>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <Pressable
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (result.canceled || !result.assets[0]) return;
              setUploadingAvatar(true);
              try {
                const { avatar } = await updateAvatar.mutateAsync(result.assets[0].uri);
                updateUser({ avatar });
              } catch (e) {
                console.error('Avatar upload failed:', e);
                if (Platform.OS === 'web') {
                  window.alert('Failed to upload avatar. Please try again.');
                }
              } finally {
                setUploadingAvatar(false);
              }
            }}
            style={styles.avatarWrapper}
          >
            <Avatar
              uri={user?.avatar || ''}
              name={user?.name || ''}
              size={80}
            />
            {uploadingAvatar ? (
              <View style={[styles.avatarBadge, { backgroundColor: colors.backgroundSecondary }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            )}
          </Pressable>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>
            {user?.name}
          </Text>
          <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>
            @{user?.username}
          </Text>
          {!!user?.bio && (
            <Text style={[styles.profileBio, { color: colors.textSecondary }]} numberOfLines={3}>
              {user.bio}
            </Text>
          )}
          <Pressable
            style={[styles.editProfileBtn, { borderColor: colors.border }]}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.primary} />
            <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{totalPacts}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pacts</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{totalStreakDays}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak Days</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{totalVerifications}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Verifications</Text>
          </View>
        </View>

        {/* Settings section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        {/* Theme toggle row */}
        <Pressable
          style={[styles.settingsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          onPress={() => setMode(NEXT_MODE[mode])}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Appearance</Text>
          </View>
          <Text style={[styles.settingsValue, { color: colors.textTertiary }]}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        </Pressable>

        {/* Notifications row */}
        <Pressable
          style={[styles.settingsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, marginTop: spacing.sm }]}
          onPress={() => router.push('/notifications')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>

        {/* Legal links */}
        <Pressable
          style={[styles.settingsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, marginTop: spacing.sm }]}
          onPress={() => router.push('/legal?tab=terms')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>

        <Pressable
          style={[styles.settingsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, marginTop: spacing.sm }]}
          onPress={() => router.push('/legal?tab=privacy')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>

        {/* Push notifications toggle (web only) */}
        {pushSupported && (
          <Pressable
            style={[styles.settingsRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, marginTop: spacing.sm }]}
            onPress={async () => {
              if (pushDenied) {
                window.alert('Push notifications are blocked. Please enable them in your browser settings and reload the page.');
                return;
              }
              try {
                if (pushEnabled) {
                  await unsubscribeFromPush();
                  setPushEnabled(false);
                } else {
                  const success = await subscribeToPush();
                  if (success) {
                    setPushEnabled(true);
                  } else {
                    setPushDenied(getPushPermission() === 'denied');
                    if (getPushPermission() === 'denied') {
                      window.alert('Push notifications were denied. Please enable them in your browser settings.');
                    } else {
                      window.alert('Failed to enable push notifications. Please try again.');
                    }
                  }
                }
              } catch (e) {
                console.error('[Push] Toggle error:', e);
                window.alert('Failed to update push notifications. Check console for details.');
              }
            }}
          >
            <View style={styles.settingsRowLeft}>
              <Ionicons name="notifications" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Push Notifications</Text>
            </View>
            <Text style={[styles.settingsValue, { color: pushDenied ? colors.error : pushEnabled ? colors.success : colors.textTertiary }]}>
              {pushDenied ? 'Blocked' : pushEnabled ? 'On' : 'Off'}
            </Text>
          </Pressable>
        )}

        {/* Friends section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Friends{friends.length > 0 ? ` (${friends.length})` : ''}
            </Text>
            <Pressable onPress={() => setShowSearch(!showSearch)}>
              <Ionicons name={showSearch ? 'close' : 'person-add'} size={22} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Friend requests */}
        {friendRequests.length > 0 && (
          <View style={[styles.requestsContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Text style={[styles.requestsTitle, { color: colors.textSecondary }]}>
              Friend Requests ({friendRequests.length})
            </Text>
            {friendRequests.map((req) => (
              <View key={req.friendshipId} style={styles.requestRow}>
                <Image source={{ uri: req.avatar }} style={styles.requestAvatar} />
                <View style={styles.requestInfo}>
                  <Text style={[styles.requestName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {req.name}
                  </Text>
                  <Text style={[styles.requestUsername, { color: colors.textTertiary }]} numberOfLines={1}>
                    @{req.username}
                  </Text>
                </View>
                <Pressable
                  style={[styles.requestBtn, { backgroundColor: colors.primary }]}
                  onPress={() => acceptRequest.mutate(req.friendshipId)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </Pressable>
                <Pressable
                  style={[styles.requestBtn, { backgroundColor: colors.border }]}
                  onPress={() => declineRequest.mutate(req.friendshipId)}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Search UI */}
        {showSearch && (
          <View style={styles.searchSection}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Search by name or username..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoFocus
            />
            {searching && <ActivityIndicator style={styles.searchLoading} color={colors.primary} />}
            {searchResults.map((result) => (
              <View key={result.id} style={[styles.searchRow, { borderColor: colors.border }]}>
                <Image source={{ uri: result.avatar }} style={styles.searchAvatar} />
                <View style={styles.searchInfo}>
                  <Text style={[styles.searchName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {result.name}
                  </Text>
                  <Text style={[styles.searchUsername, { color: colors.textTertiary }]} numberOfLines={1}>
                    @{result.username}
                  </Text>
                </View>
                {result.friendshipStatus === 'accepted' ? (
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.statusText, { color: colors.success }]}>Friends</Text>
                  </View>
                ) : result.friendshipStatus === 'pending' && result.friendshipDirection === 'outgoing' ? (
                  <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
                    <Text style={[styles.statusText, { color: colors.textTertiary }]}>Pending</Text>
                  </View>
                ) : result.friendshipStatus === 'pending' && result.friendshipDirection === 'incoming' ? (
                  <Pressable
                    style={[styles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={() => result.friendshipId && acceptRequest.mutate(result.friendshipId)}
                  >
                    <Text style={styles.addBtnText}>Accept</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={() => sendRequest.mutate(result.id)}
                    disabled={sendRequest.isPending}
                  >
                    <Ionicons name="person-add" size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </Pressable>
                )}
              </View>
            ))}
            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <Text style={[styles.noResults, { color: colors.textTertiary }]}>No users found</Text>
            )}
          </View>
        )}

        {/* Friends list */}
        {friends.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsScroll}
          >
            {friends.map((friend) => {
              const firstName = friend.name.split(' ')[0];
              return (
                <Pressable key={friend.id} style={styles.friendItem} onPress={() => router.push(`/user/${friend.id}`)}>
                  <Image
                    source={{ uri: friend.avatar }}
                    style={styles.friendAvatar}
                  />
                  <Text
                    style={[styles.friendName, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {firstName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : !showSearch ? (
          <Pressable
            style={[styles.emptyFriends, { borderColor: colors.border }]}
            onPress={() => setShowSearch(true)}
          >
            <Ionicons name="people-outline" size={32} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No friends yet. Tap to search and add friends!
            </Text>
          </Pressable>
        ) : null}

        {/* Sign out button */}
        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            variant="ghost"
            icon="log-out-outline"
            loading={signingOut}
            onPress={() => {
              const doLogout = async () => {
                setSigningOut(true);
                await logout();
              };
              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to sign out?')) {
                  doLogout();
                }
              } else {
                const { Alert } = require('react-native');
                Alert.alert('Sign Out', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: doLogout },
                ]);
              }
            }}
            fullWidth
          />
        </View>

        {/* Delete Account */}
        <View style={styles.deleteContainer}>
          <Pressable
            style={[styles.deleteBtn, { borderColor: colors.error }]}
            disabled={deleting}
            onPress={() => {
              const doDelete = async () => {
                setDeleting(true);
                try {
                  await deleteAccount.mutateAsync();
                  await logout();
                } catch (e: any) {
                  setDeleting(false);
                  showToast(e.message || 'Failed to delete account', 'error');
                }
              };

              if (Platform.OS === 'web') {
                if (!window.confirm('Delete your account?\n\nThis will permanently delete ALL your data including pacts, submissions, streaks, and friendships. This action cannot be undone.')) return;
                if (!window.confirm('Are you absolutely sure?\n\nThis is your last chance. All your data will be permanently deleted.')) return;
                if (!window.confirm('Final confirmation: Type-confirm delete.\n\nOnce deleted, there is no way to recover your account or data. Proceed?')) return;
                doDelete();
              } else {
                const { Alert } = require('react-native');
                Alert.alert(
                  'Delete Account?',
                  'This will permanently delete ALL your data including pacts, submissions, streaks, and friendships. This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete Account',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert(
                          'Are you absolutely sure?',
                          'This is your last chance. All your data will be permanently deleted.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Yes, Delete Everything',
                              style: 'destructive',
                              onPress: doDelete,
                            },
                          ]
                        );
                      },
                    },
                  ]
                );
              }
            }}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={[styles.deleteText, { color: colors.error }]}>Delete Account</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={{ height: spacing.huge }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  backText: {
    ...typography.body,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileName: {
    ...typography.h2,
    marginTop: spacing.md,
  },
  profileUsername: {
    ...typography.caption,
    marginTop: spacing.xs,
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
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h3,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingsLabel: {
    ...typography.body,
  },
  settingsValue: {
    ...typography.caption,
  },
  // Friend requests
  requestsContainer: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  requestsTitle: {
    ...typography.captionBold,
    marginBottom: spacing.sm,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    ...typography.bodyBold,
  },
  requestUsername: {
    ...typography.caption,
  },
  requestBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Search
  searchSection: {
    marginBottom: spacing.md,
  },
  searchInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  searchLoading: {
    marginTop: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  searchAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  searchInfo: {
    flex: 1,
  },
  searchName: {
    ...typography.bodyBold,
  },
  searchUsername: {
    ...typography.caption,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addBtnText: {
    ...typography.captionBold,
    color: '#fff',
  },
  noResults: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  // Friends list
  friendsScroll: {
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  friendItem: {
    alignItems: 'center',
    width: FRIEND_AVATAR_SIZE + spacing.md,
  },
  friendAvatar: {
    width: FRIEND_AVATAR_SIZE,
    height: FRIEND_AVATAR_SIZE,
    borderRadius: FRIEND_AVATAR_SIZE / 2,
  },
  friendName: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyFriends: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  profileBio: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  editProfileText: {
    ...typography.captionBold,
  },
  signOutContainer: {
    marginTop: spacing.xxxl,
  },
  deleteContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  deleteText: {
    ...typography.bodyBold,
  },
});
