import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Text, Animated, Easing } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

const PHOTO_SIZE = 260;

interface AIAnalyzingProps {
  photoUri: string;
  onComplete: (matched: boolean, pactId?: string) => void;
}

const STATUS_TEXTS = [
  'Checking habits...',
  'Matching pacts...',
  'Verifying activity...',
  'Almost there...',
];

export default function AIAnalyzing({ photoUri, onComplete }: AIAnalyzingProps) {
  const [dotCount, setDotCount] = useState(1);
  const [statusIndex, setStatusIndex] = useState(0);

  const scanLineY = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1.0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const triggerComplete = useCallback(() => {
    const matched = Math.random() < 0.8;
    onComplete(matched, matched ? 'p1' : undefined);
  }, [onComplete]);

  useEffect(() => {
    // Fade in overlay
    Animated.timing(overlayOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Scanning line animation
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

    // Pulsing glow
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

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);

    // Rotating status text
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_TEXTS.length);
    }, 1000);

    // Complete after 3 seconds
    const completeTimeout = setTimeout(triggerComplete, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(statusInterval);
      clearTimeout(completeTimeout);
    };
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <View style={styles.content}>
        <View style={styles.photoContainer}>
          {/* Glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              { transform: [{ scale: glowScale }], opacity: glowOpacity },
            ]}
          />

          {/* Photo with scan line */}
          <View style={styles.photoWrapper}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <View style={styles.scanOverlay}>
              <Animated.View
                style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
              />
            </View>
          </View>
        </View>

        <Text style={styles.analyzingText}>
          Analyzing your photo{'.'.repeat(dotCount)}
        </Text>
        <Text style={styles.statusText}>{STATUS_TEXTS[statusIndex]}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
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
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  analyzingText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xxxl,
    textAlign: 'center',
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
