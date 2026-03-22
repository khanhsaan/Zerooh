/**
 * @format
 */

// Must be the very first import — patches the global URL implementation so
// Supabase's Realtime client can mutate url.protocol without throwing
// "Cannot assign to property which has only a getter" in React Native.
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
