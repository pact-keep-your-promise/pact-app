/**
 * Component tests for the ActivityFeed horizontal infinite scroll.
 *
 * Tests rendering, empty state, data display, and pagination triggers.
 */
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createTestQueryClient,
  makeSubmission,
  makeUser,
  makePact,
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
      textPrimary: '#000',
      textSecondary: '#666',
      textTertiary: '#999',
      primary: '#4ECDC4',
      border: '#ddd',
    },
    isDark: false,
  }),
}));

const mockGet = jest.fn();
jest.mock('@/api/client', () => ({
  api: { get: (...args: any[]) => mockGet(...args) },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/shared/EmptyState', () => {
  const React = require('react');
  const RN = jest.requireActual('react-native');
  return function MockEmptyState({ title }: { title: string }) {
    return React.createElement(RN.Text, { testID: 'empty-state' }, title);
  };
});

jest.mock('@/components/pacts/ActivityWidget', () => {
  const React = require('react');
  const RN = jest.requireActual('react-native');
  return function MockActivityWidget({ submission }: { submission: any }) {
    return React.createElement(RN.View, { testID: `activity-widget-${submission.id}` },
      React.createElement(RN.Text, null, submission.user?.name || 'Unknown'),
      React.createElement(RN.Text, null, submission.pact?.title || 'Unknown Pact'),
    );
  };
});

import ActivityFeed from '../src/components/pacts/ActivityFeed';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderActivityFeed(qc?: QueryClient) {
  const client = qc ?? createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={client}>
        <ActivityFeed />
      </QueryClientProvider>
    ),
    queryClient: client,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetFactories();
  mockGet.mockReset();
});

describe('ActivityFeed', () => {
  it('shows empty state when no activity', async () => {
    mockGet.mockResolvedValue(paginatedResponse([], false));
    const { getByTestId, getByText } = renderActivityFeed();
    await waitFor(() => {
      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No activity yet')).toBeTruthy();
    });
  });

  it('renders title "Recent Activity"', async () => {
    mockGet.mockResolvedValue(paginatedResponse([], false));
    const { getByText } = renderActivityFeed();
    await waitFor(() => expect(getByText('Recent Activity')).toBeTruthy());
  });

  it('renders activity widgets for submissions', async () => {
    const user = makeUser({ name: 'Sarah Chen' });
    const pact = makePact({ title: 'Morning Run' });
    const subs = [
      makeSubmission({ id: 'act1', user, pact }),
      makeSubmission({ id: 'act2', user, pact }),
    ];
    mockGet.mockResolvedValue(paginatedResponse(subs, false));

    const { getByTestId } = renderActivityFeed();
    await waitFor(() => {
      expect(getByTestId('activity-widget-act1')).toBeTruthy();
      expect(getByTestId('activity-widget-act2')).toBeTruthy();
    });
  });

  it('displays user name and pact title in widgets', async () => {
    const user = makeUser({ name: 'Jake Miller' });
    const pact = makePact({ title: 'Read 30 Min' });
    mockGet.mockResolvedValue(paginatedResponse([
      makeSubmission({ id: 'act1', user, pact }),
    ], false));

    const { getByText } = renderActivityFeed();
    await waitFor(() => {
      expect(getByText('Jake Miller')).toBeTruthy();
      expect(getByText('Read 30 Min')).toBeTruthy();
    });
  });

  it('renders multiple activity items from a paginated response', async () => {
    const user = makeUser({ name: 'TestUser' });
    const pact = makePact({ title: 'TestPact' });
    const subs = Array.from({ length: 10 }, (_, i) =>
      makeSubmission({ id: `act_${i}`, user, pact, timestamp: new Date(Date.now() - i * 600000).toISOString() })
    );
    mockGet.mockResolvedValue(paginatedResponse(subs, true));

    const { getByTestId } = renderActivityFeed();
    await waitFor(() => {
      expect(getByTestId('activity-widget-act_0')).toBeTruthy();
      expect(getByTestId('activity-widget-act_9')).toBeTruthy();
    });
  });

  it('does not show empty state when there are activities', async () => {
    const user = makeUser({ name: 'ActivityUser' });
    const pact = makePact({ title: 'ActivityPact' });
    mockGet.mockResolvedValue(paginatedResponse([
      makeSubmission({ id: 'check1', user, pact }),
    ], false));

    const { queryByTestId, getByText } = renderActivityFeed();
    // Wait for the actual data to render (not just the title)
    await waitFor(() => expect(getByText('ActivityUser')).toBeTruthy());
    expect(queryByTestId('empty-state')).toBeNull();
  });
});
