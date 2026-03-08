import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Pact } from '@/data/types';
import IconBadge from '@/components/ui/IconBadge';
import { adaptColor } from '@/utils/colorUtils';

interface PactDetailHeaderProps {
  pact: Pact;
  children?: React.ReactNode;
}

export default function PactDetailHeader({ pact, children }: PactDetailHeaderProps) {
  const { colors, isDark } = useTheme();
  const pactColor = adaptColor(pact.color, isDark);

  return (
    <View style={[styles.container, { backgroundColor: withAlpha(pactColor, 0.07) }]}>
      <IconBadge icon={pact.icon} color={pactColor} size={64} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{pact.title}</Text>
      <Text style={[styles.frequency, { color: colors.textSecondary }]}>
        {pact.frequency === 'daily' ? 'Daily' : `${pact.timesPerWeek}x per week`}
      </Text>
      <Text style={[styles.since, { color: colors.textTertiary }]}>Since {pact.createdAt}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    marginTop: spacing.lg,
  },
  frequency: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  since: {
    ...typography.tiny,
    marginTop: spacing.sm,
  },
});
