import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, typography } from '@/constants/theme';
import Avatar from './Avatar';

interface AvatarGroupProps {
  users: { avatar?: string; name: string }[];
  max?: number;
  size?: number;
}

export default function AvatarGroup({ users, max = 3, size = 28 }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <View style={styles.container}>
      {visible.map((user, i) => (
        <View
          key={i}
          style={[
            styles.avatarWrapper,
            i > 0 && { marginLeft: -8 },
            { zIndex: visible.length - i, borderRadius: (size + 4) / 2 },
          ]}
        >
          <Avatar uri={user.avatar} name={user.name} size={size} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.overflowBadge,
            { marginLeft: -8, width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.overflowText, { fontSize: size * 0.38 }]}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
  },
  overflowBadge: {
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
  },
  overflowText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
