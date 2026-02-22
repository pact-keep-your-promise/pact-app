import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/contexts/DataContext';
import { api } from '@/api/client';
import IconBadge from '@/components/ui/IconBadge';
import { Notification } from '@/data/types';
import { adaptColor } from '@/utils/colorUtils';

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { notifications: dataNotifications, refetch, acceptInvitation, declineInvitation } = useData();

  const iconMap = useMemo<Record<Notification['type'], { icon: string; color: string }>>(() => ({
    nudge:            { icon: 'hand-left', color: adaptColor('#4ECDC4', isDark) },
    deadline_warning: { icon: 'alarm',     color: adaptColor('#FF6B6B', isDark) },
    streak_milestone: { icon: 'trophy',    color: adaptColor('#FFE66D', isDark) },
    new_submission:   { icon: 'camera',    color: adaptColor('#95E1D3', isDark) },
    pact_invitation:  { icon: 'mail',      color: adaptColor('#7C5CFC', isDark) },
  }), [isDark]);

  const [notificationsList, setNotificationsList] = useState(dataNotifications);

  // Refetch data whenever the notifications screen is focused
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  React.useEffect(() => {
    setNotificationsList(dataNotifications);
  }, [dataNotifications]);

  const markAllRead = useCallback(async () => {
    setNotificationsList((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    try {
      await api.put('/notifications/read');
      await refetch();
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const { icon, color } = iconMap[item.type];

      return (
        <View
          style={[
            styles.row,
            {
              backgroundColor: item.read
                ? colors.background
                : colors.backgroundSecondary,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <IconBadge icon={icon} color={color} size={44} />
          <View style={styles.content}>
            <Text
              style={[
                styles.message,
                { color: colors.textPrimary },
                !item.read && styles.messageBold,
              ]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text style={[styles.time, { color: colors.textTertiary }]}>
              {timeAgo(item.timestamp)}
            </Text>
            {item.type === 'pact_invitation' && !item.read && (
              <View style={styles.invitationActions}>
                <Pressable
                  style={[styles.acceptBtn, { backgroundColor: colors.success }]}
                  onPress={() => acceptInvitation(item.id).catch(console.error)}
                >
                  <Ionicons name="checkmark" size={16} color={colors.onSuccess} />
                  <Text style={[styles.actionText, { color: colors.onSuccess }]}>Join</Text>
                </Pressable>
                <Pressable
                  style={[styles.declineBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                  onPress={() => declineInvitation(item.id).catch(console.error)}
                >
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>Decline</Text>
                </Pressable>
              </View>
            )}
          </View>
          {!item.read && item.type !== 'pact_invitation' && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
      );
    },
    [colors, iconMap, acceptInvitation, declineInvitation]
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
        <Pressable onPress={markAllRead} style={styles.markAllButton}>
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
        </Pressable>
      </View>

      {/* Notification List */}
      <FlatList
        data={notificationsList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notificationsList.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              All caught up!
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              No notifications yet
            </Text>
          </View>
        }
      />
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
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    ...typography.body,
  },
  title: {
    ...typography.h3,
  },
  markAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  markAllText: {
    ...typography.caption,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  message: {
    ...typography.body,
  },
  messageBold: {
    fontWeight: '600',
  },
  time: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
