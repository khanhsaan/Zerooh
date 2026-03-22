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
 * Welcome / landing screen shown to unauthenticated users. Dark theme (#1a1a1a).
 * Displays massive stacked hero typography: RESCUE / FOOD. / SAVE BIG.
 * A row of food preview cards, lime CTA for customers, white-outlined CTA for business.
 */
export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

      <View style={styles.topSection}>
        {/* Brand badge */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.logoText}>Zeroooh!</Text>
        </View>

        {/* Hero typography */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroLine}>RESCUE</Text>
          <Text style={[styles.heroLine, styles.heroLime]}>FOOD.</Text>
          <Text style={styles.heroTagline}>
            Great deals at half the price —{'\n'}and zero waste.
          </Text>
        </View>

        <View style={styles.locationBadge}>
          <Text style={styles.locationDot}>📍</Text>
          <Text style={styles.locationText}>Now live in Wollongong & Sydney</Text>
        </View>
      </View>

      {/* Food preview cards */}
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

      {/* CTA buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>GET THE APP — CUSTOMER</Text>
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
  container: { flex: 1, backgroundColor: Colors.dark },
  topSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 20 },
  logoText: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  heroContainer: { marginBottom: Spacing.lg },
  heroLine: {
    fontSize: 58,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -2,
    lineHeight: 62,
  },
  heroLime: { color: Colors.lime },
  heroTagline: {
    fontSize: FontSize.md,
    color: Colors.muted,
    lineHeight: 22,
    marginTop: Spacing.md,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationDot: { fontSize: 13 },
  locationText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.white },
  illustrationArea: { paddingHorizontal: Spacing.lg, marginVertical: Spacing.lg },
  foodCardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  foodCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    width: (width - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  foodCardCenter: {
    transform: [{ translateY: -8 }],
    borderColor: Colors.lime,
    borderWidth: 2,
  },
  foodCardEmoji: { fontSize: 28, marginBottom: Spacing.xs },
  foodCardName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.white,
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
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
});
