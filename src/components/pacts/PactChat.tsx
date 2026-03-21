import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePactMessages } from '@/api/queries';
import { useSendMessage } from '@/api/mutations';
import { ChatMessage } from '@/data/types';
import Avatar from '@/components/ui/Avatar';

interface PactChatProps {
  pactId: string;
}

function formatTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function PactChat({ pactId }: PactChatProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { data, isLoading } = usePactMessages(pactId);
  const sendMessage = useSendMessage();

  const messages = data?.messages ?? [];

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
    setText('');
    sendMessage.mutate({ pactId, text: trimmed });
  }, [text, pactId, sendMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isMe = item.userId === user?.id;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowRight]}>
        {!isMe && (
          <Avatar uri={item.user.avatar} name={item.user.name} size={28} />
        )}
        <View
          style={[
            styles.bubble,
            isMe
              ? { backgroundColor: colors.primary, alignSelf: 'flex-end' }
              : { backgroundColor: colors.backgroundSecondary, alignSelf: 'flex-start' },
          ]}
        >
          {!isMe && (
            <Text style={[styles.senderName, { color: colors.primary }]}>{item.user.name}</Text>
          )}
          <Text style={[styles.messageText, { color: isMe ? '#fff' : colors.textPrimary }]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  }, [user?.id, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      {/* Header */}
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <Ionicons name="chatbubbles-outline" size={20} color={colors.textPrimary} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Chat</Text>
        {messages.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.countText}>{messages.length}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
      </Pressable>

      {/* Chat body */}
      {expanded && (
        <View style={styles.chatBody}>
          {isLoading ? (
            <ActivityIndicator style={styles.loading} color={colors.primary} />
          ) : messages.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textTertiary }]}>
              No messages yet. Start the conversation!
            </Text>
          ) : (
            <FlatList
              data={[...messages].reverse()}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input bar */}
          <View style={[styles.inputBar, { borderTopColor: colors.border }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textTertiary}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              maxLength={1000}
              multiline={false}
            />
            <Pressable
              style={[styles.sendButton, { backgroundColor: text.trim() ? colors.primary : colors.backgroundTertiary }]}
              onPress={handleSend}
              disabled={!text.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.bodyBold,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    ...typography.micro,
    color: '#fff',
    fontWeight: '600',
  },
  chatBody: {
    maxHeight: 400,
  },
  loading: {
    padding: spacing.xl,
  },
  empty: {
    ...typography.body,
    textAlign: 'center',
    padding: spacing.xl,
  },
  messageList: {
    maxHeight: 300,
    paddingHorizontal: spacing.md,
  },
  messageListContent: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  messageRowRight: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  senderName: {
    ...typography.captionBold,
    marginBottom: spacing.xxs,
  },
  messageText: {
    ...typography.body,
  },
  messageTime: {
    ...typography.micro,
    marginTop: spacing.xxs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
