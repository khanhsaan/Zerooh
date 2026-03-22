import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/Colors';

interface Props {
  emoji: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * CategoryPill
 *
 * A horizontally scrollable pill button used in the HomeScreen category filter row.
 * Dark theme: inactive pills use darkCard background; active pill uses lime fill
 * with dark text. Renders an emoji icon alongside a label.
 *
 * @param emoji   - Emoji character shown to the left of the label.
 * @param label   - Category name (e.g. "Bakery", "Cafe").
 * @param active  - When true, fills background with lime and uses bold dark text.
 * @param onPress - Tap handler.
 * @param style   - Optional extra container styles.
 */
const CategoryPill: React.FC<Props> = ({ emoji, label, active = false, onPress, style }) => (
  <TouchableOpacity
    style={[styles.pill, active && styles.pillActive, style]}
    onPress={onPress}
    activeOpacity={0.75}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.darkCard,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  emoji: {
    fontSize: 15,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.muted,
  },
  labelActive: {
    fontWeight: '800',
    color: Colors.dark,
  },
});

export default CategoryPill;
