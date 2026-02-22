import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useUsers } from '@/api/queries';

const AVATAR_SIZE = 64;

interface FriendSelectorProps {
  selectedIds: string[];
  onToggle: (userId: string) => void;
}

export default function FriendSelector({ selectedIds, onToggle }: FriendSelectorProps) {
  const { colors } = useTheme();
  const { data: users = [] } = useUsers();
  const friends = users;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* Invite button */}
      <Pressable style={styles.item} onPress={() => Alert.alert('Coming Soon', 'Share invite link feature is coming soon!')}>
        <View style={[styles.inviteCircle, { borderColor: colors.textTertiary }]}>
          <Ionicons name="add" size={28} color={colors.textTertiary} />
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Invite</Text>
      </Pressable>

      {/* Friends */}
      {friends.map((user) => {
        const isSelected = selectedIds.includes(user.id);
        const firstName = user.name.split(' ')[0];

        return (
          <Pressable
            key={user.id}
            style={styles.item}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggle(user.id);
            }}
          >
            <View>
              <Image source={{ uri: user.avatar }} style={[styles.avatar, isSelected && { borderColor: colors.primary, borderWidth: 2 }]} />
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: colors.success }]}>
                  <Ionicons name="checkmark" size={12} color={colors.onSuccess} />
                </View>
              )}
            </View>
            <Text
              style={[styles.label, { color: isSelected ? colors.textPrimary : colors.textSecondary }]}
              numberOfLines={1}
            >
              {firstName}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  item: {
    alignItems: 'center',
    width: AVATAR_SIZE + spacing.md,
  },
  inviteCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
