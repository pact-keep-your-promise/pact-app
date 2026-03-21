/**
 * Component tests for the Notifications screen.
 *
 * Tests rendering, pagination behavior, mark-all-read, empty state,
 * and invitation action buttons.
 */
import React from 'react';
import { render, fireEvent, waitFor, act, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createTestQueryClient,
  makeNotification,
  paginatedResponse,
  resetFactories,
} from './helpers';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'user_1', name: 'Test User' } }),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff',
      backgroundSecondary: '#f5f5f5',
      backgroundTertiary: '#eee',
      textPrimary: '#000',
      textSecondary: '#666',
      textTertiary: '#999',
      primary: '#4ECDC4',
      error: '#FF6B6B',
      border: '#ddd',
      success: '#4ECDC4',
      onSuccess: '#fff',
      overlayTextPrimary: '#fff',
    },
    isDark: false,
    mode: 'light',
    setMode: jest.fn(),
  }),
}));

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockPost = jest.fn();
jest.mock('@/api/client', () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    put: (...args: any[]) => mockPut(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => { /* noop in tests */ },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/components/ui/IconBadge', () => 'IconBadge');

jest.mock('@/utils/colorUtils', () => ({
  adaptColor: (c: string) => c,
}));

import NotificationsScreen from '../app/notifications';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderNotifications(qc?: QueryClient) {
  const client = qc ?? createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={client}>
        <NotificationsScreen />
      </QueryClientProvider>
    ),
    queryClient: client,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetFactories();
  mockGet.mockReset();
  mockPut.mockReset();
  mockPost.mockReset();
  // Default: unread count endpoint
  mockGet.mockImplementation((url: string) => {
    if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 0 });
    if (url.includes('/notifications')) return Promise.resolve(paginatedResponse([], false));
    if (url.includes('/users/friend-requests')) return Promise.resolve([]);
    return Promise.resolve([]);
  });
});

describe('NotificationsScreen', () => {
  it('renders header with title and mark-all-read button', async () => {
    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('Notifications')).toBeTruthy();
      expect(getByText('Mark all read')).toBeTruthy();
      expect(getByText('Back')).toBeTruthy();
    });
  });

  it('shows empty state when no notifications', async () => {
    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('All caught up!')).toBeTruthy();
      expect(getByText('No notifications yet')).toBeTruthy();
    });
  });

  it('renders notification messages', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 2 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse([
        makeNotification({ message: 'Jake submitted for Morning Run!' }),
        makeNotification({ message: 'Sarah nudged you!' }),
      ], false));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('Jake submitted for Morning Run!')).toBeTruthy();
      expect(getByText('Sarah nudged you!')).toBeTruthy();
    });
  });

  it('shows unread styling for unread notifications', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 1 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse([
        makeNotification({ message: 'Unread one', read: false }),
        makeNotification({ message: 'Read one', read: true }),
      ], false));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('Unread one')).toBeTruthy();
      expect(getByText('Read one')).toBeTruthy();
    });
  });

  it('renders time-ago for each notification', async () => {
    const recentTimestamp = new Date(Date.now() - 30 * 60_000).toISOString(); // 30 min ago
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 1 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse([
        makeNotification({ message: 'Recent one', timestamp: recentTimestamp }),
      ], false));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('30m ago')).toBeTruthy();
    });
  });

  it('calls mark-all-read API when button pressed', async () => {
    mockPut.mockResolvedValueOnce({});
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 1 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse([
        makeNotification({ message: 'Some notification' }),
      ], false));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { getByText } = renderNotifications();
    await waitFor(() => expect(getByText('Some notification')).toBeTruthy());

    await act(async () => {
      fireEvent.click(getByText('Mark all read'));
    });

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/notifications/read');
    });
  });

  it('renders invitation action buttons for pact_invitation type', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 1 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse([
        makeNotification({ type: 'pact_invitation', message: 'Join Morning Run', read: false }),
      ], false));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('Join')).toBeTruthy();
      expect(getByText('Decline')).toBeTruthy();
    });
  });

  it('does NOT show action buttons for read pact_invitation', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 0 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse([
        makeNotification({ type: 'pact_invitation', message: 'Already joined', read: true }),
      ], false));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { queryByText, getByText } = renderNotifications();
    await waitFor(() => expect(getByText('Already joined')).toBeTruthy());
    expect(queryByText('Join')).toBeNull();
    expect(queryByText('Decline')).toBeNull();
  });

  it('renders different notification types', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 3 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse([
        makeNotification({ type: 'nudge', message: 'Nudge msg' }),
        makeNotification({ type: 'streak_milestone', message: 'Milestone msg' }),
        makeNotification({ type: 'deadline_warning', message: 'Deadline msg' }),
      ], false));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('Nudge msg')).toBeTruthy();
      expect(getByText('Milestone msg')).toBeTruthy();
      expect(getByText('Deadline msg')).toBeTruthy();
    });
  });

  it('renders many notifications from paginated response', async () => {
    const manyNotifs = Array.from({ length: 5 }, (_, i) =>
      makeNotification({ message: `Batch notification ${i + 1}` })
    );
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) return Promise.resolve({ count: 5 });
      if (url.includes('/notifications?')) return Promise.resolve(paginatedResponse(manyNotifs, true));
      if (url.includes('/users/friend-requests')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { getByText } = renderNotifications();
    await waitFor(() => {
      expect(getByText('Batch notification 1')).toBeTruthy();
      expect(getByText('Batch notification 5')).toBeTruthy();
    });
  });
});
