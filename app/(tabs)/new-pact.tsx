import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import IconSelector from '@/components/create/IconSelector';
import FrequencyPicker from '@/components/create/FrequencyPicker';
import FriendSelector from '@/components/create/FriendSelector';
import Button from '@/components/ui/Button';

export default function NewPactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(colors.primary);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [created, setCreated] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Give your pact a name!');
      return;
    }
    if (!selectedIcon) {
      Alert.alert('Missing Icon', 'Choose an icon for your pact!');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCreated(true);

    setTimeout(() => {
      setCreated(false);
      setTitle('');
      setSelectedIcon(null);
      setSelectedFriends([]);
      router.navigate('/(tabs)');
    }, 1500);
  };

  const toggleFriend = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFriends((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (created) {
    return (
      <View style={[styles.container, styles.successContainer, { paddingTop: insets.top }]}>
        <View style={styles.successContent}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Pact Created!</Text>
          <Text style={styles.successSubtitle}>
            {selectedFriends.length > 0
              ? `You and ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''} made a pact!`
              : 'Your personal pact is set!'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={styles.screenTitle}>New Pact</Text>
            <Text style={styles.screenSubtitle}>Make a commitment with friends</Text>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What's the pact?</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g., Morning Run, Read Daily..."
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={40}
              autoCapitalize="words"
            />
            <Text style={styles.charCount}>{title.length}/40</Text>
          </View>

          {/* Icon Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Choose an icon</Text>
            <IconSelector
              selectedIcon={selectedIcon}
              onSelect={(icon, color) => {
                setSelectedIcon(icon);
                setSelectedColor(color);
              }}
            />
          </View>

          {/* Frequency Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How often?</Text>
            <FrequencyPicker
              frequency={frequency}
              timesPerWeek={timesPerWeek}
              onChangeFrequency={setFrequency}
              onChangeTimesPerWeek={setTimesPerWeek}
            />
          </View>

          {/* Friend Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Invite friends</Text>
            <Text style={styles.sectionHint}>They'll need to keep the pact too!</Text>
            <FriendSelector
              selectedIds={selectedFriends}
              onToggle={toggleFriend}
            />
          </View>

          {/* Create Button */}
          <View style={styles.createSection}>
            <Button
              title="Create Pact"
              onPress={handleCreate}
              variant="primary"
              fullWidth
              icon="checkmark-circle"
            />
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  successContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  screenTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    paddingTop: spacing.lg,
  },
  screenSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  titleInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body,
    color: colors.textPrimary,
  },
  charCount: {
    ...typography.tiny,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  createSection: {
    marginTop: spacing.lg,
  },
});
