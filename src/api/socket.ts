import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { getBaseUrl, getToken } from './client';
import { queryKeys } from './queryKeys';
import { ChatMessage, ReactionSummary } from '@/data/types';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

/** Connect to the WebSocket server. Call once from the app root. */
export async function connectSocket() {
  if (socket?.connected) return socket;

  const token = await getToken();
  if (!token) return null;

  const baseUrl = getBaseUrl();

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Hook that listens for real-time events for a specific pact
 * and updates the TanStack Query cache instantly.
 */
export function usePactSocket(pactId: string) {
  const queryClient = useQueryClient();
  const pactIdRef = useRef(pactId);
  pactIdRef.current = pactId;

  useEffect(() => {
    if (!socket || !pactId) return;

    // Ensure we're in the pact room
    socket.emit('join-pact', pactId);

    const handleNewMessage = (message: ChatMessage) => {
      if (message.pactId !== pactIdRef.current) return;

      // Update the messages cache by prepending the new message
      queryClient.setQueryData(
        queryKeys.messages.forPact(pactIdRef.current),
        (old: { messages: ChatMessage[]; hasMore: boolean } | undefined) => {
          if (!old) return { messages: [message], hasMore: false };
          // Avoid duplicates (sender also gets the broadcast)
          if (old.messages.some(m => m.id === message.id)) return old;
          return { ...old, messages: [message, ...old.messages] };
        }
      );
    };

    const handleReactionUpdate = (_data: { submissionId: string; reactions: ReactionSummary[] }) => {
      // Invalidate submissions to refetch with correct per-user `reacted` flags
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts.submissions(pactIdRef.current) });
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.recent });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('reaction-update', handleReactionUpdate);

    return () => {
      socket?.off('new-message', handleNewMessage);
      socket?.off('reaction-update', handleReactionUpdate);
    };
  }, [pactId, queryClient]);
}
