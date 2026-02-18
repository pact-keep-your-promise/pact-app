import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = colors.primary,
}: ProgressRingProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const innerSize = size - strokeWidth * 2;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.border,
          },
        ]}
      />
      <View
        style={[
          styles.progress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: clampedProgress > 0.25 ? color : 'transparent',
            borderRightColor: clampedProgress > 0.5 ? color : 'transparent',
            borderBottomColor: clampedProgress > 0.75 ? color : 'transparent',
            borderLeftColor: clampedProgress > 0 ? color : 'transparent',
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  track: {
    position: 'absolute',
  },
  progress: {
    position: 'absolute',
  },
});
