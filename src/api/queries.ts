import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import { queryKeys } from './queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { User, Pact, Submission, StreakData, Notification } from '@/data/types';

export interface PactWithDetails extends Pact {
  participantDetails?: User[];
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

export function useNotifications() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => api.get<Notification[]>('/notifications'),
    enabled: !!token,
  });
}

export function useStreakActivity() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.streaks.activity,
    queryFn: () => api.get<Record<string, number>>('/streaks/activity'),
    enabled: !!token,
  });
}

export function useRecentActivity() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.submissions.recent,
    queryFn: () => api.get<(Submission & { user: User; pact: Pact })[]>('/submissions/recent'),
    enabled: !!token,
  });
}

export function usePactSubmissions(pactId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.pacts.submissions(pactId),
    queryFn: () => api.get<(Submission & { user?: User })[]>(`/pacts/${pactId}/submissions`),
    enabled: !!token && !!pactId,
  });
}
