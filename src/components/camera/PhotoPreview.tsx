import React, { useEffect, useRef } from 'react';
import { StyleSheet, Image, Dimensions, View, Pressable, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhotoPreviewProps {
  photoUri: string;
  onRetake: () => void;
  onVerify: () => void;
}

export default function PhotoPreview({ photoUri, onRetake, onVerify }: PhotoPreviewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY: slideY }] }]}>
      <Image source={{ uri: photoUri }} style={styles.photo} />
      <View style={styles.buttons}>
        <Pressable style={styles.retakeBtn} onPress={onRetake}>
          <Ionicons name="refresh" size={20} color={colors.textPrimary} />
          <Text style={styles.btnText}>Retake</Text>
        </Pressable>
        <Pressable style={styles.verifyBtn} onPress={onVerify}>
          <Ionicons name="sparkles" size={20} color={colors.textPrimary} />
          <Text style={styles.btnText}>Verify with AI</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  photo: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: SCREEN_WIDTH - spacing.xl * 2,
    borderRadius: borderRadius.xxl,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    width: '100%',
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifyBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  btnText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
