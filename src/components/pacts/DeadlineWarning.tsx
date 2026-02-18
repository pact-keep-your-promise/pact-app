import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface DeadlineWarningProps {
  pactTitle: string;
  hoursLeft: number;
  onDismiss: () => void;
}

export default function DeadlineWarning({ pactTitle, hoursLeft, onDismiss }: DeadlineWarningProps) {
  return (
    <View style={styles.banner}>
      <Ionicons name="warning" size={20} color={colors.warning} />
      <Text style={styles.text} numberOfLines={2}>
        <Text style={styles.bold}>{hoursLeft}h left</Text> to submit for {pactTitle}!
      </Text>
      <Pressable onPress={onDismiss} hitSlop={12}>
        <Ionicons name="close" size={18} color={colors.warning} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '40',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  text: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
});
