import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useDataHelpers } from '@/api/helpers';
import ActivityWidget from './ActivityWidget';
import EmptyState from '@/components/shared/EmptyState';

export default function ActivityFeed() {
  const { colors } = useTheme();
  const router = useRouter();
  const { getRecentActivity } = useDataHelpers();
  const activity = getRecentActivity();

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
});
