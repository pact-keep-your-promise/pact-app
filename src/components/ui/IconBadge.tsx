import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconBadgeProps {
  icon: string;
  color: string;
  size?: number;
}

export default function IconBadge({ icon, color, size = 40 }: IconBadgeProps) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '20',
        },
      ]}
    >
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={size * 0.5}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
