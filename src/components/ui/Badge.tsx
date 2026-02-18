import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
}

export default function Badge({
  label,
  color = colors.backgroundTertiary,
  textColor = colors.textPrimary,
  size = 'sm',
}: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }, size === 'md' && styles.md]}>
      <Text style={[styles.text, { color: textColor }, size === 'md' && styles.mdText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  text: {
    ...typography.tiny,
  },
  mdText: {
    ...typography.caption,
  },
});
