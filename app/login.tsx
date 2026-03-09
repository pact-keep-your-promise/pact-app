import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import LegalScreen from './legal';

WebBrowser.maybeCompleteAuthSession();

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { login, register, googleLogin } = useAuth();
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy' | null>(null);

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  const [showDevLogin, setShowDevLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!googleResponse) return;

    if (googleResponse.type === 'success') {
      const accessToken = googleResponse.authentication?.accessToken || googleResponse.params.access_token;
      if (accessToken) {
        handleGoogleLogin(accessToken);
      } else {
        const msg = 'Google sign-in did not return a token. Please try again.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Error', msg);
        }
      }
    } else if (googleResponse.type === 'error') {
      const msg = googleResponse.error?.message || 'Google sign-in failed';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  }, [googleResponse]);

  const handleGoogleLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      await googleLogin(accessToken);
    } catch (e: any) {
      if (Platform.OS === 'web') {
        window.alert(e.message || 'Google sign-in failed');
      } else {
        Alert.alert('Error', e.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim() || !username.trim()) {
          Alert.alert('Missing fields', 'Please fill in all fields');
          setLoading(false);
          return;
        }
        await register(name.trim(), username.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Logo color={colors.textPrimary} size={48} />
          <Text style={[styles.tagline, { color: colors.textTertiary }]}>
            {showDevLogin && isRegister ? 'Create your account' : 'Build habits with friends'}
          </Text>
        </View>

        {/* Dev-only email/password form */}
        {__DEV__ && showDevLogin ? (
          <View style={styles.form}>
            {isRegister && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Username"
                  placeholderTextColor={colors.textTertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </>
            )}

            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.buttonContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Button
                  title={isRegister ? 'Create Account' : 'Sign In'}
                  onPress={handleSubmit}
                  variant="primary"
                  fullWidth
                  icon={isRegister ? 'person-add' : 'log-in'}
                />
              )}
            </View>

            <Pressable onPress={() => setIsRegister(!isRegister)} style={styles.toggleButton}>
              <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={{ color: colors.primary }}>
                  {isRegister ? 'Sign In' : 'Create one'}
                </Text>
              </Text>
            </Pressable>

            <Text style={[styles.hint, { color: colors.textTertiary }]}>
              Demo: nazrin@pact.app / password123
            </Text>

            <Pressable onPress={() => setShowDevLogin(false)} style={styles.toggleButton}>
              <Text style={[styles.toggleText, { color: colors.textTertiary }]}>
                Back to Google sign-in
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            {/* Google sign-in — primary auth method */}
            <Pressable
              onPress={() => promptGoogleAsync()}
              disabled={!googleRequest || loading}
              style={({ pressed }) => [
                styles.googleButton,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                pressed && { opacity: 0.8 },
                (!googleRequest || loading) && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <>
                  <GoogleIcon />
                  <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>

            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.primary }} onPress={() => setLegalTab('terms')}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={{ color: colors.primary }} onPress={() => setLegalTab('privacy')}>
                Privacy Policy
              </Text>
            </Text>

            {/* Dev-only: switch to email/password login */}
            {__DEV__ && (
              <Pressable onPress={() => setShowDevLogin(true)} style={styles.toggleButton}>
                <Text style={[styles.hint, { color: colors.textTertiary }]}>
                  Dev: Sign in with email/password
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Legal modal */}
      <Modal visible={legalTab !== null} animationType="slide" presentationStyle="pageSheet">
        {legalTab && (
          <LegalScreen initialTab={legalTab} onClose={() => setLegalTab(null)} />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  tagline: {
    ...typography.body,
    marginTop: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  toggleText: {
    ...typography.body,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  termsText: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  googleButtonText: {
    marginLeft: spacing.md,
    ...typography.bodyBold,
  },
  disabled: {
    opacity: 0.5,
  },
});
