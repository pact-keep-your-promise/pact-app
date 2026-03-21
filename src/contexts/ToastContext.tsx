import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/constants/theme';

type ToastType = 'error' | 'success' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

const TOAST_COLORS: Record<ToastType, string> = {
  error: '#FF6B6B',
  success: '#4ECDC4',
  info: '#7C5CFC',
};

const TOAST_ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  error: 'alert-circle',
  success: 'checkmark-circle',
  info: 'information-circle',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });
  const translateY = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ message, type, visible: true });
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();

    timerRef.current = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setToast(prev => ({ ...prev, visible: false })));
    }, 4000);
  }, [translateY]);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setToast(prev => ({ ...prev, visible: false })));
  }, [translateY]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: TOAST_COLORS[toast.type],
              top: Math.max(insets.top, spacing.lg),
              transform: [{ translateY }],
            },
          ]}
        >
          <Pressable style={styles.toastContent} onPress={dismiss}>
            <Ionicons name={TOAST_ICONS[toast.type]} size={20} color="#fff" />
            <Text style={styles.toastText} numberOfLines={2}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.md,
    zIndex: 9999,
    elevation: 10,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toastText: {
    ...typography.bodyBold,
    color: '#fff',
    flex: 1,
  },
});
