import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from './login';

function RootStack() {
  const { colors, isDark } = useTheme();
  const { user, loading, token } = useAuth();

  React.useEffect(() => {
    if (!token) {
      queryClient.clear();
    }
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} />
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
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RootStack />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
