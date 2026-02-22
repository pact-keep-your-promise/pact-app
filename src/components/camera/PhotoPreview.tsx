import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, Dimensions, View, Pressable, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_PHOTO_W = SCREEN_WIDTH - spacing.xl * 2;
const MAX_PHOTO_H = MAX_PHOTO_W * 1.3;

interface PhotoPreviewProps {
  photoUri: string;
  onRetake: () => void;
  onVerify: () => void;
  onCrop?: () => void;
}

export default function PhotoPreview({ photoUri, onRetake, onVerify, onCrop }: PhotoPreviewProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;
  const [imageAspect, setImageAspect] = useState(1);

  useEffect(() => {
    Image.getSize(photoUri, (w, h) => setImageAspect(w / h), () => {});
  }, [photoUri]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  // Fit image within max bounds preserving aspect ratio
  let photoWidth: number, photoHeight: number;
  if (imageAspect >= MAX_PHOTO_W / MAX_PHOTO_H) {
    photoWidth = MAX_PHOTO_W;
    photoHeight = MAX_PHOTO_W / imageAspect;
  } else {
    photoHeight = MAX_PHOTO_H;
    photoWidth = MAX_PHOTO_H * imageAspect;
  }

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY: slideY }] }]}>
      <View style={styles.imageArea}>
        <Image
          source={{ uri: photoUri }}
          style={[styles.photo, { width: photoWidth, height: photoHeight }]}
          resizeMode="cover"
        />
      </View>
      <View style={styles.buttons}>
        <Pressable style={[styles.secondaryBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]} onPress={onRetake}>
          <Ionicons name="refresh" size={20} color={colors.textPrimary} />
          <Text style={[styles.btnText, { color: colors.textPrimary }]}>Retake</Text>
        </Pressable>
        {onCrop && (
          <Pressable style={[styles.secondaryBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]} onPress={onCrop}>
            <Ionicons name="crop" size={20} color={colors.textPrimary} />
            <Text style={[styles.btnText, { color: colors.textPrimary }]}>Crop</Text>
          </Pressable>
        )}
        <Pressable style={[styles.verifyBtn, { backgroundColor: colors.primary }]} onPress={onVerify}>
          <Ionicons name="sparkles" size={20} color={colors.onPrimary} />
          <Text style={[styles.btnText, { color: colors.onPrimary }]}>Verify with AI</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingBottom: layout.tabBarClearance,
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  verifyBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  btnText: {
    ...typography.bodyBold,
  },
});
