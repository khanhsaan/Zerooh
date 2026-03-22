import { Stack } from 'expo-router';

/**
 * BusinessTabsLayout
 *
 * Stack navigator for authenticated business users. Includes the main
 * dashboard and the business profile setup screen. Header is hidden
 * so each screen controls its own UI.
 */
export default function BusinessTabsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
