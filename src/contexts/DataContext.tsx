import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { User, Pact, StreakData, Notification, Submission } from '../data/types';

interface PactWithDetails extends Pact {
  participantDetails?: User[];
}

interface DataState {
  pacts: PactWithDetails[];
  users: User[];
  streaks: StreakData[];
  notifications: Notification[];
  activity: Record<string, number>;
  recentActivity: (Submission & { user: User; pact: Pact })[];
  loading: boolean;
  refetch: () => Promise<void>;
  // Helper functions matching mock.ts API
  getUserById: (id: string) => User | undefined;
  getPactById: (id: string) => PactWithDetails | undefined;
  getStreakForUserPact: (pactId: string, userId: string) => StreakData | undefined;
  getParticipants: (pact: Pact) => User[];
  getPendingParticipants: (pact: Pact) => User[];
  getCompletionRate: (pactId: string, userId: string) => number;
  getUnreadNotificationCount: () => number;
  getAggregateActivity: (userId: string) => Record<string, number>;
  getRecentActivity: () => (Submission & { user: User; pact: Pact })[];
  // Submissions per pact (fetched on demand)
  fetchSubmissions: (pactId: string) => Promise<(Submission & { user?: User })[]>;
}

const DataContext = createContext<DataState>({} as DataState);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [pacts, setPacts] = useState<PactWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [recentActivity, setRecentActivity] = useState<(Submission & { user: User; pact: Pact })[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pactsRes, usersRes, streaksRes, notifsRes, activityRes, recentRes] = await Promise.all([
        api.get<PactWithDetails[]>('/pacts'),
        api.get<User[]>('/users'),
        api.get<StreakData[]>('/streaks'),
        api.get<Notification[]>('/notifications'),
        api.get<Record<string, number>>('/streaks/activity'),
        api.get<(Submission & { user: User; pact: Pact })[]>('/submissions/recent'),
      ]);
      setPacts(pactsRes);
      setUsers(usersRes);
      setStreaks(streaksRes);
      setNotifications(notifsRes);
      setActivity(activityRes);
      setRecentActivity(recentRes);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token]);

  // --- Helper functions matching mock.ts API ---

  const getUserById = useCallback((id: string): User | undefined => {
    if (user && id === user.id) return { ...user, isCurrentUser: true };
    return users.find(u => u.id === id);
  }, [users, user]);

  const getPactById = useCallback((id: string): PactWithDetails | undefined => {
    return pacts.find(p => p.id === id);
  }, [pacts]);

  const getStreakForUserPact = useCallback((pactId: string, userId: string): StreakData | undefined => {
    return streaks.find(s => s.pactId === pactId && s.userId === userId);
  }, [streaks]);

  const getParticipants = useCallback((pact: Pact): User[] => {
    if ((pact as PactWithDetails).participantDetails) {
      return (pact as PactWithDetails).participantDetails!.map(p => ({
        ...p,
        isCurrentUser: p.id === user?.id,
      }));
    }
    return pact.participants
      .map(id => getUserById(id))
      .filter(Boolean) as User[];
  }, [getUserById, user]);

  const getPendingParticipants = useCallback((pact: Pact): User[] => {
    const today = new Date().toISOString().split('T')[0];
    // Check recent activity for today's submissions
    const todaySubmissions = recentActivity.filter(
      s => s.pactId === pact.id && s.timestamp.split('T')[0] === today
    );
    const submittedUserIds = new Set(todaySubmissions.map(s => s.userId));
    const participants = getParticipants(pact);
    return participants.filter(p => !submittedUserIds.has(p.id) && p.id !== user?.id);
  }, [recentActivity, getParticipants, user]);

  const getCompletionRate = useCallback((pactId: string, userId: string): number => {
    const pact = getPactById(pactId);
    if (!pact) return 0;
    const streak = getStreakForUserPact(pactId, userId);
    if (!streak) return 0;
    const daysInWindow = 7;
    const target = pact.frequency === 'daily' ? daysInWindow : (pact.timesPerWeek || 3);
    const recentDates = streak.completedDates.slice(-daysInWindow);
    return Math.min(1, recentDates.length / target);
  }, [getPactById, getStreakForUserPact]);

  const getUnreadNotificationCount = useCallback((): number => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getAggregateActivity = useCallback((_userId: string): Record<string, number> => {
    return activity;
  }, [activity]);

  const getRecentActivityFn = useCallback((): (Submission & { user: User; pact: Pact })[] => {
    return recentActivity;
  }, [recentActivity]);

  const fetchSubmissions = useCallback(async (pactId: string): Promise<(Submission & { user?: User })[]> => {
    return api.get<(Submission & { user?: User })[]>(`/pacts/${pactId}/submissions`);
  }, []);

  return (
    <DataContext.Provider value={{
      pacts,
      users,
      streaks,
      notifications,
      activity,
      recentActivity,
      loading,
      refetch,
      getUserById,
      getPactById,
      getStreakForUserPact,
      getParticipants,
      getPendingParticipants,
      getCompletionRate,
      getUnreadNotificationCount,
      getAggregateActivity,
      getRecentActivity: getRecentActivityFn,
      fetchSubmissions,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
