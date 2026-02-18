import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { getRecentActivity } from '@/data/mock';
import ActivityWidget from './ActivityWidget';

export default function ActivityFeed() {
  const activity = getRecentActivity();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      <FlatList
        data={activity}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityWidget submission={item} />}
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
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  list: {
    paddingRight: spacing.xl,
  },
});
