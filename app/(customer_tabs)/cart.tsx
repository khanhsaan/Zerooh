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
 * Dark theme (#1a1a1a bg, #2a2a2a cards). Displays the user's current cart items with:
 * - Thumbnail, name, business, discounted price × quantity per item
 * - Remove item button (trashcan)
 * - Price breakdown: subtotal, savings (orange), service fee, total (lime)
 * - Savings summary line
 * - Lime "Checkout" CTA — creates orders from cart then clears cart
 *
 * Uses `useAsyncWithTimeout` for loading cart, `useCarts` for CRUD,
 * and `useOrders.createOrder` to convert cart items to orders.
 */
const CartScreen: React.FC = () => {
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

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
            <View style={styles.summaryRow}>
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

            {savingsCents > 0 && (
              <View style={styles.ecoMessage}>
                <Text style={styles.ecoText}>
                  🌱 You saved {fmt(savingsCents)} and helped reduce food waste!
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.checkoutButton, checkingOut && styles.disabled]}
              onPress={handleCheckout}
              disabled={checkingOut}
              activeOpacity={0.85}>
              {checkingOut ? (
                <ActivityIndicator color={Colors.dark} />
              ) : (
                <Text style={styles.checkoutButtonText}>CHECKOUT — {fmt(totalCents)}</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.muted },
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.sm },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  cartImageContainer: { width: 64, height: 64, borderRadius: BorderRadius.md, overflow: 'hidden' },
  cartImage: { width: '100%', height: '100%' },
  cartImagePlaceholder: { flex: 1, backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center' },
  cartImageEmoji: { fontSize: 28 },
  cartItemDetails: { flex: 1 },
  cartItemName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  cartItemBusiness: { fontSize: FontSize.xs, color: Colors.muted },
  cartItemQty: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  cartItemRight: { alignItems: 'flex-end', gap: Spacing.xs },
  cartItemPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.lime },
  removeButton: { padding: 4 },
  removeButtonText: { fontSize: 16 },
  summaryCard: {
    backgroundColor: Colors.darkCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.md, color: Colors.muted, fontWeight: '500' },
  summaryValue: { fontSize: FontSize.md, color: Colors.white, fontWeight: '600' },
  savingsLabel: { fontSize: FontSize.md, color: Colors.orange, fontWeight: '600' },
  savingsValue: { fontSize: FontSize.md, color: Colors.orange, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  totalValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.lime },
  ecoMessage: {
    backgroundColor: 'rgba(0,73,44,0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,73,44,0.5)',
  },
  ecoText: { fontSize: FontSize.sm, color: Colors.lime, fontWeight: '600', lineHeight: 20 },
  checkoutButton: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: Spacing.xs,
  },
  disabled: { opacity: 0.7 },
  checkoutButtonText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, letterSpacing: 0.5 },
});

export default CartScreen;
