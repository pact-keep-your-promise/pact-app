export const queryKeys = {
  pacts: {
    all: ['pacts'] as const,
    detail: (id: string) => ['pacts', id] as const,
    submissions: (pactId: string) => ['pacts', pactId, 'submissions'] as const,
  },
  users: {
    all: ['users'] as const,
  },
  streaks: {
    all: ['streaks'] as const,
    activity: ['streaks', 'activity'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  submissions: {
    recent: ['submissions', 'recent'] as const,
  },
} as const;
