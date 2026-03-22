import 'react-native-url-polyfill/auto';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthContextProvider } from '../context/AuthContext';
import useAuthContext from '../hooks/useAuthContext';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ErrorType } from '../types';
import { displayError, logErrorAndSetState } from '../utilities/handleError';
import { Colors } from '../constants/Colors';

/**
 * AppContent
 *
 * Inner component that consumes AuthContext and renders the root Stack navigator.
 * Shows a loading indicator while auth state is resolving, then surfaces any
 * fatal auth errors via `displayError` before rendering the navigation shell.
 *
 * Watches `authSession` to drive navigation:
 * - Session lost (sign-out) from any screen → redirect to splash.
 * - Session gained (sign-in) while on an auth screen → redirect to index,
 *   which then routes to the correct customer/business tabs.
 */
function AppContent() {
  const [errorState, setErrorState] = useState<ErrorType | null>(null);
  const authContextResponse = useAuthContext();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    logErrorAndSetState('useAuthContext', authContextResponse.error, setErrorState);
  }, [authContextResponse.error]);

  const authLoading = authContextResponse.data?.authLoading ?? true;
  const authSession = authContextResponse.data?.authSession ?? null;

  useEffect(() => {
    if (authLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!authSession && !inAuthGroup) {
      router.replace('/(auth)/splash');
    } else if (authSession && inAuthGroup) {
      router.replace('/');
    }
  }, [authSession, authLoading]);

  if (errorState) {
    displayError('Something is wrong, please restart the application', true);
  }

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream }}>
        <Text style={{ fontSize: 32 }}>🌿</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}

/**
 * RootLayout
 *
 * Root entry point for Expo Router. Wraps the entire app in AuthContextProvider
 * so every screen has access to the Supabase session.
 */
export default function RootLayout() {
  return (
    <AuthContextProvider>
      <AppContent />
    </AuthContextProvider>
  );
}
