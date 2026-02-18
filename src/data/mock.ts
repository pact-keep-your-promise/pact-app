import { User, Pact, Submission, StreakData, Notification } from './types';

export const currentUser: User = {
  id: 'u1',
  name: 'You',
  username: 'you',
  avatar: 'https://i.pravatar.cc/150?img=1',
  isCurrentUser: true,
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Sarah Chen', username: 'sarah', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 'u3', name: 'Jake Miller', username: 'jake', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 'u4', name: 'Emma Wilson', username: 'emma', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 'u5', name: 'Alex Park', username: 'alex', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'u6', name: 'Mia Johnson', username: 'mia', avatar: 'https://i.pravatar.cc/150?img=16' },
];

export const pacts: Pact[] = [
  {
    id: 'p1',
    title: 'Morning Run',
    icon: 'fitness',
    iconFamily: 'Ionicons',
    color: '#FF6B6B',
    frequency: 'daily',
    participants: ['u1', 'u2', 'u3'],
    createdAt: '2026-01-15',
    deadline: '23:59',
  },
  {
    id: 'p2',
    title: 'Read 30 Min',
    icon: 'book',
    iconFamily: 'Ionicons',
    color: '#FFE66D',
    frequency: 'daily',
    participants: ['u1', 'u4', 'u5'],
    createdAt: '2026-01-20',
    deadline: '23:59',
  },
  {
    id: 'p3',
    title: 'Healthy Meals',
    icon: 'restaurant',
    iconFamily: 'Ionicons',
    color: '#95E1D3',
    frequency: 'weekly',
    timesPerWeek: 5,
    participants: ['u1', 'u2', 'u6'],
    createdAt: '2026-01-10',
    deadline: '23:59',
  },
  {
    id: 'p4',
    title: 'Meditate',
    icon: 'leaf',
    iconFamily: 'Ionicons',
    color: '#4ECDC4',
    frequency: 'daily',
    participants: ['u1', 'u3', 'u4', 'u6'],
    createdAt: '2026-02-01',
    deadline: '22:00',
  },
  {
    id: 'p5',
    title: 'No Phone Before 9am',
    icon: 'phone-portrait-outline',
    iconFamily: 'Ionicons',
    color: '#6C63FF',
    frequency: 'daily',
    participants: ['u1', 'u5'],
    createdAt: '2026-02-05',
    deadline: '09:00',
  },
];

