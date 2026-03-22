import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useCarts } from '../../hooks/useCarts';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import DealBadge from '../../components/DealBadge';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';
import { restartAppMessage } from '../../constants/errorMessages';

const { width } = Dimensions.get('window');

/**
 * ProductDetailScreen
 *
 * Shows full product information for a selected deal:
 * - Full-width hero image (or emoji placeholder)
 * - Discount badge, eco-pick badge
 * - Business name, product name, short + long description
 * - Original (strikethrough) and discounted price
 * - Pickup time window
 * - Stock availability indicator
 * - Quantity selector (±)
 * - "You rescued N meal(s)" sustainability badge
 * - Sticky "Add to Cart" CTA button
 *
 * Fetches product by ID via `useProducts.getProductById`.
 * `productId` is received as a string search param from Expo Router.
 */
export default function ProductDetailScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const productsHook = useProducts();
  const cartsHook = useCarts();
  const getProductById = productsHook.data?.getProductById;
  const addToCart = cartsHook.data?.addItem;

  const fetchFn = useCallback(
    () =>
      getProductById
        ? getProductById(productId ?? '')
        : Promise.resolve({ data: null, error: { message: 'Hook not ready', isFatal: false } }),
    [getProductById, productId],
  );

  const { data: product, error, loading } = useAsyncWithTimeout<Product>(fetchFn, 10000, false);

  useEffect(() => {
    if (error) {
      displayError(error.isFatal ? restartAppMessage : error.message, error.isFatal);
    }
  }, [error]);

  const handleAddToCart = async () => {
    if (!addToCart || !product) return;
    setAddingToCart(true);
    const result = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else {
      Alert.alert('🎉 Added to cart!', `${quantity}× ${product.product_name} added.`);
    }
  };

  if (loading || !product) {
    return <LoadingScreen message="Loading deal…" />;
  }

  const imageUrl = product.images?.[0]?.image_url ?? null;
  const businessName = product.business?.business_name ?? 'Local Store';
  const originalPrice = (product.original_price_cents / 100).toFixed(2);
  const salePrice = (product.discounted_price_cents / 100).toFixed(2);
  const discountPct = Math.round(
    ((product.original_price_cents - product.discounted_price_cents) / product.original_price_cents) * 100,
  );
  const pickupLabel = product.pickup_start
    ? formatPickup(product.pickup_start, product.pickup_end)
    : 'Pickup today';
  const totalPrice = ((product.discounted_price_cents * quantity) / 100).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderEmoji}>🍱</Text>
            </View>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {discountPct > 0 && (
            <View style={styles.discountChip}>
              <Text style={styles.discountChipText}>{discountPct}% off</Text>
            </View>
          )}
        </View>

        <View style={styles.contentCard}>
          <View style={styles.badgesRow}>
            {discountPct >= 50 && <DealBadge variant="popular" />}
            {product.stock <= 3 && product.stock > 0 && (
              <DealBadge variant="lastChance" label={`${product.stock} left`} />
            )}
            <DealBadge variant="ecoPick" />
          </View>

          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.businessName}>🏪 {businessName}</Text>

          <Text style={styles.description}>{product.long_description || product.short_description}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>Pickup: {pickupLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📦</Text>
            <Text style={styles.infoText}>
              {product.stock} portion{product.stock !== 1 ? 's' : ''} left
            </Text>
          </View>

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.salePrice}>${salePrice}</Text>
              <Text style={styles.originalPrice}>Was ${originalPrice}</Text>
            </View>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>
                Save ${((product.original_price_cents - product.discounted_price_cents) / 100).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.ecoMessage}>
            <Text style={styles.ecoEmoji}>🌱</Text>
            <Text style={styles.ecoText}>
              By ordering, you rescue {quantity} meal{quantity !== 1 ? 's' : ''} and reduce food waste!
            </Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={[styles.qtyButton, quantity <= 1 && styles.qtyButtonDisabled]}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}>
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyButton, quantity >= product.stock && styles.qtyButtonDisabled]}
                onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${totalPrice}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, addingToCart && styles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart}
          activeOpacity={0.85}>
          {addingToCart ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.addButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function formatPickup(start: string, end: string | null): string {
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  return e ? `${fmt(s)} – ${fmt(e)}` : fmt(s);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: 120 },
  imageContainer: { width, height: width * 0.75, position: 'relative', backgroundColor: '#F0F0E8' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F0E8' },
  imagePlaceholderEmoji: { fontSize: 72 },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { fontSize: 20, color: Colors.white, fontWeight: '700' },
  discountChip: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  discountChipText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.charcoal },
  contentCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  badgesRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  productName: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.charcoal },
  businessName: { fontSize: FontSize.md, color: Colors.muted, fontWeight: '500' },
  description: { fontSize: FontSize.md, color: Colors.charcoal, lineHeight: 22, marginTop: Spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  infoIcon: { fontSize: 16 },
  infoText: { fontSize: FontSize.md, color: Colors.charcoal, fontWeight: '500' },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  salePrice: { fontSize: FontSize.xxl + 4, fontWeight: '900', color: Colors.primary },
  originalPrice: { fontSize: FontSize.sm, color: Colors.muted, textDecorationLine: 'line-through' },
  savingsBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  savingsText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.charcoal },
  ecoMessage: {
    flexDirection: 'row',
    backgroundColor: '#F0FAF4',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#C8EDD5',
  },
  ecoEmoji: { fontSize: 20 },
  ecoText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', lineHeight: 20 },
  quantitySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.charcoal },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonDisabled: { backgroundColor: Colors.border },
  qtyButtonText: { fontSize: 22, color: Colors.white, fontWeight: '700', lineHeight: 26 },
  qtyValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.charcoal,
    minWidth: 24,
    textAlign: 'center',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    gap: Spacing.sm,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FontSize.md, color: Colors.muted, fontWeight: '600' },
  totalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.charcoal },
  addButton: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  addButtonDisabled: { opacity: 0.7 },
  addButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
