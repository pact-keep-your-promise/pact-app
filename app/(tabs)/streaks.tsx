import React from 'react';
import { View, ScrollView, StyleSheet, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, layout, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDataHelpers } from '@/api/helpers';
import StreakCard from '@/components/streaks/StreakCard';
import ActivityGraph from '@/components/streaks/ActivityGraph';
import Header from '@/components/shared/Header';
import EmptyState from '@/components/shared/EmptyState';
import Card from '@/components/ui/Card';
import { adaptColor } from '@/utils/colorUtils';

const HEADER_HEIGHT = 72;

export default function StreaksScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { pacts, streaks: streakData, getAggregateActivity } = useDataHelpers();
  const aggregateActivity = getAggregateActivity(user?.id || '');
  const graphColor = adaptColor(colors.primary, isDark);

  const totalStreak = streakData
    .reduce((sum, s) => sum + s.currentStreak, 0);

  const sortedPacts = [...pacts].sort((a, b) => {
    const streakA = streakData.find(s => s.pactId === a.id)?.currentStreak || 0;
    const streakB = streakData.find(s => s.pactId === b.id)?.currentStreak || 0;
    return streakB - streakA;
  });

  const hasStreaks = streakData.length > 0;

  const headerContent = (
    <View style={[styles.stickyHeaderInner, { paddingHorizontal: spacing.xl }]}>
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
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      {Platform.OS === 'web' ? (
        <View style={{ position: 'absolute' as any, top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: colors.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
          {headerContent}
        </View>
      ) : (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.stickyHeader, { borderBottomColor: colors.border }]}
        >
          {headerContent}
        </BlurView>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_HEIGHT }]}
      >
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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stickyHeaderInner: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
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
