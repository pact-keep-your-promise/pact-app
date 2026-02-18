import React from 'react';
import { View, Pressable, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { pactIcons } from '@/constants/icons';

interface IconSelectorProps {
  selectedIcon: string | null;
  onSelect: (icon: string, color: string) => void;
}

export default function IconSelector({ selectedIcon, onSelect }: IconSelectorProps) {
  return (
    <FlatList
      data={pactIcons}
      numColumns={5}
      scrollEnabled={false}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      renderItem={({ item, index }) => {
        const isSelected = selectedIcon === item.name;
        return (
          <View>
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: item.color + '15' },
                isSelected && { borderColor: item.color, borderWidth: 2, backgroundColor: item.color + '30' },
              ]}
              onPress={() => onSelect(item.name, item.color)}
            >
              <Ionicons
                name={item.name as keyof typeof Ionicons.glyphMap}
                size={24}
                color={item.color}
              />
            </Pressable>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
