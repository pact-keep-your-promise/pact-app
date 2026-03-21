/**
 * Tests for ToastContext / ToastProvider.
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import { ToastProvider, useToast } from '@/contexts/ToastContext';

// ─── Helper consumer component ──────────────────────────────────────────────

function ToastTrigger({ message, type }: { message: string; type?: 'error' | 'success' | 'info' }) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message, type)}>
      Show Toast
    </button>
  );
}

function renderWithToast(message: string, type?: 'error' | 'success' | 'info') {
  return render(
    <ToastProvider>
      <ToastTrigger message={message} type={type} />
    </ToastProvider>,
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children without showing toast initially', () => {
    const { getByText, queryByText } = renderWithToast('Hello');
    expect(getByText('Show Toast')).toBeTruthy();
    // Toast message should not be visible
    expect(queryByText('Hello')).toBeNull();
  });

  it('shows toast when showToast is called', () => {
    const { getByText } = renderWithToast('Profile updated');
    fireEvent.click(getByText('Show Toast'));
    expect(getByText('Profile updated')).toBeTruthy();
  });

  it('shows error toast (default type)', () => {
    const { getByText } = renderWithToast('Something went wrong');
    fireEvent.click(getByText('Show Toast'));
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('shows success toast', () => {
    const { getByText } = renderWithToast('Saved!', 'success');
    fireEvent.click(getByText('Show Toast'));
    expect(getByText('Saved!')).toBeTruthy();
  });

  it('shows info toast', () => {
    const { getByText } = renderWithToast('FYI', 'info');
    fireEvent.click(getByText('Show Toast'));
    expect(getByText('FYI')).toBeTruthy();
  });

  it('auto-dismisses after 4 seconds', () => {
    const { getByText, queryByText } = renderWithToast('Bye soon');
    fireEvent.click(getByText('Show Toast'));
    expect(getByText('Bye soon')).toBeTruthy();

    // Advance past the 4s timeout + animation duration
    act(() => {
      jest.advanceTimersByTime(4500);
    });

    expect(queryByText('Bye soon')).toBeNull();
  });

  it('can be dismissed early by clicking', () => {
    const { getByText, queryByText } = renderWithToast('Dismiss me');
    fireEvent.click(getByText('Show Toast'));
    expect(getByText('Dismiss me')).toBeTruthy();

    // Click the toast to dismiss
    fireEvent.click(getByText('Dismiss me'));

    // After animation completes
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(queryByText('Dismiss me')).toBeNull();
  });

  it('replaces previous toast when called again', () => {
    const { getByText, queryByText } = render(
      <ToastProvider>
        <ToastTrigger message="First" type="error" />
        <ToastTrigger message="Second" type="success" />
      </ToastProvider>,
    );

    // Trigger buttons exist
    const buttons = document.querySelectorAll('button');
    fireEvent.click(buttons[0]); // Show "First"
    expect(getByText('First')).toBeTruthy();

    fireEvent.click(buttons[1]); // Show "Second" (replaces)
    expect(getByText('Second')).toBeTruthy();
    expect(queryByText('First')).toBeNull();
  });
});

describe('useToast outside provider', () => {
  it('returns a no-op showToast without crashing', () => {
    function Orphan() {
      const { showToast } = useToast();
      return <button onClick={() => showToast('nope')}>Try</button>;
    }

    const { getByText } = render(<Orphan />);
    // Calling showToast outside provider should not throw
    expect(() => fireEvent.click(getByText('Try'))).not.toThrow();
  });
});
