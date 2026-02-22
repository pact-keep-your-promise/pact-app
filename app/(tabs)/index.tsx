import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, Pressable } from 'react-native';
import Logo from '@/components/ui/Logo';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDataHelpers } from '@/api/helpers';
import { usePacts, useNotifications } from '@/api/queries';
import { queryKeys } from '@/api/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import PactCard from '@/components/pacts/PactCard';
import ActivityFeed from '@/components/pacts/ActivityFeed';
import DeadlineWarning from '@/components/pacts/DeadlineWarning';
import EmptyState from '@/components/shared/EmptyState';
import HomeSkeleton from '@/components/shared/HomeSkeleton';

const NEXT_MODE: Record<string, 'light' | 'dark'> = {
  system: 'light',
  light: 'dark',
  dark: 'light',
};

export default function PactsHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark, mode, setMode } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: pacts = [], isLoading: loading } = usePacts();
  const { data: notifications = [] } = useNotifications();
  const { getUnreadNotificationCount } = useDataHelpers();
  const [showWarning, setShowWarning] = useState(true);

  // Refetch data whenever the home screen is focused
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.recent });
    }, [queryClient])
  );

  const deadlineWarning = notifications.find(n => n.type === 'deadline_warning' && !n.read);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Logo color={colors.textPrimary} />
            <Text style={[styles.greeting, { color: colors.textTertiary }]}>Keep your promises</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[styles.themeToggle, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
              onPress={() => setMode(NEXT_MODE[mode])}
            >
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={[styles.themeToggle, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
              {getUnreadNotificationCount() > 0 && (
                <View style={[styles.bellDot, { backgroundColor: colors.error }]} />
              )}
            </Pressable>
            <Pressable style={styles.profileButton} onPress={() => router.push('/profile')}>
              <Image source={{ uri: user?.avatar }} style={[styles.profileAvatar, { borderColor: colors.primary }]} />
            </Pressable>
          </View>
        </View>

        {/* Deadline Warning */}
        {showWarning && deadlineWarning && (
          <View>
            <DeadlineWarning
              pactTitle={pacts.find(p => p.id === deadlineWarning.pactId)?.title || 'Pact'}
              hoursLeft={Math.max(1, Math.round((new Date(deadlineWarning.timestamp).getTime() - Date.now()) / 3600000))}
              onDismiss={() => setShowWarning(false)}
            />
          </View>
        )}

        {loading ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* Activity Feed */}
            <View>
              <ActivityFeed />
            </View>

            {/* Pacts List */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Pacts</Text>
              <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>{pacts.length} active</Text>
            </View>

            {pacts.length > 0 ? (
              pacts.map((pact) => (
                <View key={pact.id}>
                  <PactCard pact={pact} onPress={() => router.push(`/pact/${pact.id}`)} />
                </View>
              ))
            ) : (
              <EmptyState
                icon="people"
                title="No pacts yet"
                subtitle="Create your first pact and invite friends to join"
                actionLabel="Create Pact"
                onAction={() => router.push('/(tabs)/new-pact')}
              />
            )}
          </>
        )}

        <View style={{ height: layout.tabBarClearance }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  themeToggle: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  greeting: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  profileButton: {
    position: 'relative',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
  },
  sectionCount: {
    ...typography.caption,
  },
});
