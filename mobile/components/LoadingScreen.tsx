import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/Colors';

interface Props {
  message?: string;
}

/**
 * LoadingScreen
 *
 * Full-screen loading indicator shown while async operations are in progress.
 * Displays the Zeroooh brand spinner and an optional status message.
 *
 * @param message - Optional text shown below the spinner. Defaults to "Loading…"
 */
const LoadingScreen: React.FC<Props> = ({ message = 'Loading…' }) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.logo}>🌿</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    minWidth: 160,
  },
  logo: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  spinner: {
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
});

export default LoadingScreen;
