import { useState, useEffect, useCallback } from 'react';
import { api } from './client';
import { User, Pact, Submission, StreakData, Notification } from '../data/types';

// Generic fetch hook
function useApiFetch<T>(path: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(path);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    refetch();
  }, deps);

  return { data, loading, error, refetch };
}

// --- Pacts ---
export interface PactWithDetails extends Pact {
  participantDetails?: (User & { isCurrentUser?: boolean })[];
}

export function usePacts() {
  return useApiFetch<PactWithDetails[]>('/pacts');
}

export function usePactDetail(id: string) {
  return useApiFetch<PactWithDetails>(`/pacts/${id}`, [id]);
}

export function useCreatePact() {
  const [loading, setLoading] = useState(false);

  const createPact = async (data: {
    title: string;
    icon: string;
    iconFamily?: string;
    color?: string;
    frequency: 'daily' | 'weekly';
    timesPerWeek?: number;
    deadline?: string;
    participants?: string[];
  }) => {
    setLoading(true);
    try {
      const result = await api.post<PactWithDetails>('/pacts', data);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { createPact, loading };
}

// --- Submissions ---
export interface SubmissionWithUser extends Submission {
  user?: User;
  pact?: Pact;
}

export function usePactSubmissions(pactId: string) {
  return useApiFetch<SubmissionWithUser[]>(`/pacts/${pactId}/submissions`, [pactId]);
}

export function useRecentActivity() {
  return useApiFetch<SubmissionWithUser[]>('/submissions/recent');
}

export function useSubmit() {
  const [loading, setLoading] = useState(false);

  const submit = async (pactId: string, photoUri: string) => {
    setLoading(true);
    try {
      const result = await api.post<{ id: string; matched: boolean; verified: boolean }>('/submissions', {
        pactId,
        photoUri,
      });
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}

// --- Streaks ---
export function useStreaks() {
  return useApiFetch<StreakData[]>('/streaks');
}

export function useActivity() {
  return useApiFetch<Record<string, number>>('/streaks/activity');
}

// --- Notifications ---
export function useNotifications() {
  const result = useApiFetch<Notification[]>('/notifications');

  const markAllRead = async () => {
    await api.put('/notifications/read');
    result.refetch();
  };

  return { ...result, markAllRead };
}

export function useUnreadCount() {
  return useApiFetch<{ count: number }>('/notifications/unread-count');
}

// --- Users ---
export function useUsers() {
  return useApiFetch<User[]>('/users');
}

// --- Nudge ---
export function useNudge() {
  const nudge = async (pactId: string, targetUserId?: string) => {
    return api.post<{ success: boolean; nudged: string[] }>(`/nudge/${pactId}`, { targetUserId });
  };

  return { nudge };
}
