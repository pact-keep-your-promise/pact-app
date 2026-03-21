/**
 * Tests for UserProfileScreen (app/user/[id].tsx).
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient, resetFactories } from './helpers';
import { UserProfile } from '@/data/types';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockBack = jest.fn();
let mockId = 'u2';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: mockId }),
  useRouter: () => ({
    back: mockBack,
    replace: jest.fn(),
    push: mockPush,
    canGoBack: () => true,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: 'u1', name: 'Current User', username: 'current', avatar: 'https://example.com/me.jpg' },
  }),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#111',
      textSecondary: '#666',
      textTertiary: '#999',
      primary: '#4ECDC4',
      success: '#4ECDC4',
      border: '#ddd',
      background: '#fff',
      backgroundSecondary: '#f5f5f5',
      backgroundTertiary: '#eee',
    },
    isDark: false,
  }),
}));

jest.mock('@/utils/colorUtils', () => ({
  adaptColor: (c: string) => c,
}));

jest.mock('@/components/ui/Avatar', () => {
  const React = require('react');
  return function MockAvatar({ name }: any) {
    return React.createElement('div', { 'data-testid': 'avatar' });
  };
});

jest.mock('@/components/streaks/ActivityGraph', () => {
  const React = require('react');
  return function MockActivityGraph({ activityMap }: any) {
    const count = Object.keys(activityMap || {}).length;
    return React.createElement('div', { 'data-testid': 'activity-graph' }, `${count} days`);
  };
});

jest.mock('@/components/ui/Skeleton', () => {
  const React = require('react');
  return function MockSkeleton() {
    return React.createElement('div', { 'data-testid': 'skeleton' }, 'loading...');
  };
});

jest.mock('@/components/shared/ErrorState', () => {
  const React = require('react');
  return function MockErrorState({ message, onRetry }: any) {
    return React.createElement('div', { 'data-testid': 'error-state' },
      React.createElement('span', null, message),
      onRetry && React.createElement('button', { onClick: onRetry }, 'Retry'),
    );
  };
});

jest.mock('@/components/ui/Button', () => {
  const React = require('react');
  return function MockButton({ title, onPress, loading }: any) {
    return React.createElement('button', { onClick: onPress, disabled: loading }, title);
  };
});

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('@/api/client', () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: jest.fn(),
    del: jest.fn(),
  },
  ApiError: class extends Error {
    status: number;
    constructor(msg: string, status: number) { super(msg); this.status = status; }
  },
  NetworkError: class extends Error {},
}));

// ─── Import (after mocks) ───────────────────────────────────────────────────

import UserProfileScreen from '../app/user/[id]';

// ─── Test Data ──────────────────────────────────────────────────────────────

const mockProfile: UserProfile = {
  id: 'u2',
  name: 'Sarah Chen',
  username: 'sarah',
  avatar: 'https://example.com/sarah.jpg',
  bio: 'Fitness enthusiast',
  stats: { totalPacts: 5, totalSubmissions: 58 },
  sharedPacts: [
    { id: 'p1', title: 'Morning Run', icon: 'fitness', iconFamily: 'Ionicons', color: '#FF6B6B', frequency: 'daily' },
    { id: 'p2', title: 'Healthy Meals', icon: 'restaurant', iconFamily: 'Ionicons', color: '#4ECDC4', frequency: 'daily' },
  ],
  activityMap: { '2026-03-01': 2, '2026-03-02': 1, '2026-03-03': 3 },
  friendshipStatus: 'accepted',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderUserProfile() {
  const qc = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={qc}>
        <UserProfileScreen />
      </QueryClientProvider>,
    ),
    queryClient: qc,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('UserProfileScreen', () => {
  beforeEach(() => {
    resetFactories();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPush.mockClear();
    mockBack.mockClear();
    mockId = 'u2';
  });

  it('shows loading skeleton initially', () => {
    // API never resolves (pending)
    mockGet.mockReturnValue(new Promise(() => {}));
    const { getAllByTestId } = renderUserProfile();
    expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('shows error state on API failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Server error'));
    const { getByTestId, getByText } = renderUserProfile();

    await waitFor(() => {
      expect(getByTestId('error-state')).toBeTruthy();
    });
    expect(getByText("Couldn't load this profile")).toBeTruthy();
  });

  it('renders profile data when loaded', async () => {
    mockGet.mockResolvedValueOnce(mockProfile);
    const { getByText, getByTestId } = renderUserProfile();

    await waitFor(() => {
      expect(getByText('Sarah Chen')).toBeTruthy();
    });
    expect(getByText('@sarah')).toBeTruthy();
    expect(getByText('Fitness enthusiast')).toBeTruthy();
    expect(getByText('5')).toBeTruthy(); // totalPacts
    expect(getByText('58')).toBeTruthy(); // totalSubmissions
    expect(getByText('Pacts')).toBeTruthy();
    expect(getByText('Submissions')).toBeTruthy();
  });

  it('shows Friends badge for accepted friendship', async () => {
    mockGet.mockResolvedValueOnce(mockProfile);
    const { getByText } = renderUserProfile();
    await waitFor(() => {
      expect(getByText('Friends')).toBeTruthy();
    });
  });

  it('shows Request Pending for pending friendship', async () => {
    mockGet.mockResolvedValueOnce({ ...mockProfile, friendshipStatus: 'pending' });
    const { getByText } = renderUserProfile();
    await waitFor(() => {
      expect(getByText('Request Pending')).toBeTruthy();
    });
  });

  it('shows Add Friend button for non-friends', async () => {
    mockGet.mockResolvedValueOnce({ ...mockProfile, friendshipStatus: 'none' });
    const { getByText } = renderUserProfile();
    await waitFor(() => {
      expect(getByText('Add Friend')).toBeTruthy();
    });
  });

  it('renders activity graph with activity data', async () => {
    mockGet.mockResolvedValueOnce(mockProfile);
    const { getByTestId } = renderUserProfile();
    await waitFor(() => {
      expect(getByTestId('activity-graph')).toBeTruthy();
    });
    expect(getByTestId('activity-graph').textContent).toBe('3 days');
  });

  it('renders shared pacts section', async () => {
    mockGet.mockResolvedValueOnce(mockProfile);
    const { getByText } = renderUserProfile();
    await waitFor(() => {
      expect(getByText('Shared Pacts (2)')).toBeTruthy();
    });
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText('Healthy Meals')).toBeTruthy();
  });

  it('hides shared pacts when list is empty', async () => {
    mockGet.mockResolvedValueOnce({ ...mockProfile, sharedPacts: [] });
    const { queryByText, getByText } = renderUserProfile();
    await waitFor(() => {
      expect(getByText('Sarah Chen')).toBeTruthy();
    });
    expect(queryByText('Shared Pacts')).toBeNull();
  });

  it('hides bio when empty', async () => {
    mockGet.mockResolvedValueOnce({ ...mockProfile, bio: '' });
    const { queryByText, getByText } = renderUserProfile();
    await waitFor(() => {
      expect(getByText('Sarah Chen')).toBeTruthy();
    });
    expect(queryByText('Fitness enthusiast')).toBeNull();
  });
});
