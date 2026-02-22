import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useDataHelpers } from '@/api/helpers';
import VerificationResult from '@/components/camera/VerificationResult';

export default function VerifyResultScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { matched, pactId } = useLocalSearchParams<{
    matched: string;
    pactId?: string;
  }>();

  const { getPactById } = useDataHelpers();
  const isMatched = matched === 'true';
  const pact = pactId ? getPactById(pactId) : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <VerificationResult
        matched={isMatched}
        pact={pact}
        onSend={() => router.navigate('/(tabs)')}
        onRetry={() => router.navigate('/(tabs)/camera')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