function generateDates(daysBack: number, skipRandom = false): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = daysBack; i >= 0; i--) {
    if (skipRandom && Math.random() < 0.15) continue;
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export const submissions: Submission[] = [
  { id: 's1', pactId: 'p1', userId: 'u2', photoUri: 'https://picsum.photos/seed/run1/400/400', timestamp: '2026-02-18T07:30:00Z', verified: true },
  { id: 's2', pactId: 'p1', userId: 'u3', photoUri: 'https://picsum.photos/seed/run2/400/400', timestamp: '2026-02-18T06:45:00Z', verified: true },
  { id: 's3', pactId: 'p2', userId: 'u4', photoUri: 'https://picsum.photos/seed/book1/400/400', timestamp: '2026-02-18T08:00:00Z', verified: true },
  { id: 's4', pactId: 'p4', userId: 'u6', photoUri: 'https://picsum.photos/seed/med1/400/400', timestamp: '2026-02-18T06:00:00Z', verified: true },
  { id: 's5', pactId: 'p3', userId: 'u2', photoUri: 'https://picsum.photos/seed/meal1/400/400', timestamp: '2026-02-17T19:30:00Z', verified: true },
  { id: 's6', pactId: 'p1', userId: 'u1', photoUri: 'https://picsum.photos/seed/run3/400/400', timestamp: '2026-02-17T07:00:00Z', verified: true },
  { id: 's7', pactId: 'p2', userId: 'u5', photoUri: 'https://picsum.photos/seed/book2/400/400', timestamp: '2026-02-17T21:00:00Z', verified: true },
  { id: 's8', pactId: 'p4', userId: 'u3', photoUri: 'https://picsum.photos/seed/med2/400/400', timestamp: '2026-02-17T07:15:00Z', verified: true },
  { id: 's9', pactId: 'p3', userId: 'u6', photoUri: 'https://picsum.photos/seed/meal2/400/400', timestamp: '2026-02-17T12:30:00Z', verified: true },
  { id: 's10', pactId: 'p1', userId: 'u2', photoUri: 'https://picsum.photos/seed/run4/400/400', timestamp: '2026-02-16T07:30:00Z', verified: true },
  { id: 's11', pactId: 'p5', userId: 'u5', photoUri: 'https://picsum.photos/seed/phone1/400/400', timestamp: '2026-02-18T09:05:00Z', verified: true },
  { id: 's12', pactId: 'p4', userId: 'u4', photoUri: 'https://picsum.photos/seed/med3/400/400', timestamp: '2026-02-16T06:30:00Z', verified: true },
  { id: 's13', pactId: 'p2', userId: 'u1', photoUri: 'https://picsum.photos/seed/book3/400/400', timestamp: '2026-02-16T22:00:00Z', verified: true },
  { id: 's14', pactId: 'p3', userId: 'u1', photoUri: 'https://picsum.photos/seed/meal3/400/400', timestamp: '2026-02-16T13:00:00Z', verified: true },
  { id: 's15', pactId: 'p1', userId: 'u3', photoUri: 'https://picsum.photos/seed/run5/400/400', timestamp: '2026-02-15T06:50:00Z', verified: true },
  { id: 's16', pactId: 'p4', userId: 'u1', photoUri: 'https://picsum.photos/seed/med4/400/400', timestamp: '2026-02-15T07:00:00Z', verified: true },
  { id: 's17', pactId: 'p2', userId: 'u4', photoUri: 'https://picsum.photos/seed/book4/400/400', timestamp: '2026-02-15T20:30:00Z', verified: true },
  { id: 's18', pactId: 'p5', userId: 'u1', photoUri: 'https://picsum.photos/seed/phone2/400/400', timestamp: '2026-02-17T09:00:00Z', verified: true },
];

export const streakData: StreakData[] = [
  { pactId: 'p1', userId: 'u1', currentStreak: 12, longestStreak: 18, completedDates: generateDates(30) },
  { pactId: 'p1', userId: 'u2', currentStreak: 15, longestStreak: 20, completedDates: generateDates(30) },
  { pactId: 'p1', userId: 'u3', currentStreak: 8, longestStreak: 14, completedDates: generateDates(30, true) },
  { pactId: 'p2', userId: 'u1', currentStreak: 22, longestStreak: 22, completedDates: generateDates(30) },
  { pactId: 'p2', userId: 'u4', currentStreak: 10, longestStreak: 16, completedDates: generateDates(30, true) },
  { pactId: 'p2', userId: 'u5', currentStreak: 7, longestStreak: 12, completedDates: generateDates(30, true) },
  { pactId: 'p3', userId: 'u1', currentStreak: 18, longestStreak: 25, completedDates: generateDates(30) },
  { pactId: 'p3', userId: 'u2', currentStreak: 14, longestStreak: 20, completedDates: generateDates(30, true) },
  { pactId: 'p3', userId: 'u6', currentStreak: 9, longestStreak: 15, completedDates: generateDates(30, true) },
  { pactId: 'p4', userId: 'u1', currentStreak: 5, longestStreak: 10, completedDates: generateDates(17) },
  { pactId: 'p4', userId: 'u3', currentStreak: 11, longestStreak: 17, completedDates: generateDates(17, true) },
  { pactId: 'p4', userId: 'u4', currentStreak: 3, longestStreak: 8, completedDates: generateDates(17, true) },
  { pactId: 'p4', userId: 'u6', currentStreak: 14, longestStreak: 17, completedDates: generateDates(17) },
  { pactId: 'p5', userId: 'u1', currentStreak: 6, longestStreak: 13, completedDates: generateDates(13) },
  { pactId: 'p5', userId: 'u5', currentStreak: 4, longestStreak: 9, completedDates: generateDates(13, true) },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'nudge', fromUserId: 'u2', pactId: 'p1', message: "Sarah nudged you: Don't break the streak! Go for your run!", timestamp: '2026-02-18T10:00:00Z', read: false },
  { id: 'n2', type: 'deadline_warning', pactId: 'p4', message: 'Meditation deadline is in 2 hours! Your pact friends are waiting.', timestamp: '2026-02-18T20:00:00Z', read: false },
  { id: 'n3', type: 'new_submission', fromUserId: 'u3', pactId: 'p1', message: 'Jake just submitted his morning run!', timestamp: '2026-02-18T06:45:00Z', read: true },
  { id: 'n4', type: 'streak_milestone', pactId: 'p2', message: 'Amazing! 3-week reading streak!', timestamp: '2026-02-17T22:00:00Z', read: true },
];

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getPactById(id: string): Pact | undefined {
  return pacts.find(p => p.id === id);
}

export function getSubmissionsForPact(pactId: string): Submission[] {
  return submissions.filter(s => s.pactId === pactId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getStreakForUserPact(pactId: string, userId: string): StreakData | undefined {
  return streakData.find(s => s.pactId === pactId && s.userId === userId);
}

export function getParticipants(pact: Pact): User[] {
  return pact.participants.map(id => getUserById(id)).filter(Boolean) as User[];
}

export function getRecentActivity(): (Submission & { user: User; pact: Pact })[] {
  return submissions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map(s => ({
      ...s,
      user: getUserById(s.userId)!,
      pact: getPactById(s.pactId)!,
    }))
    .filter(s => s.user && s.pact);
}
