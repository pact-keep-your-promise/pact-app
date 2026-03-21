/**
 * Tests for EditProfileScreen.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient, resetFactories } from './helpers';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: jest.fn(),
    push: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockUpdateUser = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: {
      id: 'u1',
      name: 'Test User',
      username: 'testuser',
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Hello world',
    },
    updateUser: mockUpdateUser,
  }),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#111',
      textSecondary: '#666',
      textTertiary: '#999',
      primary: '#4ECDC4',
      border: '#ddd',
      error: '#FF6B6B',
      background: '#fff',
      backgroundSecondary: '#f5f5f5',
      backgroundTertiary: '#eee',
    },
    isDark: false,
  }),
}));

const mockShowToast = jest.fn();
jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockPut = jest.fn();
jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: (...args: any[]) => mockPut(...args),
    del: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    field?: string;
    constructor(message: string, status: number, field?: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.field = field;
    }
  },
  NetworkError: class NetworkError extends Error {
    constructor(message = 'Network error') {
      super(message);
      this.name = 'NetworkError';
    }
  },
}));

jest.mock('@/components/ui/Button', () => {
  const React = require('react');
  return function MockButton({ title, onPress, loading, fullWidth }: any) {
    return React.createElement('button', { onClick: onPress, disabled: loading }, loading ? 'Loading...' : title);
  };
});

// ─── Import (after mocks) ───────────────────────────────────────────────────

import EditProfileScreen from '../app/edit-profile';

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderEditProfile() {
  const qc = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={qc}>
        <EditProfileScreen />
      </QueryClientProvider>,
    ),
    queryClient: qc,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('EditProfileScreen', () => {
  beforeEach(() => {
    resetFactories();
    mockBack.mockClear();
    mockPut.mockReset();
    mockShowToast.mockClear();
    mockUpdateUser.mockClear();
  });

  it('renders header, fields, and save button', () => {
    const { getByText, getByDisplayValue } = renderEditProfile();
    expect(getByText('Edit Profile')).toBeTruthy();
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
    expect(getByText('Bio')).toBeTruthy();
    expect(getByDisplayValue('Test User')).toBeTruthy();
    expect(getByDisplayValue('testuser')).toBeTruthy();
    expect(getByDisplayValue('Hello world')).toBeTruthy();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('shows character counters', () => {
    const { getByText } = renderEditProfile();
    expect(getByText('9/50')).toBeTruthy();  // "Test User" = 9 chars
    expect(getByText('8/30')).toBeTruthy();  // "testuser" = 8 chars
    expect(getByText('11/160')).toBeTruthy(); // "Hello world" = 11 chars
  });

  it('navigates back when Back button is clicked', () => {
    const { getByText } = renderEditProfile();
    fireEvent.click(getByText('Back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates back without saving when nothing changed', async () => {
    const { getByText } = renderEditProfile();
    fireEvent.click(getByText('Save Changes'));
    // Should go back without calling API
    expect(mockPut).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('validates empty name', async () => {
    const { getByText, getByDisplayValue } = renderEditProfile();
    const nameInput = getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(getByText('Save Changes'));
    expect(getByText('Name is required')).toBeTruthy();
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('validates invalid username format', async () => {
    const { getByText, getByDisplayValue } = renderEditProfile();
    const usernameInput = getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'AB' } });
    fireEvent.click(getByText('Save Changes'));
    expect(getByText('Must be 3-30 chars: letters, numbers, . _ -')).toBeTruthy();
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('calls API and shows success toast on save', async () => {
    mockPut.mockResolvedValueOnce({ name: 'New Name', username: 'testuser', bio: 'Hello world' });
    const { getByText, getByDisplayValue } = renderEditProfile();

    const nameInput = getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/auth/profile', { name: 'New Name' });
    });
    expect(mockUpdateUser).toHaveBeenCalledWith({ name: 'New Name', username: 'testuser', bio: 'Hello world' });
    expect(mockShowToast).toHaveBeenCalledWith('Profile updated', 'success');
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows inline field error from API (e.g. username taken)', async () => {
    const { ApiError } = require('@/api/client');
    mockPut.mockRejectedValueOnce(new ApiError('Username already taken', 409, 'username'));
    const { getByText, getByDisplayValue } = renderEditProfile();

    const usernameInput = getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'taken_name' } });
    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(getByText('Username already taken')).toBeTruthy();
    });
    // Should NOT show toast for field-level errors
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('shows error toast on generic API failure', async () => {
    mockPut.mockRejectedValueOnce(new Error('Server is down'));
    const { getByText, getByDisplayValue } = renderEditProfile();

    const nameInput = getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Changed' } });
    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Server is down', 'error');
    });
  });
});
