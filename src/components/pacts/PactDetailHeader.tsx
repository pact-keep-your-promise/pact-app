import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Pact } from '@/data/types';
import IconBadge from '@/components/ui/IconBadge';

interface PactDetailHeaderProps {
  pact: Pact;
}

export default function PactDetailHeader({ pact }: PactDetailHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor: pact.color + '12' }]}>
      <IconBadge icon={pact.icon} color={pact.color} size={64} />
      <Text style={styles.title}>{pact.title}</Text>
      <Text style={styles.frequency}>
        {pact.frequency === 'daily' ? 'Daily' : `${pact.timesPerWeek}x per week`}
      </Text>
      <Text style={styles.since}>Since {pact.createdAt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  frequency: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  since: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
