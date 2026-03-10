import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useFlatRecentActivity, useRecentActivity } from '@/api/queries';
import ActivityWidget from './ActivityWidget';
import EmptyState from '@/components/shared/EmptyState';

export default function ActivityFeed() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: activity } = useFlatRecentActivity();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useRecentActivity();

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (activity.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Recent Activity</Text>
        <EmptyState icon="images-outline" title="No activity yet" subtitle="Photos will appear here when friends verify" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Recent Activity</Text>
      <FlatList
        data={activity}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityWidget submission={item} onPress={() => router.push(`/pact/${item.pactId}`)} />}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.textTertiary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  list: {
    paddingRight: spacing.xl,
  },
  footerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
});
