import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({ message, onRetry, compact }: ErrorStateProps) {
  const { colors } = useTheme();
  const iconSize = compact ? 36 : 48;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Ionicons name="cloud-offline-outline" size={iconSize} color={colors.textTertiary} />
      <Text style={[compact ? styles.compactTitle : styles.title, { color: colors.textPrimary }]}>
        {message || 'Failed to load'}
      </Text>
      {onRetry && (
        <Pressable
          style={[styles.retryBtn, { borderColor: colors.border }]}
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={[styles.retryText, { color: colors.primary }]}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    gap: spacing.md,
  },
  compact: {
    paddingVertical: spacing.xxl,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  compactTitle: {
    ...typography.body,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  retryText: {
    ...typography.captionBold,
  },
});
