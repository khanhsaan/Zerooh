import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useCarts } from '../../hooks/useCarts';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';
import { restartAppMessage } from '../../constants/errorMessages';

/**
 * ProductDetailScreen
 *
 * Matches the ProductDetail mockup exactly:
 * - 320px hero image with header buttons (back left, heart right) over image
 * - Orange discount badge bottom-right of image
 * - Flat content on black background (no rounded card overlay)
 * - Title + lime rating pill in a row
 * - Info pills with Ionicons and w10 background
 * - Description section (UPPERCASE label)
 * - Deep green environmental impact card
 * - Bottom bar: lime price + strikethrough original, qty control pill, lime "Add to Cart" button
 */
export default function ProductDetailScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
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
      Alert.alert('Added to cart!', `${quantity}× ${product.product_name} added.`);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderEmoji}>🍱</Text>
            </View>
          )}

          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.headerButton}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? Colors.orange : Colors.white}
              />
            </TouchableOpacity>
          </View>

          {/* Discount Badge */}
          {discountPct > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPct}% OFF</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{product.product_name}</Text>
              <Text style={styles.restaurant}>{businessName}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={Colors.black} />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          {/* Info Pills */}
          <View style={styles.infoPills}>
            <View style={styles.infoPill}>
              <Ionicons name="location-outline" size={16} color={Colors.lime} />
              <Text style={styles.infoPillText}>0.5 km</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="time-outline" size={16} color={Colors.lime} />
              <Text style={styles.infoPillText}>{pickupLabel}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.long_description || product.short_description || 'A delicious surplus item at a great price.'}
            </Text>
          </View>

          {/* Stock */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.allergenTag}>
              <Text style={styles.allergenText}>{product.stock} portion{product.stock !== 1 ? 's' : ''} left</Text>
            </View>
          </View>

          {/* Impact */}
          <View style={styles.impactCard}>
            <Text style={styles.impactLabel}>🌍 Environmental Impact</Text>
            <Text style={styles.impactNumber}>Save ~0.8kg CO₂</Text>
            <Text style={styles.impactDescription}>Every meal rescued reduces food waste</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${salePrice}</Text>
            <Text style={styles.originalPrice}>${originalPrice}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.quantityButton}>
              <Ionicons name="remove" size={16} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              style={styles.quantityButton}
              disabled={quantity >= product.stock}>
              <Ionicons name="add" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addButton, addingToCart && styles.addButtonDisabled]}
            onPress={handleAddToCart}
            disabled={addingToCart}
            activeOpacity={0.85}>
            {addingToCart ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.addButtonText}>Add to Cart</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  container: { flex: 1, backgroundColor: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  imageContainer: { height: 320, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' },
  imagePlaceholderEmoji: { fontSize: 72 },
  headerButtons: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Colors.orange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  discountText: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: { flex: 1, paddingRight: 12 },
  title: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  restaurant: { color: Colors.w70, fontSize: 16, fontWeight: '600' },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lime,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  ratingText: { color: Colors.black, fontSize: 15, fontWeight: '900' },
  infoPills: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  infoPillText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  description: { color: Colors.w70, fontSize: 15, lineHeight: 24 },
  allergenTag: {
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  allergenText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  impactCard: {
    backgroundColor: Colors.deepGreen,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.lime20,
  },
  impactLabel: {
    color: Colors.lime,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  impactNumber: { color: Colors.white, fontSize: 24, fontWeight: '900' },
  impactDescription: { color: Colors.w80, fontSize: 14, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.black,
    borderTopWidth: 1,
    borderTopColor: Colors.w10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  price: { color: Colors.lime, fontSize: 32, fontWeight: '900' },
  originalPrice: {
    color: Colors.w30,
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w20,
    borderRadius: 14,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.w10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    width: 28,
    textAlign: 'center',
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  addButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.lime,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: { opacity: 0.7 },
  addButtonText: { color: Colors.black, fontSize: 16, fontWeight: '700' },
});
