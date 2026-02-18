import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Pact } from '@/data/types';
import { getStreakForUserPact } from '@/data/mock';
import Button from '@/components/ui/Button';
import PactMatchCard from './PactMatchCard';

function ConfettiParticle({ index }: { index: number }) {
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
}

export default function VerificationResult({ matched, pact, onSend, onRetry }: VerificationResultProps) {
  const streak = pact ? getStreakForUserPact(pact.id, 'u1') : undefined;
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
      <View style={styles.container}>
        <View style={styles.confettiContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </View>

        <Animated.View style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}>
          <Ionicons name="checkmark" size={48} color={colors.textPrimary} />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          Pact Verified!
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: titleOpacity }]}>
          Your streak continues!
        </Animated.Text>

        <Animated.View style={[styles.cardWrapper, { opacity: contentOpacity }]}>
          <PactMatchCard pact={pact} streakDays={(streak?.currentStreak || 0) + 1} />
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { opacity: contentOpacity }]}>
          <Button title="Send to Pact" onPress={onSend} variant="primary" fullWidth icon="send" />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconCircle, styles.errorCircle, { transform: [{ scale: iconScale }] }]}>
        <Ionicons name="close" size={48} color={colors.textPrimary} />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
        No Match Found
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: titleOpacity }]}>
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
    backgroundColor: colors.background,
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
    borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  errorCircle: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
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
});
