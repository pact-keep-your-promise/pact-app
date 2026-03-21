/**
 * Reusable test helpers for pact-app UI tests.
 *
 * Provides:
 *  - Data factories for notifications, submissions, pacts, users, streaks
 *  - A <TestWrapper> that supplies TanStack Query + Theme + Auth contexts
 *  - Utility to render components with all required providers
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notification, Submission, Pact, User, StreakData } from '@/data/types';

// ─── Data Factories ──────────────────────────────────────────────────────────

let _seq = 0;
function seq() { return ++_seq; }

/** Reset factory sequence counter between tests */
export function resetFactories() { _seq = 0; }

/** Generate an ISO timestamp `minutesAgo` minutes in the past */
export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function makeUser(overrides: Partial<User> = {}): User {
  const n = seq();
  return {
    id: `user_${n}`,
    name: `User ${n}`,
    username: `user${n}`,
    avatar: `https://example.com/avatar${n}.jpg`,
    ...overrides,
  };
}

export function makeNotification(overrides: Partial<Notification> = {}): Notification {
  const n = seq();
  return {
    id: `notif_${n}`,
    type: 'new_submission',
    message: `Notification message ${n}`,
    timestamp: minutesAgo(n * 5),
    read: false,
    ...overrides,
  };
}

export function makeSubmission(overrides: Partial<Submission & { user?: User; pact?: Pact }> = {}): Submission & { user?: User; pact?: Pact } {
  const n = seq();
  return {
    id: `sub_${n}`,
    pactId: 'p1',
    userId: `user_${n}`,
    photoUri: `https://example.com/photo${n}.jpg`,
    timestamp: minutesAgo(n * 10),
    verified: true,
    ...overrides,
  };
}

export function makePact(overrides: Partial<Pact> = {}): Pact {
  const n = seq();
  return {
    id: `pact_${n}`,
    title: `Pact ${n}`,
    icon: 'fitness',
    iconFamily: 'Ionicons',
    color: '#4ECDC4',
    frequency: 'daily',
    participants: ['user_1'],
    createdAt: minutesAgo(60 * 24 * 7),
    deadline: '23:59',
    ...overrides,
  };
}

export function makeStreakData(overrides: Partial<StreakData> = {}): StreakData {
  return {
    pactId: 'p1',
    currentStreak: 5,
    longestStreak: 10,
    completedDates: [],
    myCompletedDates: [],
    streakType: 'daily',
    todayStatus: { completed: 0, total: 1 },
    freezeInfo: null,
    ...overrides,
  };
}

/**
 * Generate N notifications in chronological order (newest first).
 * Each notification is 5 minutes apart.
 */
export function makeNotificationPage(
  count: number,
  startOffset = 0,
  overrides: Partial<Notification> = {},
): Notification[] {
  return Array.from({ length: count }, (_, i) => makeNotification({
    timestamp: minutesAgo((startOffset + i) * 5),
    ...overrides,
  }));
}

/**
 * Generate N submissions in chronological order (newest first).
 */
export function makeSubmissionPage(
  count: number,
  startOffset = 0,
  overrides: Partial<Submission> = {},
): Submission[] {
  return Array.from({ length: count }, (_, i) => makeSubmission({
    timestamp: minutesAgo((startOffset + i) * 10),
    ...overrides,
  }));
}

// ─── Paginated Response Builder ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
}

/** Build a paginated response as returned by the backend */
export function paginatedResponse<T>(data: T[], hasMore: boolean): PaginatedResponse<T> {
  return { data, hasMore };
}

// ─── TanStack Query Wrapper ──────────────────────────────────────────────────

/** Create a fresh QueryClient suitable for testing (no retries, no GC) */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wraps children with a fresh QueryClientProvider.
 * Optionally accepts an existing QueryClient for pre-seeding data.
 */
export function TestWrapper({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) {
  const client = queryClient ?? createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

/** Custom render that wraps components in test providers */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { queryClient?: QueryClient },
) {
  const { queryClient, ...renderOptions } = options ?? {};
  const client = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <TestWrapper queryClient={client}>{children}</TestWrapper>;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: client,
  };
}
