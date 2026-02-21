import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Text, Animated, Easing } from 'react-native';
import { spacing, typography, shadows } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Pact } from '@/data/types';

const PHOTO_SIZE = 260;

interface AIAnalyzingProps {
  photoUri: string;
  onComplete: (matched: boolean, pactId?: string) => void;
  availablePacts?: Pact[];
}

const STATUS_TEXTS = [
  'Scanning your photo...',
  'Detecting activity...',
  'Matching to your pacts...',
  'Almost there...',
];

export default function AIAnalyzing({ photoUri, onComplete, availablePacts }: AIAnalyzingProps) {
  const { colors } = useTheme();
  const [dotCount, setDotCount] = useState(1);
  const [statusIndex, setStatusIndex] = useState(0);

  const scanLineY = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1.0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const triggerComplete = useCallback(() => {
    // Always approve - pick the first available pact
    const matched = true;
    let detectedId: string | undefined;
    if (availablePacts && availablePacts.length > 0) {
      detectedId = availablePacts[0].id;
    }
    onComplete(matched, detectedId);
  }, [onComplete, availablePacts]);

  useEffect(() => {
    Animated.timing(overlayOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: PHOTO_SIZE,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    ).start();

    const dotsInterval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_TEXTS.length);
    }, 1000);

    const completeTimeout = setTimeout(triggerComplete, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(statusInterval);
      clearTimeout(completeTimeout);
    };
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity, backgroundColor: colors.overlayHeavy }]}>
      <View style={styles.content}>
        <View style={styles.photoContainer}>
          <Animated.View
            style={[
              styles.glowRing,
              {
                transform: [{ scale: glowScale }],
                opacity: glowOpacity,
                borderColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          />

          <View style={styles.photoWrapper}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <View style={styles.scanOverlay}>
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineY }],
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <Text style={[styles.analyzingText, { color: colors.overlayTextPrimary }]}>
          Analyzing your photo{'.'.repeat(dotCount)}
        </Text>
        <Text style={[styles.statusText, { color: colors.overlayTextTertiary }]}>{STATUS_TEXTS[statusIndex]}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  photoContainer: {
    width: PHOTO_SIZE + 40,
    height: PHOTO_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: PHOTO_SIZE + 24,
    height: PHOTO_SIZE + 24,
    borderRadius: (PHOTO_SIZE + 24) / 2,
    borderWidth: 3,
    ...shadows.glow,
    shadowOpacity: 0.6,
  },
  photoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    overflow: 'hidden',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    transform: [{ scale: 1.1 }],
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    ...shadows.md,
    shadowOpacity: 1,
  },
  analyzingText: {
    ...typography.h3,
    marginTop: spacing.xxxl,
    textAlign: 'center',
  },
  statusText: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
