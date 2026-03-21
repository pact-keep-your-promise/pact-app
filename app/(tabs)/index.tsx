import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Logo from '@/components/ui/Logo';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDataHelpers } from '@/api/helpers';
import { usePacts, useFlatNotifications } from '@/api/queries';
import { queryKeys } from '@/api/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import PactCard from '@/components/pacts/PactCard';
import ActivityFeed from '@/components/pacts/ActivityFeed';
import DeadlineWarning from '@/components/pacts/DeadlineWarning';
import EmptyState from '@/components/shared/EmptyState';
import HomeSkeleton from '@/components/shared/HomeSkeleton';
import ErrorState from '@/components/shared/ErrorState';

const HEADER_HEIGHT = 64;

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
  const { data: pacts = [], isLoading: loading, isError, refetch } = usePacts();
  const { data: notifications = [] } = useFlatNotifications();
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

  const headerContent = (
    <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
      <Logo color={colors.textPrimary} width={78} height={40} />
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
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      {Platform.OS === 'web' ? (
        <View style={{ position: 'absolute' as any, top: 0, left: 0, right: 0, zIndex: 10, paddingTop: Math.max(insets.top, spacing.xs), backgroundColor: colors.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
          {headerContent}
        </View>
      ) : (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.stickyHeader, { borderBottomColor: colors.border }]}
        >
          {headerContent}
        </BlurView>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_HEIGHT + Math.max(insets.top, spacing.xs) }]}
      >
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
        ) : isError ? (
          <ErrorState message="Couldn't load your pacts" onRetry={() => refetch()} />
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
    paddingHorizontal: spacing.xxl,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: HEADER_HEIGHT,
    paddingVertical: spacing.sm,
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
