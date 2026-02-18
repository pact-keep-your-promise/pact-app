import React, { useRef } from 'react';
import { Pressable, StyleSheet, View, Animated } from 'react-native';

interface ShutterButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function ShutterButton({ onPress, disabled = false }: ShutterButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.outer}
      >
        <View style={styles.inner} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
});
