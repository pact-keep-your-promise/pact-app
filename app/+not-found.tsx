import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors, typography, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.subtitle}>This screen doesn't exist.</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  link: {
    paddingVertical: spacing.md,
  },
  linkText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
