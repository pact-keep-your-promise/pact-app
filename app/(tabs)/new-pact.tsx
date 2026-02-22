import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/contexts/DataContext';
import { api } from '@/api/client';
import IconSelector from '@/components/create/IconSelector';
import FrequencyPicker from '@/components/create/FrequencyPicker';
import FriendSelector from '@/components/create/FriendSelector';
import Button from '@/components/ui/Button';

function SuccessScreen({ insets, colors, friendCount }: { insets: any; colors: any; friendCount: number }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, styles.successContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Animated.View style={[styles.successContent, { opacity, transform: [{ scale }] }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark-circle" size={64} color={colors.onSuccess} />
        </View>
        <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Pact Created!</Text>
        <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
          {friendCount > 0
            ? `You and ${friendCount} friend${friendCount > 1 ? 's' : ''} made a pact!`
            : 'Your personal pact is set!'}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function NewPactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(colors.primary);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [created, setCreated] = useState(false);

  const { refetch } = useData();

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Give your pact a name!');
      return;
    }
    if (!selectedIcon) {
      Alert.alert('Missing Icon', 'Choose an icon for your pact!');
      return;
    }

    try {
      await api.post('/pacts', {
        title: title.trim(),
        icon: selectedIcon,
        color: selectedColor,
        frequency,
        timesPerWeek: frequency === 'weekly' ? timesPerWeek : undefined,
        participants: selectedFriends,
      });
      await refetch();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create pact');
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
      <SuccessScreen
        insets={insets}
        colors={colors}
        friendCount={selectedFriends.length}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
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
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>New Pact</Text>
            <Text style={[styles.screenSubtitle, { color: colors.textTertiary }]}>Make a commitment</Text>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>What's the pact?</Text>
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="e.g., Morning Run, Read Daily..."
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={40}
              autoCapitalize="words"
            />
            <Text style={[styles.charCount, { color: colors.textTertiary }]}>{title.length}/40</Text>
          </View>

          {/* Icon Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Choose an icon</Text>
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
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>How often?</Text>
            <FrequencyPicker
              frequency={frequency}
              timesPerWeek={timesPerWeek}
              onChangeFrequency={setFrequency}
              onChangeTimesPerWeek={setTimesPerWeek}
            />
          </View>

          {/* Friend Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Invite friends (optional)</Text>
            <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>They'll join you in keeping the pact!</Text>
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

          <View style={{ height: layout.tabBarClearance + spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  successContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  screenTitle: {
    ...typography.h1,
    paddingTop: spacing.lg,
  },
  screenSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  sectionHint: {
    ...typography.caption,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  titleInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body,
  },
  charCount: {
    ...typography.tiny,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  createSection: {
    marginTop: spacing.lg,
  },
});
