import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/Colors';
import { Product } from '../types';
import DealBadge from './DealBadge';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.sm) / 2;

interface Props {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

/**
 * ProductCard
 *
 * A two-column grid card showing a food deal. Displays:
 * - Product image (first image from images array, or a placeholder emoji)
 * - Discount percentage badge (lime) in the top-left corner
 * - Product name, business name, pickup window
 * - Original price (strikethrough) + discounted price
 * - "Add to Cart" button (orange CTA)
 *
 * Used in HomeScreen's deal feed grid.
 *
 * @param product      - Full Product object (with images + business joined).
 * @param onPress      - Navigate to ProductDetailScreen.
 * @param onAddToCart  - Add item to cart without navigating.
 */
const ProductCard: React.FC<Props> = ({ product, onPress, onAddToCart }) => {
  const imageUrl = product.images?.[0]?.image_url ?? null;
  const businessName = product.business?.business_name ?? 'Local Store';
  const discountPct = Math.round(
    ((product.original_price_cents - product.discounted_price_cents) /
      product.original_price_cents) *
      100,
  );
  const originalPrice = (product.original_price_cents / 100).toFixed(2);
  const salePrice = (product.discounted_price_cents / 100).toFixed(2);

  const pickupLabel = product.pickup_start
    ? `Pickup ${formatPickup(product.pickup_start, product.pickup_end)}`
    : 'Pickup today';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderEmoji}>🍱</Text>
          </View>
        )}
        {discountPct > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPct}% off</Text>
          </View>
        )}
        {product.stock <= 3 && product.stock > 0 && (
          <View style={styles.lastChanceBadge}>
            <Text style={styles.lastChanceText}>Last {product.stock}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>{product.product_name}</Text>
        <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>
        <Text style={styles.pickup} numberOfLines={1}>{pickupLabel}</Text>

        {/* Pricing */}
        <View style={styles.priceRow}>
          <Text style={styles.salePrice}>${salePrice}</Text>
          <Text style={styles.originalPrice}>${originalPrice}</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.addButton} onPress={onAddToCart} activeOpacity={0.85}>
          <Text style={styles.addButtonText}>+ Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

function formatPickup(start: string | null, end: string | null): string {
  if (!start) return 'today';
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  return e ? `${fmt(s)}–${fmt(e)}` : fmt(s);
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderEmoji: {
    fontSize: 40,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  lastChanceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  lastChanceText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '800',
    color: Colors.white,
  },
  content: {
    padding: Spacing.sm,
    gap: 3,
  },
  productName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  businessName: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontWeight: '500',
  },
  pickup: {
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  salePrice: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  addButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});

export default ProductCard;
