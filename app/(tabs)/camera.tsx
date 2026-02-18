import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { pacts } from '@/data/mock';
import ShutterButton from '@/components/camera/ShutterButton';
import AIAnalyzing from '@/components/camera/AIAnalyzing';
import VerificationResult from '@/components/camera/VerificationResult';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CameraState = 'ready' | 'preview' | 'analyzing' | 'result';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<CameraState>('ready');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [matched, setMatched] = useState(false);
  const [matchedPactId, setMatchedPactId] = useState<string | undefined>();

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setState('preview');
    }
  };

  const handleVerify = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('analyzing');
  };

  const handleAnalysisComplete = (isMatch: boolean, pactId?: string) => {
    setMatched(isMatch);
    setMatchedPactId(pactId);
    setState('result');
    if (isMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleSend = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetCamera();
  };

  const resetCamera = () => {
    setState('ready');
    setPhotoUri(null);
    setMatched(false);
    setMatchedPactId(undefined);
  };

  const matchedPact = matchedPactId ? pacts.find((p) => p.id === matchedPactId) : undefined;

  // Ready state - camera placeholder with shutter
  if (state === 'ready') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.cameraPlaceholder}>
          <View style={styles.cameraBg}>
            <Ionicons name="camera" size={64} color={colors.textTertiary} />
            <Text style={styles.cameraHint}>Take a photo to verify your pact</Text>
            <Text style={styles.cameraSubHint}>
              Snap a pic of your activity and we'll match it
            </Text>
          </View>

          {/* Viewfinder corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <View style={styles.controls}>
          <View style={styles.controlSpacer} />
          <ShutterButton onPress={handleCapture} />
          <View style={styles.controlSpacer}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="images-outline" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Preview state
  if (state === 'preview' && photoUri) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />

          <View style={styles.previewActions}>
            <Pressable style={styles.retakeButton} onPress={resetCamera}>
              <Ionicons name="refresh" size={20} color={colors.textPrimary} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>

            <Pressable style={styles.verifyButton} onPress={handleVerify}>
              <Ionicons name="sparkles" size={20} color={colors.textPrimary} />
              <Text style={styles.verifyText}>Verify with AI</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Analyzing state
  if (state === 'analyzing' && photoUri) {
    return (
      <View style={styles.container}>
        <AIAnalyzing photoUri={photoUri} onComplete={handleAnalysisComplete} />
      </View>
    );
  }

  // Result state
  if (state === 'result') {
    return (
      <View style={styles.container}>
        <VerificationResult
          matched={matched}
          pact={matchedPact}
          onSend={handleSend}
          onRetry={resetCamera}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraPlaceholder: {
    flex: 1,
    margin: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraBg: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraHint: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  cameraSubHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.huge + 60,
    paddingHorizontal: spacing.xxxl,
  },
  controlSpacer: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: SCREEN_WIDTH - spacing.xl * 2,
    borderRadius: borderRadius.xxl,
    alignSelf: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  retakeButton: {
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
  retakeText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  verifyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  verifyText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
