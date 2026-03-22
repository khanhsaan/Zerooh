/**
 * App.tsx — Zeroooh! Root Component
 *
 * Bootstraps the app with:
 *   - SafeAreaProvider (safe area insets for iOS notch / Android cutout)
 *   - AuthContextProvider (global Supabase session + client)
 *   - AppNavigator (routes between Auth, Customer, and Business flows)
 */
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContextProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

const App: React.FC = () => (
  <SafeAreaProvider>
    <AuthContextProvider>
      <AppNavigator />
    </AuthContextProvider>
  </SafeAreaProvider>
);

export default App;
