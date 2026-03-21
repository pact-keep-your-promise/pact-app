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
import { FreezeInfo } from '@/data/types';

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

  // Aggregate freeze inventory across all pacts
  const freezeInventory = streakData
    .filter(s => s.freezeInfo)
    .map(s => ({
      pact: pacts.find(p => p.id === s.pactId),
      freezeInfo: s.freezeInfo as FreezeInfo,
      streakType: s.streakType,
    }))
    .filter(item => item.pact);

  const totalFreezes = freezeInventory.reduce((sum, item) => sum + item.freezeInfo.available, 0);
  const totalUsed = freezeInventory.reduce((sum, item) => sum + item.freezeInfo.used, 0);

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

        {/* Freeze Inventory */}
        {freezeInventory.length > 0 && (
          <Card style={styles.freezeCard}>
            <View style={styles.freezeHeader}>
              <View style={styles.freezeHeaderLeft}>
                <Ionicons name="snow" size={20} color="#5BC0EB" />
                <Text style={[styles.freezeTitle, { color: colors.textPrimary }]}>Streak Freezes</Text>
              </View>
              <View style={[styles.freezeTotalBadge, { backgroundColor: 'rgba(91, 192, 235, 0.12)' }]}>
                <Text style={styles.freezeTotalText}>{totalFreezes}</Text>
                <Text style={styles.freezeTotalLabel}>available</Text>
              </View>
            </View>
            {freezeInventory.map(({ pact: p, freezeInfo: fi, streakType }) => {
              const pColor = adaptColor(p!.color, isDark);
              const isWeekly = streakType === 'weekly';
              const earnUnit = isWeekly ? 'w' : 'd';
              const dotCount = Math.min(fi.maxFreezes ?? 2, 4);
              return (
                <View key={p!.id} style={[styles.freezeRow, { borderTopColor: colors.border }]}>
                  <View style={styles.freezeRowLeft}>
                    <Text style={[styles.freezePactName, { color: colors.textPrimary }]} numberOfLines={1}>{p!.title}</Text>
                    <Text style={[styles.freezeStatus, { color: colors.textTertiary }]}>
                      {fi.available > 0
                        ? `${fi.available} freeze${fi.available > 1 ? 's' : ''} ready`
                        : fi.nextFreezeIn > 0
                          ? `${fi.nextFreezeIn}${earnUnit} to earn`
                          : 'Earning...'}
                    </Text>
                  </View>
                  <View style={styles.freezeDotsSmall}>
                    {Array.from({ length: dotCount }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.freezeDotSmall,
                          {
                            backgroundColor: i < fi.available ? '#5BC0EB' : colors.backgroundTertiary,
                          },
                        ]}
                      >
                        <Ionicons name="snow" size={10} color={i < fi.available ? '#fff' : colors.textTertiary} />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
            {totalUsed > 0 && (
              <Text style={[styles.freezeUsedNote, { color: colors.textTertiary }]}>
                {totalUsed} freeze{totalUsed !== 1 ? 's' : ''} used all time
              </Text>
            )}
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
  freezeCard: {
    marginBottom: spacing.lg,
  },
  freezeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  freezeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  freezeTitle: {
    ...typography.bodyBold,
  },
  freezeTotalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  freezeTotalText: {
    ...typography.bodyBold,
    color: '#5BC0EB',
  },
  freezeTotalLabel: {
    ...typography.caption,
    color: '#5BC0EB',
    opacity: 0.8,
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  freezeRowLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  freezePactName: {
    ...typography.body,
  },
  freezeStatus: {
    ...typography.caption,
    marginTop: 2,
  },
  freezeDotsSmall: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  freezeDotSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeUsedNote: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
