export const queryKeys = {
  pacts: {
    all: ['pacts'] as const,
    detail: (id: string) => ['pacts', id] as const,
    submissions: (pactId: string) => ['pacts', pactId, 'submissions'] as const,
  },
  users: {
    all: ['users'] as const,
    search: (q: string) => ['users', 'search', q] as const,
    friendRequests: ['users', 'friend-requests'] as const,
    profile: (id: string) => ['users', 'profile', id] as const,
  },
  streaks: {
    all: ['streaks'] as const,
    activity: ['streaks', 'activity'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  submissions: {
    recent: ['submissions', 'recent'] as const,
  },
  messages: {
    forPact: (pactId: string) => ['messages', pactId] as const,
  },
} as const;
