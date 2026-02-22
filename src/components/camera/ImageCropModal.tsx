import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
  PanResponder,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { spacing, borderRadius, typography, layout } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ImageCropModalProps {
  photoUri: string;
  onConfirm: (croppedUri: string) => void;
  onCancel: () => void;
}

type AspectPreset = 'free' | '1:1' | '4:3' | '3:2' | '16:9';

const PRESETS: { key: AspectPreset; label: string; ratio: number | null }[] = [
  { key: 'free', label: 'Free', ratio: null },
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: '4:3', label: '4:3', ratio: 4 / 3 },
  { key: '3:2', label: '3:2', ratio: 3 / 2 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
];

const HANDLE_SIZE = 18;
const HANDLE_HIT = 28;
const MIN_FRAME = 40;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ImageCropModal({ photoUri, onConfirm, onCancel }: ImageCropModalProps) {
  const { colors } = useTheme();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [selectedPreset, setSelectedPreset] = useState<AspectPreset>('free');
  const [frame, setFrame] = useState<Rect | null>(null);

  const imgAspect = imageSize.width / imageSize.height;
  const preset = PRESETS.find((p) => p.key === selectedPreset)!;

  // Compute displayed image bounds within the crop area container
  const cW = containerSize.width;
  const cH = containerSize.height;
  const cAspect = cW / (cH || 1);
  let imgW: number, imgH: number;
  if (imgAspect > cAspect) {
    imgW = cW;
    imgH = cW / imgAspect;
  } else {
    imgH = cH;
    imgW = cH * imgAspect;
  }
  const imgX = (cW - imgW) / 2;
  const imgY = (cH - imgH) / 2;

  // Keep refs in sync for PanResponder closures
  const frameRef = useRef<Rect | null>(null);
  frameRef.current = frame;
  const imgBoundsRef = useRef({ x: imgX, y: imgY, w: imgW, h: imgH });
  imgBoundsRef.current = { x: imgX, y: imgY, w: imgW, h: imgH };
  const presetRef = useRef(preset);
  presetRef.current = preset;

  const computeInitialFrame = (ratio: number | null, iX: number, iY: number, iW: number, iH: number): Rect => {
    let fw: number, fh: number;
    if (ratio) {
      if (ratio > iW / iH) {
        fw = iW;
        fh = fw / ratio;
      } else {
        fh = iH;
        fw = fh * ratio;
      }
    } else {
      fw = iW;
      fh = iH;
    }
    return {
      x: iX + (iW - fw) / 2,
      y: iY + (iH - fh) / 2,
      w: fw,
      h: fh,
    };
  };

  // Init frame when image loads or container resizes
  useEffect(() => {
    if (cW > 0 && imageSize.width > 1) {
      setFrame(computeInitialFrame(preset.ratio, imgX, imgY, imgW, imgH));
    }
  }, [cW, cH, imageSize.width, imageSize.height]);

  const handlePresetChange = (key: AspectPreset) => {
    setSelectedPreset(key);
    const p = PRESETS.find((pp) => pp.key === key)!;
    const b = imgBoundsRef.current;
    setFrame(computeInitialFrame(p.ratio, b.x, b.y, b.w, b.h));
  };

  // Hit detection: which part of the frame was touched?
  const getHitZone = (px: number, py: number): 'tl' | 'tr' | 'bl' | 'br' | 'move' | null => {
    const f = frameRef.current;
    if (!f) return null;
    const { x, y, w, h } = f;
    const s = HANDLE_HIT;
    if (Math.abs(px - x) < s && Math.abs(py - y) < s) return 'tl';
    if (Math.abs(px - (x + w)) < s && Math.abs(py - y) < s) return 'tr';
    if (Math.abs(px - x) < s && Math.abs(py - (y + h)) < s) return 'bl';
    if (Math.abs(px - (x + w)) < s && Math.abs(py - (y + h)) < s) return 'br';
    if (px >= x && px <= x + w && py >= y && py <= y + h) return 'move';
    return null;
  };

  const clampFrame = (f: Rect): Rect => {
    const b = imgBoundsRef.current;
    const result = { ...f };
    result.w = Math.max(MIN_FRAME, Math.min(result.w, b.w));
    result.h = Math.max(MIN_FRAME, Math.min(result.h, b.h));
    result.x = Math.max(b.x, Math.min(result.x, b.x + b.w - result.w));
    result.y = Math.max(b.y, Math.min(result.y, b.y + b.h - result.h));
    return result;
  };

  const dragState = useRef<{
    type: string | null;
    startFrame: Rect;
  }>({ type: null, startFrame: { x: 0, y: 0, w: 0, h: 0 } });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const zone = getHitZone(locationX, locationY);
        const f = frameRef.current;
        dragState.current = {
          type: zone,
          startFrame: f ? { ...f } : { x: 0, y: 0, w: 0, h: 0 },
        };
      },
      onPanResponderMove: (_, gs) => {
        const { type, startFrame } = dragState.current;
        if (!type) return;
        const { dx, dy } = gs;

        if (type === 'move') {
          setFrame(clampFrame({
            x: startFrame.x + dx,
            y: startFrame.y + dy,
            w: startFrame.w,
            h: startFrame.h,
          }));
          return;
        }

        // Resize from corner
        let nf = { ...startFrame };
        switch (type) {
          case 'br':
            nf.w = startFrame.w + dx;
            nf.h = startFrame.h + dy;
            break;
          case 'bl':
            nf.x = startFrame.x + dx;
            nf.w = startFrame.w - dx;
            nf.h = startFrame.h + dy;
            break;
          case 'tr':
            nf.w = startFrame.w + dx;
            nf.y = startFrame.y + dy;
            nf.h = startFrame.h - dy;
            break;
          case 'tl':
            nf.x = startFrame.x + dx;
            nf.y = startFrame.y + dy;
            nf.w = startFrame.w - dx;
            nf.h = startFrame.h - dy;
            break;
        }

        // Enforce minimum size
        if (nf.w < MIN_FRAME) {
          if (type === 'tl' || type === 'bl') nf.x = startFrame.x + startFrame.w - MIN_FRAME;
          nf.w = MIN_FRAME;
        }
        if (nf.h < MIN_FRAME) {
          if (type === 'tl' || type === 'tr') nf.y = startFrame.y + startFrame.h - MIN_FRAME;
          nf.h = MIN_FRAME;
        }

        // Maintain aspect ratio if a fixed preset is active
        const r = presetRef.current.ratio;
        if (r) {
          const curAspect = nf.w / nf.h;
          if (curAspect > r) {
            nf.w = nf.h * r;
          } else {
            nf.h = nf.w / r;
          }
          // Re-anchor position for corners that pin to the opposite side
          if (type === 'tl') {
            nf.x = startFrame.x + startFrame.w - nf.w;
            nf.y = startFrame.y + startFrame.h - nf.h;
          } else if (type === 'bl') {
            nf.x = startFrame.x + startFrame.w - nf.w;
          } else if (type === 'tr') {
            nf.y = startFrame.y + startFrame.h - nf.h;
          }
        }

        setFrame(clampFrame(nf));
      },
      onPanResponderRelease: () => {
        dragState.current.type = null;
      },
    }),
  ).current;

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const handleConfirm = async () => {
    if (!frame) return;
    try {
      const scaleX = imageSize.width / imgW;
      const scaleY = imageSize.height / imgH;
      const originX = Math.max(0, Math.round((frame.x - imgX) * scaleX));
      const originY = Math.max(0, Math.round((frame.y - imgY) * scaleY));
      const cropW = Math.round(Math.min(frame.w * scaleX, imageSize.width - originX));
      const cropH = Math.round(Math.min(frame.h * scaleY, imageSize.height - originY));

      const result = await ImageManipulator.manipulateAsync(
        photoUri,
        [{ crop: { originX, originY, width: cropW, height: cropH } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );

      onConfirm(result.uri);
    } catch (e) {
      console.error('Crop failed:', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: layout.tabBarClearance }]}>
      <View style={styles.cropArea} onLayout={handleContainerLayout}>
        {/* Fixed image */}
        <Image
          source={{ uri: photoUri }}
          style={{
            position: 'absolute',
            left: imgX,
            top: imgY,
            width: imgW,
            height: imgH,
          }}
          resizeMode="contain"
          onLoad={() => {
            Image.getSize(photoUri, (w, h) => setImageSize({ width: w, height: h }), () => {});
          }}
        />

        {/* Touch handler (transparent, receives all touches) */}
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

        {/* Overlay + frame border + handles (visual only, no touch) */}
        {frame && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
            {/* Dark overlay: 4 rects around the frame */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(0, frame.y), backgroundColor: 'rgba(0,0,0,0.55)' }} />
            <View style={{ position: 'absolute', top: frame.y, left: 0, width: Math.max(0, frame.x), height: frame.h, backgroundColor: 'rgba(0,0,0,0.55)' }} />
            <View style={{ position: 'absolute', top: frame.y, left: frame.x + frame.w, right: 0, height: frame.h, backgroundColor: 'rgba(0,0,0,0.55)' }} />
            <View style={{ position: 'absolute', top: frame.y + frame.h, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} />

            {/* Frame border */}
            <View
              style={{
                position: 'absolute',
                left: frame.x,
                top: frame.y,
                width: frame.w,
                height: frame.h,
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.7)',
                borderRadius: borderRadius.sm,
              }}
            />

            {/* Rule of thirds grid lines */}
            <View style={{ position: 'absolute', left: frame.x + frame.w / 3, top: frame.y, width: 1, height: frame.h, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <View style={{ position: 'absolute', left: frame.x + (frame.w * 2) / 3, top: frame.y, width: 1, height: frame.h, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <View style={{ position: 'absolute', left: frame.x, top: frame.y + frame.h / 3, width: frame.w, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <View style={{ position: 'absolute', left: frame.x, top: frame.y + (frame.h * 2) / 3, width: frame.w, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />

            {/* Corner handles */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
              const cx = corner.includes('l') ? frame.x : frame.x + frame.w;
              const cy = corner.includes('t') ? frame.y : frame.y + frame.h;
              return (
                <View
                  key={corner}
                  style={{
                    position: 'absolute',
                    left: cx - HANDLE_SIZE / 2,
                    top: cy - HANDLE_SIZE / 2,
                    width: HANDLE_SIZE,
                    height: HANDLE_SIZE,
                    borderRadius: HANDLE_SIZE / 2,
                    backgroundColor: '#fff',
                    borderWidth: 2,
                    borderColor: 'rgba(0,0,0,0.2)',
                  }}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Aspect ratio presets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.presetRow}
      >
        {PRESETS.map((p) => {
          const active = p.key === selectedPreset;
          return (
            <Pressable
              key={p.key}
              onPress={() => handlePresetChange(p.key)}
              style={[
                styles.presetChip,
                { backgroundColor: active ? colors.primary : colors.backgroundTertiary },
              ]}
            >
              <Text
                style={[
                  styles.presetLabel,
                  { color: active ? colors.onPrimary : colors.textSecondary },
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={[styles.secondaryBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Ionicons name="close" size={20} color={colors.textPrimary} />
          <Text style={[styles.btnText, { color: colors.textPrimary }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
        >
          <Ionicons name="checkmark" size={20} color={colors.onPrimary} />
          <Text style={[styles.btnText, { color: colors.onPrimary }]}>Apply Crop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  cropArea: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  presetLabel: {
    ...typography.captionBold,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
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
  confirmBtn: {
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
