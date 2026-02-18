import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export default function Chip({ label, selected, onPress, color = colors.primary }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: color + '20', borderColor: color }
          : { backgroundColor: 'transparent', borderColor: colors.border },
      ]}
    >
      <Text style={[styles.text, { color: selected ? color : colors.textTertiary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
