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
    }) => api.post<PactWithDetails>('/pacts', data),
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
