import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { getPactById } from '@/data/mock';
import VerificationResult from '@/components/camera/VerificationResult';

export default function VerifyResultScreen() {
  const router = useRouter();
  const { matched, pactId } = useLocalSearchParams<{
    matched: string;
    pactId?: string;
  }>();

  const isMatched = matched === 'true';
  const pact = pactId ? getPactById(pactId) : undefined;

  return (
    <View style={styles.container}>
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
    backgroundColor: colors.background,
  },
});
