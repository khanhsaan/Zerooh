import { Stack } from 'expo-router';

/**
 * AuthLayout
 *
 * Stack navigator for the authentication flow (splash, login, business-login, sign-up).
 * Header is hidden so each screen controls its own UI completely.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
