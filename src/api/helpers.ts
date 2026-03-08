import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePacts, useUsers, useStreaks, useNotifications, useStreakActivity, useRecentActivity, PactWithDetails } from './queries';
import { User, Pact, StreakData, Submission } from '@/data/types';

export function useDataHelpers() {
  const { user } = useAuth();

  const { data: pacts = [] } = usePacts();
  const { data: users = [] } = useUsers();
  const { data: streaks = [] } = useStreaks();
  const { data: notifications = [] } = useNotifications();
  const { data: activity = {} } = useStreakActivity();
  const { data: recentActivity = [] } = useRecentActivity();

  const getUserById = useCallback((id: string): User | undefined => {
    if (user && id === user.id) return { ...user, isCurrentUser: true };
    return users.find(u => u.id === id);
  }, [users, user]);

  const getPactById = useCallback((id: string): PactWithDetails | undefined => {
    return pacts.find(p => p.id === id);
  }, [pacts]);

  const getStreakForPact = useCallback((pactId: string): StreakData | undefined => {
    return streaks.find(s => s.pactId === pactId);
  }, [streaks]);

  // Keep backward-compat alias (userId is now ignored — streaks are unified per pact)
  const getStreakForUserPact = useCallback((pactId: string, _userId: string): StreakData | undefined => {
    return streaks.find(s => s.pactId === pactId);
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
    // Use pact timezone for "today" calculation
    const tz = pact.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: tz });
    const todaySubmissions = recentActivity.filter(
      s => s.pactId === pact.id && new Date(s.timestamp).toLocaleDateString('en-CA', { timeZone: tz }) === today
    );
    const submittedUserIds = new Set(todaySubmissions.map(s => s.userId));
    const participants = getParticipants(pact);
    return participants.filter(p => !submittedUserIds.has(p.id) && p.id !== user?.id);
  }, [recentActivity, getParticipants, user]);

  const getCompletionRate = useCallback((pactId: string, _userId?: string): number => {
    const pact = getPactById(pactId);
    if (!pact) return 0;
    const streak = getStreakForPact(pactId);
    if (!streak) return 0;
    const daysInWindow = 7;
    const target = pact.frequency === 'daily' ? daysInWindow : (pact.timesPerWeek || 3);
    const recentDates = streak.completedDates.slice(-daysInWindow);
    return Math.min(1, recentDates.length / target);
  }, [getPactById, getStreakForPact]);

  const getUnreadNotificationCount = useCallback((): number => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getAggregateActivity = useCallback((_userId: string): Record<string, number> => {
    return activity;
  }, [activity]);

  const getRecentActivity = useCallback((): (Submission & { user: User; pact: Pact })[] => {
    return recentActivity;
  }, [recentActivity]);

  return {
    getUserById,
    getPactById,
    getStreakForPact,
    getStreakForUserPact,
    getParticipants,
    getPendingParticipants,
    getCompletionRate,
    getUnreadNotificationCount,
    getAggregateActivity,
    getRecentActivity,
    pacts,
    users,
    streaks,
    notifications,
    activity,
    recentActivity,
  };
}
