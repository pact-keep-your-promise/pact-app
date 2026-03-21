/**
 * Tests for ErrorBoundary and ErrorState components.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#111',
      textSecondary: '#666',
      textTertiary: '#999',
      primary: '#4ECDC4',
      border: '#ddd',
      background: '#fff',
      backgroundSecondary: '#f5f5f5',
    },
    isDark: false,
  }),
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import ErrorBoundary from '@/components/shared/ErrorBoundary';
import ErrorState from '@/components/shared/ErrorState';

// ─── Crasher component to trigger error boundary ───────────────────────────

function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test crash!');
  }
  return <div>Working fine</div>;
}

// ─── ErrorBoundary Tests ────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  // Suppress console.error from React error boundary and our componentDidCatch
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(getByText('Working fine')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test crash!')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('shows default message when error has no message', () => {
    function ThrowEmpty() {
      throw new Error('');
    }
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowEmpty />
      </ErrorBoundary>,
    );
    expect(getByText('An unexpected error occurred')).toBeTruthy();
  });

  it('calls onReset and recovers when Try Again is clicked', () => {
    const onReset = jest.fn();
    // We need a component that can toggle between broken/working
    let shouldThrow = true;

    function Togglable() {
      if (shouldThrow) throw new Error('Oops');
      return <div>Recovered</div>;
    }

    const { getByText, rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <Togglable />
      </ErrorBoundary>,
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Fix the component, then click Try Again
    shouldThrow = false;
    fireEvent.click(getByText('Try Again'));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(getByText('Recovered')).toBeTruthy();
  });
});

// ─── ErrorState Tests ───────────────────────────────────────────────────────

describe('ErrorState', () => {
  it('renders default message when none provided', () => {
    const { getByText } = render(<ErrorState />);
    expect(getByText('Failed to load')).toBeTruthy();
  });

  it('renders custom message', () => {
    const { getByText } = render(<ErrorState message="Couldn't load pacts" />);
    expect(getByText("Couldn't load pacts")).toBeTruthy();
  });

  it('shows Try Again button when onRetry is provided', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorState onRetry={onRetry} />);
    const btn = getByText('Try Again');
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when onRetry is not provided', () => {
    const { queryByText } = render(<ErrorState message="Error" />);
    expect(queryByText('Try Again')).toBeNull();
  });

  it('renders in compact mode', () => {
    const { getByText } = render(<ErrorState compact message="Small error" />);
    expect(getByText('Small error')).toBeTruthy();
  });
});
