/**
 * UI tests for pagination hooks: useFlatNotifications, useFlatPactSubmissions, useFlatRecentActivity.
 *
 * These test the core infinite-query logic that powers all three paginated views.
 * Uses renderHook to test hooks in isolation with mock API responses.
 */
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createTestQueryClient,
  makeNotification,
  makeSubmission,
  makeUser,
  makePact,
  paginatedResponse,
  resetFactories,
} from './helpers';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock the auth context (all queries depend on token)
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'user_1', name: 'Test User' } }),
}));

// Mock the API client — intercept get() calls
const mockGet = jest.fn();
jest.mock('@/api/client', () => ({
  api: { get: (...args: any[]) => mockGet(...args) },
}));

// Import hooks AFTER mocks are set up
import { useFlatNotifications, useFlatPactSubmissions, useFlatRecentActivity, useUnreadNotificationCount } from '@/api/queries';

function createWrapper(qc?: QueryClient) {
  const client = qc ?? createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetFactories();
  mockGet.mockReset();
});

describe('useFlatNotifications', () => {
  it('returns empty array when no notifications', async () => {
    mockGet.mockResolvedValueOnce(paginatedResponse([], false));
    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('returns flat data from first page', async () => {
    const notifs = [makeNotification(), makeNotification(), makeNotification()];
    mockGet.mockResolvedValueOnce(paginatedResponse(notifs, false));

    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.data[0].id).toBe(notifs[0].id);
    expect(result.current.data[2].id).toBe(notifs[2].id);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('indicates hasNextPage when more data is available', async () => {
    const notifs = [makeNotification(), makeNotification()];
    mockGet.mockResolvedValueOnce(paginatedResponse(notifs, true));

    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('flattens multiple pages after fetchNextPage', async () => {
    const page1 = [makeNotification({ id: 'n1', timestamp: '2026-03-01T10:00:00Z' }), makeNotification({ id: 'n2', timestamp: '2026-03-01T09:00:00Z' })];
    const page2 = [makeNotification({ id: 'n3', timestamp: '2026-03-01T08:00:00Z' })];

    mockGet
      .mockResolvedValueOnce(paginatedResponse(page1, true))
      .mockResolvedValueOnce(paginatedResponse(page2, false));

    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(true);

    // Fetch second page
    await act(async () => {
      result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.hasNextPage).toBe(false);

    // Data should be flattened in order
    expect(result.current.data.map(n => n.id)).toEqual(['n1', 'n2', 'n3']);
  });

  it('passes cursor (before param) when fetching next page', async () => {
    const page1 = [makeNotification({ id: 'n1', timestamp: '2026-03-01T10:00:00Z' })];
    mockGet
      .mockResolvedValueOnce(paginatedResponse(page1, true))
      .mockResolvedValueOnce(paginatedResponse([], false));

    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    await act(async () => {
      result.current.fetchNextPage();
    });
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));

    // Second call should include the cursor
    const secondCallUrl = mockGet.mock.calls[1][0] as string;
    expect(secondCallUrl).toContain('before=');
    expect(secondCallUrl).toContain('2026-03-01');
  });

  it('respects custom limit parameter', async () => {
    mockGet.mockResolvedValueOnce(paginatedResponse([], false));
    renderHook(() => useFlatNotifications(5), { wrapper: createWrapper() });
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    expect(mockGet.mock.calls[0][0]).toContain('limit=5');
  });

  it('provides isLoading state', () => {
    mockGet.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('provides isFetchingNextPage state during pagination', async () => {
    const page1 = [makeNotification({ timestamp: '2026-03-01T10:00:00Z' })];
    mockGet.mockResolvedValueOnce(paginatedResponse(page1, true));

    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    // Mock slow second page
    let resolveSecondPage: (v: any) => void;
    mockGet.mockReturnValueOnce(new Promise(r => { resolveSecondPage = r; }));

    act(() => { result.current.fetchNextPage(); });

    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(true));

    // Resolve second page
    await act(async () => { resolveSecondPage!(paginatedResponse([], false)); });
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));
  });

  it('handles error gracefully', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.data).toEqual([]);
  });

  it('preserves notification types across pages', async () => {
    const page1 = [
      makeNotification({ type: 'nudge', message: 'Nudge!' }),
      makeNotification({ type: 'pact_invitation', message: 'Invite!' }),
    ];
    const page2 = [
      makeNotification({ type: 'friend_request', message: 'Friend!' }),
      makeNotification({ type: 'streak_milestone', message: 'Milestone!' }),
    ];
    mockGet
      .mockResolvedValueOnce(paginatedResponse(page1, true))
      .mockResolvedValueOnce(paginatedResponse(page2, false));

    const { result } = renderHook(() => useFlatNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    await act(async () => { result.current.fetchNextPage(); });
    await waitFor(() => expect(result.current.data).toHaveLength(4));

    expect(result.current.data.map(n => n.type)).toEqual([
      'nudge', 'pact_invitation', 'friend_request', 'streak_milestone',
    ]);
  });
});

describe('useFlatPactSubmissions', () => {
  it('returns empty array for pact with no submissions', async () => {
    mockGet.mockResolvedValueOnce(paginatedResponse([], false));
    const { result } = renderHook(() => useFlatPactSubmissions('p1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('loads first page of submissions', async () => {
    const subs = [makeSubmission(), makeSubmission(), makeSubmission()];
    mockGet.mockResolvedValueOnce(paginatedResponse(subs, true));

    const { result } = renderHook(() => useFlatPactSubmissions('p1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('loads multiple pages and flattens results', async () => {
    const page1 = [
      makeSubmission({ id: 's1', timestamp: '2026-03-01T12:00:00Z' }),
      makeSubmission({ id: 's2', timestamp: '2026-03-01T11:00:00Z' }),
    ];
    const page2 = [
      makeSubmission({ id: 's3', timestamp: '2026-03-01T10:00:00Z' }),
    ];

    mockGet
      .mockResolvedValueOnce(paginatedResponse(page1, true))
      .mockResolvedValueOnce(paginatedResponse(page2, false));

    const { result } = renderHook(() => useFlatPactSubmissions('p1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    await act(async () => { result.current.fetchNextPage(); });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.data.map(s => s.id)).toEqual(['s1', 's2', 's3']);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('scopes requests to the correct pact ID', async () => {
    mockGet.mockResolvedValueOnce(paginatedResponse([], false));
    renderHook(() => useFlatPactSubmissions('p42'), { wrapper: createWrapper() });
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    expect(mockGet.mock.calls[0][0]).toContain('/pacts/p42/submissions');
  });

  it('preserves submission fields (photoUri, reactions)', async () => {
    const sub = makeSubmission({
      photoUri: 'https://example.com/special.jpg',
      reactions: [{ emoji: '🔥', count: 3, reacted: true }],
    });
    mockGet.mockResolvedValueOnce(paginatedResponse([sub], false));

    const { result } = renderHook(() => useFlatPactSubmissions('p1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data[0].photoUri).toBe('https://example.com/special.jpg');
    expect(result.current.data[0].reactions).toHaveLength(1);
    expect(result.current.data[0].reactions![0].emoji).toBe('🔥');
  });

  it('handles rapid fetchNextPage calls without duplicates', async () => {
    const page1 = [makeSubmission({ id: 's1', timestamp: '2026-03-01T12:00:00Z' })];
    const page2 = [makeSubmission({ id: 's2', timestamp: '2026-03-01T11:00:00Z' })];

    mockGet
      .mockResolvedValueOnce(paginatedResponse(page1, true))
      .mockResolvedValueOnce(paginatedResponse(page2, false));

    const { result } = renderHook(() => useFlatPactSubmissions('p1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    // Rapid double-fetch — TanStack Query should deduplicate
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    // IDs should not be duplicated
    const ids = result.current.data.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('useFlatRecentActivity', () => {
  it('returns empty array when no recent activity', async () => {
    mockGet.mockResolvedValueOnce(paginatedResponse([], false));
    const { result } = renderHook(() => useFlatRecentActivity(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it('loads and flattens activity across pages', async () => {
    const user = makeUser();
    const pact = makePact();
    const page1 = [
      makeSubmission({ id: 'a1', timestamp: '2026-03-01T12:00:00Z', user, pact }),
      makeSubmission({ id: 'a2', timestamp: '2026-03-01T11:00:00Z', user, pact }),
    ];
    const page2 = [
      makeSubmission({ id: 'a3', timestamp: '2026-03-01T10:00:00Z', user, pact }),
    ];

    mockGet
      .mockResolvedValueOnce(paginatedResponse(page1, true))
      .mockResolvedValueOnce(paginatedResponse(page2, false));

    const { result } = renderHook(() => useFlatRecentActivity(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    await act(async () => { result.current.fetchNextPage(); });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.data.map(a => a.id)).toEqual(['a1', 'a2', 'a3']);
  });

  it('uses default limit of 10', async () => {
    mockGet.mockResolvedValueOnce(paginatedResponse([], false));
    renderHook(() => useFlatRecentActivity(), { wrapper: createWrapper() });
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    expect(mockGet.mock.calls[0][0]).toContain('limit=10');
  });

  it('supports custom limit', async () => {
    mockGet.mockResolvedValueOnce(paginatedResponse([], false));
    renderHook(() => useFlatRecentActivity(5), { wrapper: createWrapper() });
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    expect(mockGet.mock.calls[0][0]).toContain('limit=5');
  });
});

describe('useUnreadNotificationCount', () => {
  it('returns count from dedicated endpoint', async () => {
    mockGet.mockResolvedValueOnce({ count: 7 });
    const { result } = renderHook(() => useUnreadNotificationCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data?.count).toBe(7));
  });

  it('returns zero count', async () => {
    mockGet.mockResolvedValueOnce({ count: 0 });
    const { result } = renderHook(() => useUnreadNotificationCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data?.count).toBe(0));
  });
});
