import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Pact } from '@/data/types';
import IconBadge from '@/components/ui/IconBadge';

interface PactMatchCardProps {
  pact: Pact;
  streakDays: number;
}

export default function PactMatchCard({ pact, streakDays }: PactMatchCardProps) {
  const slideY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, delay: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY: slideY }] }]}>
      <View style={styles.row}>
        <IconBadge icon={pact.icon} color={pact.color} size={48} />
        <View style={styles.info}>
          <Text style={styles.title}>{pact.title}</Text>
          <Text style={styles.streak}>Day {streakDays} 🔥</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.success + '40',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  streak: {
    ...typography.bodyBold,
    color: colors.streakFire,
    marginTop: spacing.xs,
  },
});
