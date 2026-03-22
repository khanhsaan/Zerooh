import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useCarts } from '../../hooks/useCarts';
import { useOrders } from '../../hooks/useOrders';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { CartItem } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

/**
 * CartScreen
 *
 * Matches the Cart mockup exactly:
 * - Header: back button (w10 circle) + UPPERCASE "Your Cart" + orange item count circle
 * - Cart items: darkGray cards, 80×80 images, inline qty control pill, lime price
 * - Bottom checkout panel: price breakdown (orange savings, lime total with lime border-top), lime checkout button
 */
const CartScreen: React.FC = () => {
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const [cartVersion, setCartVersion] = useState(0);

  const cartsHook = useCarts();
  const ordersHook = useOrders();

  const getAllItems = cartsHook.data?.getAllItems;
  const removeItem = cartsHook.data?.removeItem;
  const clearCart = cartsHook.data?.clearCart;
  const createOrder = ordersHook.data?.createOrder;

  const {
    data: cartItems,
    error,
    loading,
    execute: fetchCart,
  } = useAsyncWithTimeout<CartItem[]>(getAllItems ?? (() => Promise.resolve({ data: [], error: null })), 10000, false);

  useEffect(() => {
    if (getAllItems) fetchCart();
  }, [getAllItems, cartVersion]);

  useEffect(() => {
    if (error) displayError(error.message, error.isFatal);
  }, [error]);

  const handleRemove = useCallback(
    async (itemId: string) => {
      if (!removeItem) return;
      const result = await removeItem(itemId);
      if (result.error) Alert.alert('Error', result.error.message);
      else setCartVersion((v) => v + 1);
    },
    [removeItem],
  );

  const handleCheckout = useCallback(async () => {
    if (!createOrder || !clearCart || !cartItems?.length) return;
    setCheckingOut(true);
    for (const item of cartItems) {
      if (!item.product_id || !item.quantity || !item.product) continue;
      await createOrder(
        item.product_id,
        item.quantity,
        item.product.discounted_price_cents * item.quantity,
        item.product.pickup_start ?? undefined,
      );
    }
    await clearCart();
    setCheckingOut(false);
    setCartVersion((v) => v + 1);
    Alert.alert('Order placed!', 'Your orders are confirmed. See you at pickup!');
  }, [createOrder, clearCart, cartItems]);

  if (loading && !cartItems) return <LoadingScreen message="Loading your cart…" />;

  const items = cartItems ?? [];
  const totalItemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const subtotalCents = items.reduce(
    (sum, item) => sum + (item.product?.discounted_price_cents ?? 0) * (item.quantity ?? 1),
    0,
  );
  const savingsCents = items.reduce(
    (sum, item) =>
      sum +
      ((item.product?.original_price_cents ?? 0) - (item.product?.discounted_price_cents ?? 0)) *
        (item.quantity ?? 1),
    0,
  );
  const totalCents = subtotalCents;

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <View style={styles.itemCount}>
              <Text style={styles.itemCountText}>{totalItemCount}</Text>
            </View>
          </View>
        </View>

        {/* Cart Items */}
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add some deals from the Home tab.</Text>
          </View>
        ) : (
          <View style={styles.cartItems}>
            {items.map((item) => {
              const p = item.product;
              const imageUrl = p?.images?.[0]?.image_url ?? null;
              const qty = item.quantity ?? 1;
              return (
                <View key={item.id} style={styles.cartItem}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                      <Text style={styles.itemImageEmoji}>🍱</Text>
                    </View>
                  )}

                  <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>{p?.product_name ?? 'Product'}</Text>
                        <Text style={styles.itemRestaurant} numberOfLines={1}>{p?.business?.business_name ?? 'Store'}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemove(item.id)}>
                        <Ionicons name="trash-outline" size={16} color={Colors.w40} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.itemFooter}>
                      <View style={styles.itemPriceContainer}>
                        <Text style={styles.itemPrice}>
                          {fmt((p?.discounted_price_cents ?? 0) * qty)}
                        </Text>
                        <Text style={styles.itemOriginalPrice}>
                          {fmt((p?.original_price_cents ?? 0) * qty)}
                        </Text>
                      </View>

                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          onPress={() => {/* qty dec not wired in current arch */}}
                          style={styles.quantityButton}>
                          <Ionicons name="remove" size={16} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{qty}</Text>
                        <TouchableOpacity
                          onPress={() => {/* qty inc not wired in current arch */}}
                          style={styles.quantityButton}>
                          <Ionicons name="add" size={16} color={Colors.white} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Checkout Panel */}
      {items.length > 0 && (
        <View style={styles.checkoutPanel}>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{fmt(subtotalCents)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>You Save</Text>
              <Text style={styles.savingsValue}>{fmt(savingsCents)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery</Text>
              <Text style={styles.freeValue}>Free</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmt(totalCents)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, checkingOut && styles.disabled]}
            onPress={handleCheckout}
            disabled={checkingOut}
            activeOpacity={0.85}>
            {checkingOut ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 300 },
  header: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.w10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  itemCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCountText: { color: Colors.white, fontSize: 14, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  emptySubtitle: { fontSize: 15, color: Colors.w60 },
  cartItems: { paddingHorizontal: 20, paddingVertical: 20, gap: 12 },
  cartItem: {
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: { width: 80, height: 80, borderRadius: 14 },
  itemImagePlaceholder: {
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageEmoji: { fontSize: 28 },
  itemDetails: { flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  itemRestaurant: { color: Colors.w60, fontSize: 13 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPriceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  itemPrice: { color: Colors.lime, fontSize: 20, fontWeight: '900' },
  itemOriginalPrice: {
    color: Colors.w30,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w20,
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.w10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    width: 24,
    textAlign: 'center',
    color: Colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  bottomSpacer: { height: 40 },
  checkoutPanel: {
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
  priceBreakdown: { gap: 10, marginBottom: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { color: Colors.w70, fontSize: 15, fontWeight: '600' },
  priceValue: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  savingsValue: { color: Colors.orange, fontSize: 18, fontWeight: '900' },
  freeValue: { color: Colors.lime, fontSize: 15, fontWeight: '700' },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: Colors.lime,
  },
  totalLabel: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  totalValue: { color: Colors.lime, fontSize: 30, fontWeight: '900' },
  checkoutButton: {
    backgroundColor: Colors.lime,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: { opacity: 0.7 },
  checkoutButtonText: {
    color: Colors.black,
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default CartScreen;
