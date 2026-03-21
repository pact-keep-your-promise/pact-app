import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/api/mutations';
import { useToast } from '@/contexts/ToastContext';
import { ApiError } from '@/api/client';
import Button from '@/components/ui/Button';

const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      newErrors.username = 'Must be 3-30 chars: letters, numbers, . _ -';
    }

    if (bio.trim().length > 160) {
      newErrors.bio = 'Bio must be 160 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const updates: Record<string, string> = {};
    if (name.trim() !== user?.name) updates.name = name.trim();
    if (username.trim().toLowerCase() !== user?.username) updates.username = username.trim().toLowerCase();
    if (bio.trim() !== (user?.bio || '')) updates.bio = bio.trim();

    if (Object.keys(updates).length === 0) {
      router.back();
      return;
    }

    try {
      const updated = await updateProfile.mutateAsync(updates);
      updateUser({ name: updated.name, username: updated.username, bio: updated.bio });
      showToast('Profile updated', 'success');
      router.back();
    } catch (err) {
      if (err instanceof ApiError && err.field) {
        setErrors({ [err.field]: err.message });
      } else {
        showToast((err as Error).message || 'Failed to update profile', 'error');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.backgroundSecondary, borderColor: errors.name ? colors.error : colors.border, color: colors.textPrimary },
              ]}
              value={name}
              onChangeText={(v) => { setName(v); setErrors(e => ({ ...e, name: '' })); }}
              maxLength={50}
              placeholder="Your display name"
              placeholderTextColor={colors.textTertiary}
            />
            <View style={styles.fieldFooter}>
              {errors.name ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>
              ) : <View />}
              <Text style={[styles.counter, { color: colors.textTertiary }]}>{name.trim().length}/50</Text>
            </View>
          </View>

          {/* Username */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.backgroundSecondary, borderColor: errors.username ? colors.error : colors.border, color: colors.textPrimary },
              ]}
              value={username}
              onChangeText={(v) => { setUsername(v.toLowerCase()); setErrors(e => ({ ...e, username: '' })); }}
              maxLength={30}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="your_username"
              placeholderTextColor={colors.textTertiary}
            />
            <View style={styles.fieldFooter}>
              {errors.username ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.username}</Text>
              ) : <View />}
              <Text style={[styles.counter, { color: colors.textTertiary }]}>{username.trim().length}/30</Text>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Bio</Text>
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                { backgroundColor: colors.backgroundSecondary, borderColor: errors.bio ? colors.error : colors.border, color: colors.textPrimary },
              ]}
              value={bio}
              onChangeText={(v) => { setBio(v); setErrors(e => ({ ...e, bio: '' })); }}
              maxLength={160}
              multiline
              numberOfLines={3}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textTertiary}
              textAlignVertical="top"
            />
            <View style={styles.fieldFooter}>
              {errors.bio ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.bio}</Text>
              ) : <View />}
              <Text style={[styles.counter, { color: bio.trim().length > 150 ? colors.error : colors.textTertiary }]}>
                {bio.trim().length}/160
              </Text>
            </View>
          </View>

          <View style={styles.saveContainer}>
            <Button
              title="Save Changes"
              variant="primary"
              onPress={handleSave}
              loading={updateProfile.isPending}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: 60,
  },
  backText: {
    ...typography.body,
  },
  title: {
    ...typography.h3,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  field: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body,
  },
  bioInput: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    flex: 1,
  },
  counter: {
    ...typography.caption,
  },
  saveContainer: {
    marginTop: spacing.md,
  },
});
