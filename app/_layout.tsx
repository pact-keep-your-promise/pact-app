import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { isPushSupported, isSubscribedToPush, subscribeToPush } from '@/api/pushSubscription';
import { connectSocket, disconnectSocket } from '@/api/socket';
import LoginScreen from './login';
import OnboardingScreen from './onboarding';

const ONBOARDING_KEY = 'pact_onboarding_completed';

function RootStack() {
  const { colors, isDark } = useTheme();
  const { user, loading, token } = useAuth();
  const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setShowOnboarding(value !== 'true');
    });
  }, []);

  React.useEffect(() => {
    if (!token) {
      queryClient.clear();
      disconnectSocket();
    } else {
      connectSocket();
    }
  }, [token]);

  // Re-subscribe to push notifications on login (updates user_id association)
  React.useEffect(() => {
    if (!user || Platform.OS !== 'web' || !isPushSupported()) return;
    isSubscribedToPush().then((subscribed) => {
      if (subscribed) subscribeToPush();
    });
  }, [user]);

  if (loading || showOnboarding === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} />
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          AsyncStorage.setItem(ONBOARDING_KEY, 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="pact/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="legal"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="verify/result"
          options={{
            headerShown: false,
            animation: 'fade',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary onReset={() => queryClient.clear()}>
              <RootStack />
            </ErrorBoundary>
          </QueryClientProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
