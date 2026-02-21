import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

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
  const { user, logout } = useAuth();
  const { users, pacts, streaks: streakData, recentActivity } = useData();

  const friends = users;

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
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </Pressable>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <Avatar
            uri={user?.avatar || ''}
            name={user?.name || ''}
            size={80}
          />
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>
            {user?.name}
          </Text>
          <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>
            @{user?.username}
          </Text>
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

        {/* Friends section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Friends</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsScroll}
        >
          {friends.map((friend) => {
            const firstName = friend.name.split(' ')[0];
            return (
              <View key={friend.id} style={styles.friendItem}>
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
              </View>
            );
          })}
        </ScrollView>

        {/* Sign out button */}
        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            variant="ghost"
            icon="log-out-outline"
            onPress={() => {
              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to sign out?')) {
                  logout();
                }
              } else {
                const { Alert } = require('react-native');
                Alert.alert('Sign Out', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: logout },
                ]);
              }
            }}
            fullWidth
          />
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
  signOutContainer: {
    marginTop: spacing.xxxl,
  },
});
