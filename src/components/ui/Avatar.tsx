import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  showBorder?: boolean;
}

const PASTEL_COLORS = ['#7C5CFC', '#FF6B6B', '#4ECDC4', '#FFE66D', '#F38181', '#95E1D3'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({ uri, name = '', size = 40, showBorder }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const bgColor = PASTEL_COLORS[name.length % PASTEL_COLORS.length];

  if (!uri || failed) {
    return (
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor + '30',
          },
          showBorder && { borderWidth: 2, borderColor: bgColor },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.38, color: bgColor }]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        showBorder && { borderWidth: 2, borderColor: colors.primary },
      ]}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});
