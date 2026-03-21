import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakFlameProps {
  size: number;
  color: string;
  /** Higher streak = more intense animation */
  streak: number;
  /** Whether to animate */
  active?: boolean;
}

/**
 * Animated flame icon with subtle pulse.
 * Intensity scales with streak count.
 */
export default function StreakFlame({ size, color, streak, active = true }: StreakFlameProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active || streak === 0) {
      pulseAnim.setValue(1);
      return;
    }

    // Faster pulse for higher streaks
    const speed = Math.max(600, 1200 - streak * 40);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: speed, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: speed, useNativeDriver: true }),
      ])
    );

    pulseLoop.start();
    return () => { pulseLoop.stop(); };
  }, [active, streak]);

  if (streak === 0) {
    return <Ionicons name="flame-outline" size={size} color={color} style={{ opacity: 0.4 }} />;
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Ionicons name="flame" size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
