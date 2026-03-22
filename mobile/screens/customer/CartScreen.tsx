import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList,
  TouchableOpacity, Alert, ActivityIndicator, Image,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useCarts } from '../../hooks/useCarts';
import { useOrders } from '../../hooks/useOrders';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { CartItem } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

const SERVICE_FEE_CENTS = 49; // $0.49

/**
 * CartScreen
 *
 * Displays the user's current cart items with:
 * - Thumbnail, name, business, discounted price × quantity per item
 * - Remove item button (trashcan)
 * - Price breakdown: subtotal, savings, service fee, total
 * - Savings summary line ("You saved $X and helped reduce food waste!")
 * - Orange "Checkout" CTA — creates orders from cart then clears cart
 *
 * Uses `useAsyncWithTimeout` for loading cart, `useCarts` for CRUD,
 * and `useOrders.createOrder` to convert cart items to orders.
 */
const CartScreen: React.FC = () => {
  const [checkingOut, setCheckingOut] = useState(false);
  const [cartVersion, setCartVersion] = useState(0); // bump to re-fetch

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
    Alert.alert('🎉 Order placed!', 'Your orders are confirmed. See you at pickup!');
  }, [createOrder, clearCart, cartItems]);

  if (loading && !cartItems) return <LoadingScreen message="Loading your cart…" />;

  const items = cartItems ?? [];
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
  const totalCents = subtotalCents + SERVICE_FEE_CENTS;

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cream} />

      <View style={styles.header}>
        <Text style={styles.title}>My Cart 🛒</Text>
        <Text style={styles.subtitle}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some deals from the Home tab.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const p = item.product;
              const imageUrl = p?.images?.[0]?.image_url ?? null;
              const qty = item.quantity ?? 1;
              const lineTotal = fmt((p?.discounted_price_cents ?? 0) * qty);
              return (
                <View style={styles.cartItem}>
                  <View style={styles.cartImageContainer}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.cartImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.cartImagePlaceholder}>
                        <Text style={styles.cartImageEmoji}>🍱</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{p?.product_name ?? 'Product'}</Text>
                    <Text style={styles.cartItemBusiness} numberOfLines={1}>{p?.business?.business_name ?? 'Store'}</Text>
                    <Text style={styles.cartItemQty}>Qty: {qty}</Text>
                  </View>
                  <View style={styles.cartItemRight}>
                    <Text style={styles.cartItemPrice}>{lineTotal}</Text>
                    <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeButton}>
                      <Text style={styles.removeButtonText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />

          {/* Price breakdown */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(subtotalCents)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.savingsRow]}>
              <Text style={styles.savingsLabel}>💚 Savings</Text>
              <Text style={styles.savingsValue}>−{fmt(savingsCents)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service fee</Text>
              <Text style={styles.summaryValue}>{fmt(SERVICE_FEE_CENTS)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmt(totalCents)}</Text>
            </View>

            {/* Savings message */}
            {savingsCents > 0 && (
              <View style={styles.ecoMessage}>
                <Text style={styles.ecoText}>
                  🌱 You saved {fmt(savingsCents)} and helped reduce food waste!
                </Text>
              </View>
            )}

            {/* Checkout button */}
            <TouchableOpacity
              style={[styles.checkoutButton, checkingOut && styles.disabled]}
              onPress={handleCheckout}
              disabled={checkingOut}
              activeOpacity={0.85}>
              {checkingOut ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.checkoutButtonText}>Checkout — {fmt(totalCents)}</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.charcoal },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.charcoal },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.muted },
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.sm },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cartImageContainer: { width: 64, height: 64, borderRadius: BorderRadius.md, overflow: 'hidden' },
  cartImage: { width: '100%', height: '100%' },
  cartImagePlaceholder: { flex: 1, backgroundColor: '#F0F0E8', alignItems: 'center', justifyContent: 'center' },
  cartImageEmoji: { fontSize: 28 },
  cartItemDetails: { flex: 1 },
  cartItemName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.charcoal },
  cartItemBusiness: { fontSize: FontSize.xs, color: Colors.muted },
  cartItemQty: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  cartItemRight: { alignItems: 'flex-end', gap: Spacing.xs },
  cartItemPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  removeButton: { padding: 4 },
  removeButtonText: { fontSize: 16 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.md, color: Colors.muted, fontWeight: '500' },
  summaryValue: { fontSize: FontSize.md, color: Colors.charcoal, fontWeight: '600' },
  savingsRow: {},
  savingsLabel: { fontSize: FontSize.md, color: '#2D7D4E', fontWeight: '600' },
  savingsValue: { fontSize: FontSize.md, color: '#2D7D4E', fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.charcoal },
  totalValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.charcoal },
  ecoMessage: {
    backgroundColor: '#F0FAF4',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C8EDD5',
  },
  ecoText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', lineHeight: 20 },
  checkoutButton: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: Spacing.xs,
  },
  disabled: { opacity: 0.7 },
  checkoutButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});

export default CartScreen;
