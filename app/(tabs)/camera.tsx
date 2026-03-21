import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, typography, layout, withAlpha } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { usePacts } from '@/api/queries';
import { useSubmitPhoto } from '@/api/mutations';
import { adaptColor } from '@/utils/colorUtils';
import IconBadge from '@/components/ui/IconBadge';
import ShutterButton from '@/components/camera/ShutterButton';
import PhotoPreview from '@/components/camera/PhotoPreview';
import ImageCropModal from '@/components/camera/ImageCropModal';
import AIAnalyzing from '@/components/camera/AIAnalyzing';
import VerificationResult from '@/components/camera/VerificationResult';

// Only import CameraView on native
let CameraView: any = null;
let useCameraPermissions: any = null;
if (Platform.OS !== 'web') {
  const cam = require('expo-camera');
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
}

type CameraState = 'ready' | 'preview' | 'cropping' | 'analyzing' | 'result';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { data: pacts = [] } = usePacts();
  const submitPhoto = useSubmitPhoto();
  const [state, setState] = useState<CameraState>('ready');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [matched, setMatched] = useState(false);
  const [detectedPactId, setDetectedPactId] = useState<string | undefined>();
  const [showPactPicker, setShowPactPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<any>(null);

  // Camera permissions (only on native)
  const [permission, requestPermission] = Platform.OS !== 'web' && useCameraPermissions
    ? useCameraPermissions()
    : [{ granted: false, canAskAgain: true }, async () => {}];

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS !== 'web' && cameraRef.current && permission?.granted) {
      // Take photo with actual camera
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setState('preview');
        return;
      }
    }

    // Fallback: image picker (also used on web)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setState('preview');
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setState('preview');
    }
  };

  const handleCrop = () => {
    if (!photoUri) return;
    setState('cropping');
  };

  const handleVerify = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('analyzing');
  };

  const handleAnalysisComplete = (isMatch: boolean, pactId?: string) => {
    setMatched(isMatch);
    setDetectedPactId(pactId);
    setState('result');
    if (isMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleSend = async () => {
    if (detectedPactId && photoUri) {
      setSending(true);
      try {
        await submitPhoto.mutateAsync({ pactId: detectedPactId, photoUri });
      } catch (e) {
        console.error('Failed to submit:', e);
        setSending(false);
        return;
      }
    }
    setSending(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetCamera();
  };

  const resetCamera = () => {
    setState('ready');
    setPhotoUri(null);
    setMatched(false);
    setDetectedPactId(undefined);
    setShowPactPicker(false);
  };

  const matchedPact = detectedPactId ? pacts.find((p) => p.id === detectedPactId) : undefined;

  if (state === 'ready') {
    // Native with camera permission granted — show live viewfinder
    const showLiveCamera = Platform.OS !== 'web' && CameraView && permission?.granted;

    // Native, permission not yet determined
    const showPermissionRequest = Platform.OS !== 'web' && CameraView && !permission?.granted;

    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: '#000' }]}>
        {showLiveCamera ? (
          <View style={styles.cameraPlaceholder}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
            />
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
          </View>
        ) : showPermissionRequest ? (
          <View style={styles.cameraPlaceholder}>
            <View style={[styles.cameraBg, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Ionicons name="camera" size={64} color={colors.textTertiary} />
              <Text style={[styles.cameraHint, { color: colors.textSecondary }]}>Camera access needed</Text>
              <Text style={[styles.cameraSubHint, { color: colors.textTertiary }]}>
                Allow camera access to take verification photos
              </Text>
              <Pressable
                style={[styles.grantBtn, { backgroundColor: colors.primary }]}
                onPress={requestPermission}
              >
                <Text style={styles.grantBtnText}>Grant Access</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // Web fallback — placeholder UI
          <View style={styles.cameraPlaceholder}>
            <View style={[styles.cameraBg, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Ionicons name="camera" size={64} color={colors.textTertiary} />
              <Text style={[styles.cameraHint, { color: colors.textSecondary }]}>Take a photo to verify your pact</Text>
              <Text style={[styles.cameraSubHint, { color: colors.textTertiary }]}>
                Our AI will detect which pact it matches
              </Text>
            </View>
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
          </View>
        )}

        <View style={styles.controls}>
          {showLiveCamera ? (
            <View style={styles.controlSpacer}>
              <Pressable
                onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
                style={[styles.iconButton, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }]}
              >
                <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.controlSpacer} />
          )}
          <ShutterButton onPress={handleCapture} />
          <View style={styles.controlSpacer}>
            <Pressable onPress={handlePickFromGallery} style={[styles.iconButton, { backgroundColor: showLiveCamera ? 'rgba(255,255,255,0.15)' : colors.backgroundSecondary, borderColor: showLiveCamera ? 'rgba(255,255,255,0.3)' : colors.border }]}>
              <Ionicons name="images-outline" size={24} color={showLiveCamera ? '#fff' : colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (state === 'preview' && photoUri) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <PhotoPreview photoUri={photoUri} onRetake={resetCamera} onVerify={handleVerify} onCrop={handleCrop} />
      </View>
    );
  }

  if (state === 'cropping' && photoUri) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ImageCropModal
          photoUri={photoUri}
          onConfirm={(croppedUri) => {
            setPhotoUri(croppedUri);
            setState('preview');
          }}
          onCancel={() => setState('preview')}
        />
      </View>
    );
  }

  if (state === 'analyzing' && photoUri) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AIAnalyzing photoUri={photoUri} onComplete={handleAnalysisComplete} availablePacts={pacts} />
      </View>
    );
  }

  if (state === 'result') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <VerificationResult
          matched={matched}
          pact={matchedPact}
          onSend={handleSend}
          onRetry={resetCamera}
          onChangePact={() => setShowPactPicker(true)}
          loading={sending}
        />

        {/* Pact Picker Modal */}
        <Modal visible={showPactPicker} transparent animationType="slide" onRequestClose={() => setShowPactPicker(false)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setShowPactPicker(false)}>
            <Pressable style={[styles.pickerSheet, { backgroundColor: colors.backgroundSecondary }]} onPress={() => {}}>
              <View style={[styles.pickerHandle, { backgroundColor: colors.textTertiary }]} />
              <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>Select Pact</Text>
              <FlatList
                data={pacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item: pact }) => {
                  const pactColor = adaptColor(pact.color, isDark);
                  const isSelected = pact.id === detectedPactId;
                  return (
                    <Pressable
                      style={[
                        styles.pickerRow,
                        { borderBottomColor: colors.border },
                        isSelected && { backgroundColor: withAlpha(pactColor, 0.08) },
                      ]}
                      onPress={() => {
                        setDetectedPactId(pact.id);
                        setShowPactPicker(false);
                      }}
                    >
                      <IconBadge icon={pact.icon} color={pactColor} size={40} />
                      <Text style={[styles.pickerPactTitle, { color: colors.textPrimary }]}>{pact.title}</Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                      )}
                    </Pressable>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
  },
  cameraHint: {
    ...typography.h3,
    marginTop: spacing.xl,
  },
  cameraSubHint: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  grantBtn: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  grantBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
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
    paddingBottom: layout.tabBarClearance,
    paddingHorizontal: spacing.xxxl,
  },
  controlSpacer: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: layout.iconButtonMd,
    height: layout.iconButtonMd,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    opacity: 0.4,
  },
  pickerTitle: {
    ...typography.h3,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  pickerPactTitle: {
    ...typography.bodyBold,
    flex: 1,
  },
});
