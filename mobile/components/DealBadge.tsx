import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize } from '../constants/Colors';

type BadgeVariant = 'discount' | 'popular' | 'lastChance' | 'ecoPick';

interface Props {
  variant: BadgeVariant;
  /** Override label — defaults to variant label */
  label?: string;
  style?: ViewStyle;
}

const BADGE_CONFIG: Record<BadgeVariant, { bg: string; text: string; defaultLabel: string }> = {
  discount: { bg: Colors.lime, text: Colors.charcoal, defaultLabel: 'Deal' },
  popular: { bg: Colors.orange, text: Colors.white, defaultLabel: '🔥 Popular' },
  lastChance: { bg: Colors.error, text: Colors.white, defaultLabel: '⏱ Last chance' },
  ecoPick: { bg: Colors.primary, text: Colors.white, defaultLabel: '🌿 Eco pick' },
};

/**
 * DealBadge
 *
 * A small pill-shaped label used on product cards and detail screens.
 * Supports four semantic variants: `discount`, `popular`, `lastChance`, `ecoPick`.
 * Each variant has a distinct background/text colour per the Zeroooh brand system.
 *
 * @param variant - Controls colour scheme and default label text.
 * @param label   - Optional override for the badge text (e.g. "67% off").
 * @param style   - Optional extra styles applied to the outer container.
 */
const DealBadge: React.FC<Props> = ({ variant, label, style }) => {
  const config = BADGE_CONFIG[variant];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>{label ?? config.defaultLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default DealBadge;
