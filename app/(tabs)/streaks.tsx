import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';
import { pacts, streakData } from '@/data/mock';
import StreakCard from '@/components/streaks/StreakCard';

export default function StreaksScreen() {
  const insets = useSafeAreaInsets();

  const totalStreak = streakData
    .filter((s) => s.userId === 'u1')
    .reduce((sum, s) => sum + s.currentStreak, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Streaks</Text>
            <Text style={styles.subtitle}>Your consistency journey</Text>
          </View>
          <View style={styles.totalBadge}>
            <Ionicons name="flame" size={18} color={colors.streakFire} />
            <Text style={styles.totalCount}>{totalStreak}</Text>
            <Text style={styles.totalLabel}>total</Text>
          </View>
        </View>

        {pacts.map((pact) => (
          <View key={pact.id}>
            <StreakCard pact={pact} />
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  totalCount: {
    ...typography.h3,
    color: colors.streakFire,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.streakFire,
    opacity: 0.7,
  },
});
