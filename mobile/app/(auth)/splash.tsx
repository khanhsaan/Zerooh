import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

/**
 * SplashScreen (Welcome)
 *
 * Landing screen for unauthenticated users. Matches the Premium Food Waste App
 * Mock-up React Native design exactly:
 * - Lime bordered location badge at top
 * - Massive stacked RESCUE / FOOD. (lime) / SAVE (white) BIG. (orange) hero
 * - Subtitle text
 * - Lime primary CTA (customer), white-outlined secondary CTA (business)
 */
export default function SplashScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top badge */}
      <View style={styles.topSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>● NOW LIVE IN WOLLONGONG & SYDNEY</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.mainSection}>
        <View style={styles.heroSection}>
          <View style={styles.headlineContainer}>
            <Text style={[styles.headline, styles.headlineWhite]}>RESCUE</Text>
            <Text style={[styles.headline, styles.headlineLime]}>FOOD.</Text>
            <View style={styles.headlineRow}>
              <Text style={[styles.headline, styles.headlineWhite]}>SAVE </Text>
              <Text style={[styles.headline, styles.headlineOrange]}>BIG.</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Connect with restaurants selling surplus food at up to 70% off — minutes before it's thrown away.
          </Text>
        </View>

        {/* Brand mark */}
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>zeroooh!</Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.primaryButton}
          activeOpacity={0.7}>
          <Text style={styles.primaryButtonText}>Get the App - Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/business-login')}
          style={styles.secondaryButton}
          activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Business Partner</Text>
        </TouchableOpacity>

        <Text style={styles.tagline}>Great food. Half the price. Zero waste.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  topSection: {
    width: '100%',
    paddingTop: 32,
  },
  badge: {
    backgroundColor: Colors.lime10,
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: Colors.lime,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  mainSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  headlineContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headlineRow: {
    flexDirection: 'row',
  },
  headline: {
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 64,
    letterSpacing: -1,
  },
  headlineWhite: {
    color: Colors.white,
  },
  headlineLime: {
    color: Colors.lime,
  },
  headlineOrange: {
    color: Colors.orange,
  },
  subtitle: {
    color: Colors.w80,
    textAlign: 'center',
    maxWidth: 320,
    fontSize: 17,
    lineHeight: 25.5,
  },
  brandMark: {
    borderWidth: 2,
    borderColor: Colors.w20,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  brandMarkText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ctaSection: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.lime,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: 17,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 17,
    textTransform: 'uppercase',
  },
  tagline: {
    color: Colors.w40,
    textAlign: 'center',
    paddingTop: 8,
    fontSize: 14,
  },
});
