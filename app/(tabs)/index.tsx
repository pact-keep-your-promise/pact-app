import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { pacts, currentUser, notifications } from '@/data/mock';
import PactCard from '@/components/pacts/PactCard';
import ActivityFeed from '@/components/pacts/ActivityFeed';
import DeadlineWarning from '@/components/pacts/DeadlineWarning';

export default function PactsHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showWarning, setShowWarning] = useState(true);

  const deadlineWarning = notifications.find(n => n.type === 'deadline_warning' && !n.read);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>pact</Text>
            <Text style={styles.greeting}>Keep your promises</Text>
          </View>
          <Pressable style={styles.profileButton}>
            <Image source={{ uri: currentUser.avatar }} style={styles.profileAvatar} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        {/* Deadline Warning */}
        {showWarning && deadlineWarning && (
          <View>
            <DeadlineWarning
              pactTitle="Meditate"
              hoursLeft={2}
              onDismiss={() => setShowWarning(false)}
            />
          </View>
        )}

        {/* Activity Feed */}
        <View>
          <ActivityFeed />
        </View>

        {/* Pacts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Pacts</Text>
          <Text style={styles.sectionCount}>{pacts.length} active</Text>
        </View>

        {pacts.map((pact) => (
          <View key={pact.id}>
            <PactCard
              pact={pact}
              onPress={() => router.push(`/pact/${pact.id}`)}
            />
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
    paddingBottom: spacing.xl,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  greeting: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  profileButton: {
    position: 'relative',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.background,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
