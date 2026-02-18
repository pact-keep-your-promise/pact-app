import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  'new-pact': 'add-circle',
  streaks: 'flame',
  camera: 'camera',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Pacts',
  'new-pact': 'New',
  streaks: 'Streaks',
  camera: 'Verify',
};

export default function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.container}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const iconName = TAB_ICONS[route.name] || 'ellipse';
            const label = TAB_LABELS[route.name] || route.name;
            const isCamera = route.name === 'camera';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            if (isCamera) {
              return (
                <Pressable key={route.key} onPress={onPress} style={styles.cameraTabWrapper}>
                  <View style={[styles.cameraButton, isFocused && styles.cameraButtonActive]}>
                    <Ionicons
                      name={isFocused ? 'camera' : 'camera-outline'}
                      size={26}
                      color={isFocused ? colors.textPrimary : colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textTertiary }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            }

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.tab}>
                <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                  <Ionicons
                    name={
                      isFocused
                        ? (iconName as keyof typeof Ionicons.glyphMap)
                        : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap)
                    }
                    size={24}
                    color={isFocused ? colors.primary : colors.textTertiary}
                  />
                </View>
                <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textTertiary }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  blur: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(20, 20, 28, 0.85)',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(124, 92, 252, 0.12)',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  cameraTabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
  },
  cameraButton: {
    width: 48,
    height: 34,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
