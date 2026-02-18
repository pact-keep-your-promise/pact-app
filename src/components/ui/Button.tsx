import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isPrimary ? colors.textPrimary : colors.primary}
            style={{ marginRight: spacing.sm }}
          />
        )}
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            isSecondary && styles.secondaryText,
            variant === 'ghost' && styles.ghostText,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.bodyBold,
  },
  primaryText: {
    color: colors.textPrimary,
  },
  secondaryText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
});
