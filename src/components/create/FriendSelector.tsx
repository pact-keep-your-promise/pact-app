import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { users } from '@/data/mock';
import Avatar from '@/components/ui/Avatar';

const friends = users.filter((u) => !u.isCurrentUser);

interface FriendSelectorProps {
  selectedIds: string[];
  onToggle: (userId: string) => void;
}

export default function FriendSelector({ selectedIds, onToggle }: FriendSelectorProps) {
  return (
    <View>
      {friends.map((user, index) => {
        const isSelected = selectedIds.includes(user.id);
        return (
          <View key={user.id}>
            <Pressable
              style={styles.row}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggle(user.id);
              }}
            >
              <Avatar uri={user.avatar} name={user.name} size={44} />
              <View style={styles.info}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.username}>@{user.username}</Text>
              </View>
              <View style={[styles.check, isSelected && styles.checkSelected]}>
                {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  username: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
});
