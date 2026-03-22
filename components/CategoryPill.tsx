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
 * Renders an emoji icon alongside a label. The `active` state applies the lime
 * highlight colour to indicate the currently selected category.
 *
 * @param emoji   - Emoji character shown to the left of the label.
 * @param label   - Category name (e.g. "Bakery", "Cafe").
 * @param active  - When true, fills background with lime and uses bold charcoal text.
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
    backgroundColor: Colors.white,
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    color: Colors.charcoal,
  },
  labelActive: {
    fontWeight: '800',
    color: Colors.charcoal,
  },
});

export default CategoryPill;
