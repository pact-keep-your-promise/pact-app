import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { ReactionSummary } from '@/data/types';

const ALLOWED_EMOJIS = ['👏', '🔥', '💪', '❤️', '😍', '🎉'];

interface ReactionBarProps {
  reactions: ReactionSummary[];
  onToggle: (emoji: string) => void;
  disabled?: boolean;
}

export default function ReactionBar({ reactions, onToggle, disabled }: ReactionBarProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const existingEmojis = reactions.map(r => r.emoji);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {reactions.map((r) => (
          <Pressable
            key={r.emoji}
            style={[
              styles.pill,
              { backgroundColor: r.reacted ? colors.primary + '30' : colors.backgroundSecondary, borderColor: r.reacted ? colors.primary : colors.border },
            ]}
            onPress={() => !disabled && onToggle(r.emoji)}
            disabled={disabled}
          >
            <Text style={styles.emoji}>{r.emoji}</Text>
            <Text style={[styles.count, { color: r.reacted ? colors.primary : colors.textSecondary }]}>{r.count}</Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          onPress={() => setShowPicker(!showPicker)}
        >
          <Text style={[styles.addIcon, { color: colors.textSecondary }]}>{showPicker ? '✕' : '+'}</Text>
        </Pressable>
      </View>

      {showPicker && (
        <View style={[styles.picker, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          {ALLOWED_EMOJIS.filter(e => !existingEmojis.includes(e)).map((emoji) => (
            <Pressable
              key={emoji}
              style={styles.pickerEmoji}
              onPress={() => {
                onToggle(emoji);
                setShowPicker(false);
              }}
              disabled={disabled}
            >
              <Text style={styles.pickerEmojiText}>{emoji}</Text>
            </Pressable>
          ))}
          {/* Also show already-used emojis so user can toggle them from picker */}
          {ALLOWED_EMOJIS.filter(e => existingEmojis.includes(e)).map((emoji) => {
            const r = reactions.find(r => r.emoji === emoji);
            return (
              <Pressable
                key={emoji}
                style={[styles.pickerEmoji, r?.reacted && { backgroundColor: colors.primary + '30', borderRadius: borderRadius.full }]}
                onPress={() => {
                  onToggle(emoji);
                  setShowPicker(false);
                }}
                disabled={disabled}
              >
                <Text style={styles.pickerEmojiText}>{emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xxs,
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    ...typography.caption,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 16,
    lineHeight: 18,
  },
  picker: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  pickerEmoji: {
    padding: spacing.xs,
  },
  pickerEmojiText: {
    fontSize: 22,
  },
});
