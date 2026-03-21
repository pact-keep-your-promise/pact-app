import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from './client';
import { queryKeys } from './queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { User, Pact, Submission, StreakData, Notification, ChatMessage, UserProfile } from '@/data/types';

export interface PactWithDetails extends Pact {
  participantDetails?: User[];
}

/** Paginated response shape from the backend */
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
}

export function usePacts() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.pacts.all,
    queryFn: () => api.get<PactWithDetails[]>('/pacts'),
    enabled: !!token,
  });
}

export function useUsers() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => api.get<User[]>('/users'),
    enabled: !!token,
  });
}

export function useStreaks() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.streaks.all,
    queryFn: () => api.get<StreakData[]>('/streaks'),
    enabled: !!token,
  });
}

// ─── Paginated: Notifications ────────────────────────────────────────────────

export function useNotifications(limit = 20) {
  const { token } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (pageParam) params.set('before', pageParam);
      return api.get<PaginatedResponse<Notification>>(`/notifications?${params}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.data.length > 0
        ? lastPage.data[lastPage.data.length - 1].timestamp
        : undefined,
    enabled: !!token,
  });
}

/** Flat helper — returns all loaded notifications across pages */
export function useFlatNotifications(limit = 20) {
  const query = useNotifications(limit);
  const flatData = query.data?.pages.flatMap((p) => p.data) ?? [];
  return {
    data: flatData,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Simple count query — doesn't need pagination */
export function useUnreadNotificationCount() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => api.get<{ count: number }>('/notifications/unread-count'),
    enabled: !!token,
  });
}

// ─── Paginated: Pact Submissions ─────────────────────────────────────────────

export function usePactSubmissions(pactId: string, limit = 20) {
  const { token } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.pacts.submissions(pactId),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (pageParam) params.set('before', pageParam);
      return api.get<PaginatedResponse<Submission & { user?: User }>>(`/pacts/${pactId}/submissions?${params}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.data.length > 0
        ? lastPage.data[lastPage.data.length - 1].timestamp
        : undefined,
    enabled: !!token && !!pactId,
  });
}

/** Flat helper — returns all loaded submissions across pages */
export function useFlatPactSubmissions(pactId: string, limit = 20) {
  const query = usePactSubmissions(pactId, limit);
  const flatData = query.data?.pages.flatMap((p) => p.data) ?? [];
  return {
    data: flatData,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Paginated: Recent Activity ──────────────────────────────────────────────

export function useRecentActivity(limit = 10) {
  const { token } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.submissions.recent,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (pageParam) params.set('before', pageParam);
      return api.get<PaginatedResponse<Submission & { user: User; pact: Pact }>>(`/submissions/recent?${params}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.data.length > 0
        ? lastPage.data[lastPage.data.length - 1].timestamp
        : undefined,
    enabled: !!token,
  });
}

/** Flat helper — returns all loaded recent activity across pages */
export function useFlatRecentActivity(limit = 10) {
  const query = useRecentActivity(limit);
  const flatData = query.data?.pages.flatMap((p) => p.data) ?? [];
  return {
    data: flatData,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Non-paginated queries ───────────────────────────────────────────────────

export function useStreakActivity() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.streaks.activity,
    queryFn: () => api.get<Record<string, number>>('/streaks/activity'),
    enabled: !!token,
  });
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  avatar: string;
  friendshipStatus: 'none' | 'pending' | 'accepted' | 'declined';
  friendshipDirection: 'outgoing' | 'incoming' | null;
  friendshipId: string | null;
}

export interface FriendRequest {
  friendshipId: string;
  id: string;
  name: string;
  username: string;
  avatar: string;
  createdAt: string;
}

export function useUserSearch(query: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.search(query),
    queryFn: () => api.get<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(query)}`),
    enabled: !!token && query.length >= 2,
  });
}

export function useFriendRequests() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.friendRequests,
    queryFn: () => api.get<FriendRequest[]>('/users/friend-requests'),
    enabled: !!token,
  });
}

export function useUserProfile(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => api.get<UserProfile>(`/users/${userId}/profile`),
    enabled: !!token && !!userId,
  });
}

export function usePactMessages(pactId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.messages.forPact(pactId),
    queryFn: () => api.get<{ messages: ChatMessage[]; hasMore: boolean }>(`/pacts/${pactId}/messages`),
    enabled: !!token && !!pactId,
  });
}
