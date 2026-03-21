import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { api, getToken, getBaseUrl } from './client';
import { queryKeys } from './queryKeys';
import { PactWithDetails } from './queries';

export function useCreatePact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      icon: string;
      color?: string;
      frequency: 'daily' | 'weekly';
      timesPerWeek?: number;
      participants?: string[];
    }) => api.post<PactWithDetails>('/pacts', {
      ...data,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useSubmitPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pactId, photoUri }: { pactId: string; photoUri: string }) => {
      const formData = new FormData();
      formData.append('pactId', pactId);

      if (Platform.OS === 'web') {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        formData.append('photo', blob, 'photo.jpg');
      } else {
        formData.append('photo', {
          uri: photoUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);
      }

      const token = await getToken();
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/submissions`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.streaks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.streaks.activity });
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.recent });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.submissions(variables.pactId) });
    },
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put('/notifications/read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => api.post(`/notifications/${notificationId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.streaks.all });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => api.post(`/notifications/${notificationId}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useLeavePact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pactId: string) => api.post(`/pacts/${pactId}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.streaks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.streaks.activity });
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.recent });
    },
  });
}

export function useNudge() {
  return useMutation({
    mutationFn: ({ pactId, targetUserId }: { pactId: string; targetUserId?: string }) =>
      api.post<{ success: boolean; nudged: string[] }>(`/nudge/${pactId}`, { targetUserId }),
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post('/users/friend-request', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.friendRequests });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: string) => api.post('/users/friend-accept', { friendshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.friendRequests });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useDeclineFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: string) => api.post('/users/friend-decline', { friendshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.friendRequests });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useUpdateAvatar() {
  return useMutation({
    mutationFn: async (photoUri: string) => {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        formData.append('avatar', blob, 'avatar.jpg');
      } else {
        formData.append('avatar', {
          uri: photoUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);
      }

      const token = await getToken();
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/users/me/avatar`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Avatar upload failed');
      }

      return res.json() as Promise<{ avatar: string }>;
    },
  });
}

export function useInviteToPact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pactId, userIds }: { pactId: string; userIds: string[] }) =>
      api.post<{ success: boolean; invited: string[] }>(`/pacts/${pactId}/invite`, { userIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, emoji }: { submissionId: string; emoji: string }) =>
      api.post<{ toggled: 'added' | 'removed'; reactions: any[] }>('/reactions', { submissionId, emoji }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.recent });
      // Also invalidate any pact-specific submissions
      queryClient.invalidateQueries({ queryKey: ['pacts'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pactId, text }: { pactId: string; text: string }) =>
      api.post(`/pacts/${pactId}/messages`, { text }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.forPact(variables.pactId) });
    },
  });
}

export function useUpdatePact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pactId, ...data }: {
      pactId: string;
      title?: string;
      icon?: string;
      color?: string;
      frequency?: 'daily' | 'weekly';
      timesPerWeek?: number;
    }) => api.put<PactWithDetails>(`/pacts/${pactId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.streaks.all });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; username?: string; bio?: string }) =>
      api.put<any>('/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.all });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.del<{ success: boolean }>('/auth/account'),
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.del(`/users/friend/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
  });
}
