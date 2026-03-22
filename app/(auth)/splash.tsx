import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const FOOD_PREVIEW = [
  { emoji: '🥐', name: 'Pastry Pack', discount: '67% off' },
  { emoji: '🍱', name: 'Rice Bowl', discount: '70% off' },
  { emoji: '☕', name: 'Matcha Latte', discount: '62% off' },
];

/**
 * SplashScreen
 *
 * Welcome / landing screen shown to unauthenticated users. Displays the
 * Zeroooh! brand, hero copy, a row of food preview cards, and two role CTAs:
 * - Customer → /(auth)/login
 * - Business Partner → /(auth)/business-login
 */
export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cream} />

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.logoText}>Zeroooh!</Text>
        </View>

        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>
            Rescue Food.{'\n'}
            <Text style={styles.heroAccent}>Save Big.</Text>
          </Text>
          <Text style={styles.tagline}>
            Great food at half the price — and zero waste.
          </Text>
        </View>

        <View style={styles.locationBadge}>
          <Text style={styles.locationDot}>📍</Text>
          <Text style={styles.locationText}>Now live in Wollongong & Sydney</Text>
        </View>
      </View>

      <View style={styles.illustrationArea}>
        <View style={styles.foodCardRow}>
          {FOOD_PREVIEW.map((item, i) => (
            <View key={i} style={[styles.foodCard, i === 1 && styles.foodCardCenter]}>
              <Text style={styles.foodCardEmoji}>{item.emoji}</Text>
              <Text style={styles.foodCardName}>{item.name}</Text>
              <View style={styles.foodCardBadge}>
                <Text style={styles.foodCardBadgeText}>{item.discount}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Get the App — Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/business-login')}
          activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Business Partner</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Join thousands saving food in your city.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  topSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  heroContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.charcoal,
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroAccent: { color: Colors.primary },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  locationDot: { fontSize: 13 },
  locationText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.charcoal },
  illustrationArea: { paddingHorizontal: Spacing.lg, marginVertical: Spacing.lg },
  foodCardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  foodCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    width: (width - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  foodCardCenter: {
    transform: [{ translateY: -8 }],
    borderWidth: 2,
    borderColor: Colors.lime,
  },
  foodCardEmoji: { fontSize: 30, marginBottom: Spacing.xs },
  foodCardName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  foodCardBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  foodCardBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.charcoal },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
});
