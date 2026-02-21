import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, layout, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StreakCard from '@/components/streaks/StreakCard';
import ActivityGraph from '@/components/streaks/ActivityGraph';
import Header from '@/components/shared/Header';
import EmptyState from '@/components/shared/EmptyState';
import Card from '@/components/ui/Card';
import { adaptColor } from '@/utils/colorUtils';

export default function StreaksScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { pacts, streaks: streakData, getAggregateActivity } = useData();
  const aggregateActivity = getAggregateActivity(user?.id || '');
  const graphColor = adaptColor(colors.primary, isDark);

  const totalStreak = streakData
    .filter((s) => s.userId === user?.id)
    .reduce((sum, s) => sum + s.currentStreak, 0);

  const sortedPacts = [...pacts].sort((a, b) => {
    const streakA = streakData.find(s => s.pactId === a.id && s.userId === user?.id)?.currentStreak || 0;
    const streakB = streakData.find(s => s.pactId === b.id && s.userId === user?.id)?.currentStreak || 0;
    return streakB - streakA;
  });

  const hasStreaks = streakData.some(s => s.userId === user?.id);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header
          title="Streaks"
          subtitle="Your consistency journey"
          rightAction={
            <View style={[styles.totalBadge, { backgroundColor: withAlpha(colors.streakFireText, 0.12) }]}>
              <Ionicons name="flame" size={18} color={colors.streakFireText} />
              <Text style={[styles.totalCount, { color: colors.streakFireText }]}>{totalStreak}</Text>
              <Text style={[styles.totalLabel, { color: colors.streakFireText }]}>total</Text>
            </View>
          }
        />

        {hasStreaks && (
          <Card style={styles.activityCard}>
            <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>Activity</Text>
            <ActivityGraph
              activityMap={aggregateActivity}
              color={graphColor}
              weeksToShow={16}
            />
          </Card>
        )}

        {hasStreaks ? (
          sortedPacts.map((pact) => (
            <View key={pact.id}>
              <StreakCard pact={pact} />
            </View>
          ))
        ) : (
          <EmptyState icon="flame-outline" title="No streaks yet" subtitle="Start a pact to build your streak" />
        )}

        <View style={{ height: layout.tabBarClearance }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  totalCount: {
    ...typography.h3,
  },
  totalLabel: {
    ...typography.caption,
    opacity: 0.7,
  },
  activityCard: {
    marginBottom: spacing.lg,
  },
  activityTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
});
