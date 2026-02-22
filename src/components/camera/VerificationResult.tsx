import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Pact } from '@/data/types';
import { useAuth } from '@/contexts/AuthContext';
import { useDataHelpers } from '@/api/helpers';
import Button from '@/components/ui/Button';
import PactMatchCard from './PactMatchCard';

function ConfettiParticle({ index }: { index: number }) {
  const { colors } = useTheme();
  const confettiColors = [colors.primary, colors.success, colors.accent1, colors.accent2, colors.accent3, colors.streakGold];
  const color = confettiColors[index % confettiColors.length];

  const angle = (index / 20) * Math.PI * 2;
  const distance = 80 + Math.random() * 120;
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance - 50;
  const size = 6 + Math.random() * 6;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = 400 + index * 30;
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateX, { toValue: targetX, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: targetY, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();
      }, 600);
    }, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
}

interface VerificationResultProps {
  matched: boolean;
  pact?: Pact;
  onSend: () => void;
  onRetry: () => void;
  onChangePact?: () => void;
  loading?: boolean;
}

export default function VerificationResult({ matched, pact, onSend, onRetry, onChangePact, loading }: VerificationResultProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { getStreakForUserPact } = useDataHelpers();
  const streak = pact ? getStreakForUserPact(pact.id, user?.id || '') : undefined;
  const iconScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(iconScale, { toValue: 1, delay: 200, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  if (matched && pact) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.confettiContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </View>

        <Animated.View style={[styles.iconCircle, { backgroundColor: colors.success, shadowColor: colors.success, transform: [{ scale: iconScale }] }]}>
          <Ionicons name="checkmark" size={48} color={colors.onPrimary} />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleOpacity, color: colors.textPrimary }]}>
          Pact Verified!
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: titleOpacity, color: colors.textSecondary }]}>
          Your streak continues!
        </Animated.Text>

        <Animated.View style={[styles.cardWrapper, { opacity: contentOpacity }]}>
          <PactMatchCard pact={pact} streakDays={(streak?.currentStreak || 0) + 1} />
          {onChangePact && (
            <Pressable onPress={onChangePact} style={styles.changePactBtn}>
              <Ionicons name="swap-horizontal" size={16} color={colors.textSecondary} />
              <Text style={[styles.changePactText, { color: colors.textSecondary }]}>
                Not right? Change pact
              </Text>
            </Pressable>
          )}
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { opacity: contentOpacity }]}>
          <Button title="Send to Pact" onPress={onSend} variant="primary" fullWidth icon="send" loading={loading} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.iconCircle, { backgroundColor: colors.error, shadowColor: colors.error, transform: [{ scale: iconScale }] }]}>
        <Ionicons name="close" size={48} color={colors.onPrimary} />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: titleOpacity, color: colors.textPrimary }]}>
        No Match Found
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: titleOpacity, color: colors.textSecondary }]}>
        We couldn't match this to any of your pacts
      </Animated.Text>

      <Animated.View style={[styles.buttonWrapper, { opacity: contentOpacity }]}>
        <Button title="Try Again" onPress={onRetry} variant="primary" fullWidth icon="camera" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  confettiContainer: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  title: {
    ...typography.h1,
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cardWrapper: {
    width: '100%',
    marginTop: spacing.xxxl,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: spacing.xxl,
  },
  changePactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  changePactText: {
    ...typography.caption,
  },
});
