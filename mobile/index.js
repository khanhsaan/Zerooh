/**
 * App entry point.
 *
 * Polyfills must be imported here — before expo-router/entry — so they are
 * available by the time Supabase's module-level code runs.
 * Importing them in _layout.tsx is too late because Supabase initialises at
 * import time, before any React component mounts.
 */
import 'react-native-url-polyfill/auto';

// Hand control to Expo Router's entry (file-based routing).
import 'expo-router/entry';
