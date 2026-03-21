import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useFlatNotifications, useFriendRequests } from '@/api/queries';
import { useMarkNotificationsRead, useAcceptInvitation, useDeclineInvitation, useAcceptFriendRequest, useDeclineFriendRequest } from '@/api/mutations';
import { queryKeys } from '@/api/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import IconBadge from '@/components/ui/IconBadge';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/shared/ErrorState';
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
  const queryClient = useQueryClient();
  const {
    data: dataNotifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useFlatNotifications();
  const markReadMutation = useMarkNotificationsRead();
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const { data: friendRequests = [] } = useFriendRequests();
  const acceptFriend = useAcceptFriendRequest();
  const declineFriend = useDeclineFriendRequest();

  const iconMap = useMemo<Record<string, { icon: string; color: string }>>(() => ({
    nudge:            { icon: 'hand-left',    color: adaptColor('#4ECDC4', isDark) },
    deadline_warning: { icon: 'alarm',        color: adaptColor('#FF6B6B', isDark) },
    streak_milestone: { icon: 'trophy',       color: adaptColor('#FFE66D', isDark) },
    new_submission:   { icon: 'camera',       color: adaptColor('#95E1D3', isDark) },
    pact_invitation:  { icon: 'mail',         color: adaptColor('#7C5CFC', isDark) },
    friend_request:   { icon: 'person-add',   color: adaptColor('#4ECDC4', isDark) },
    friend_accepted:  { icon: 'people',       color: adaptColor('#95E1D3', isDark) },
    pact_declined:    { icon: 'close-circle', color: adaptColor('#FF6B6B', isDark) },
    reaction:         { icon: 'heart',        color: adaptColor('#FF6B6B', isDark) },
    chat_message:     { icon: 'chatbubble',   color: adaptColor('#4ECDC4', isDark) },
  }), [isDark]);

  const [markingRead, setMarkingRead] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Refetch data whenever the notifications screen is focused
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    }, [queryClient])
  );

  const markAllRead = useCallback(async () => {
    setMarkingRead(true);
    try {
      await markReadMutation.mutateAsync();
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
    setMarkingRead(false);
  }, [markReadMutation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const { icon, color } = iconMap[item.type] || { icon: 'notifications', color: colors.textTertiary };

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
                  style={[styles.acceptBtn, { backgroundColor: colors.success }, loadingAction === item.id && styles.disabled]}
                  disabled={loadingAction === item.id}
                  onPress={async () => {
                    setLoadingAction(item.id);
                    try { await acceptMutation.mutateAsync(item.id); } catch (e) { console.error(e); }
                    setLoadingAction(null);
                  }}
                >
                  {loadingAction === item.id ? (
                    <ActivityIndicator size="small" color={colors.onSuccess} />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color={colors.onSuccess} />
                      <Text style={[styles.actionText, { color: colors.onSuccess }]}>Join</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.declineBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }, loadingAction === item.id && styles.disabled]}
                  disabled={loadingAction === item.id}
                  onPress={async () => {
                    setLoadingAction(item.id);
                    try { await declineMutation.mutateAsync(item.id); } catch (e) { console.error(e); }
                    setLoadingAction(null);
                  }}
                >
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>Decline</Text>
                </Pressable>
              </View>
            )}
            {item.type === 'friend_request' && !item.read && (() => {
              const req = friendRequests.find(r => r.id === item.fromUserId);
              if (!req) return null;
              return (
                <View style={styles.invitationActions}>
                  <Pressable
                    style={[styles.acceptBtn, { backgroundColor: colors.success }, loadingAction === item.id && styles.disabled]}
                    disabled={loadingAction === item.id}
                    onPress={async () => {
                      setLoadingAction(item.id);
                      try {
                        await acceptFriend.mutateAsync(req.friendshipId);
                        await markReadMutation.mutateAsync();
                      } catch (e) { console.error(e); }
                      setLoadingAction(null);
                    }}
                  >
                    {loadingAction === item.id ? (
                      <ActivityIndicator size="small" color={colors.onSuccess} />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color={colors.onSuccess} />
                        <Text style={[styles.actionText, { color: colors.onSuccess }]}>Accept</Text>
                      </>
                    )}
                  </Pressable>
                  <Pressable
                    style={[styles.declineBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }, loadingAction === item.id && styles.disabled]}
                    disabled={loadingAction === item.id}
                    onPress={async () => {
                      setLoadingAction(item.id);
                      try {
                        await declineFriend.mutateAsync(req.friendshipId);
                        await markReadMutation.mutateAsync();
                      } catch (e) { console.error(e); }
                      setLoadingAction(null);
                    }}
                  >
                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>Decline</Text>
                  </Pressable>
                </View>
              );
            })()}
          </View>
          {!item.read && item.type !== 'pact_invitation' && item.type !== 'friend_request' && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
      );
    },
    [colors, iconMap, acceptMutation, declineMutation, acceptFriend, declineFriend, friendRequests, markReadMutation, loadingAction]
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.textTertiary} />
      </View>
    );
  }, [isFetchingNextPage, colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
        <Pressable onPress={markAllRead} style={styles.markAllButton} disabled={markingRead}>
          {markingRead ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
          )}
        </Pressable>
      </View>

      {/* Notification List with infinite scroll */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Skeleton width={44} height={44} radius={22} />
              <View style={{ flex: 1, gap: spacing.sm }}>
                <Skeleton width="80%" height={16} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : isError ? (
        <ErrorState message="Couldn't load notifications" onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={dataNotifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          contentContainerStyle={dataNotifications.length === 0 ? styles.emptyContainer : undefined}
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
  disabled: {
    opacity: 0.5,
  },
  footerLoader: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  skeletonContainer: {
    flex: 1,
  },
});
