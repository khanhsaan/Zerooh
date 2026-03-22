import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList,
  Image, RefreshControl,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useOrders } from '../../hooks/useOrders';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Order } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: Colors.orange,  bg: '#FFF3DC' },
  completed: { label: 'Completed', color: '#2D7D4E',      bg: '#F0FAF4' },
  cancelled: { label: 'Cancelled', color: Colors.error,   bg: '#FEE7EC' },
};

/**
 * OrdersScreen
 *
 * Shows the authenticated customer's order history in reverse chronological order.
 * Each row displays:
 * - Product thumbnail or emoji placeholder
 * - Product name, business name
 * - Quantity × price
 * - Order status pill (Pending / Completed / Cancelled)
 * - Pickup time if available
 *
 * Uses `useAsyncWithTimeout` for loading, supports pull-to-refresh.
 */
const OrdersScreen: React.FC = () => {
  const ordersHook = useOrders();
  const getOrders = ordersHook.data?.getOrders;

  const {
    data: orders,
    error,
    loading,
    execute: fetchOrders,
  } = useAsyncWithTimeout<Order[]>(getOrders ?? (() => Promise.resolve({ data: [], error: null })), 10000, false);

  useEffect(() => {
    if (getOrders) fetchOrders();
  }, [getOrders]);

  useEffect(() => {
    if (error) displayError(error.message, error.isFatal);
  }, [error]);

  if (loading && !orders) return <LoadingScreen message="Loading orders…" />;

  const items = orders ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cream} />

      <View style={styles.header}>
        <Text style={styles.title}>My Orders 📋</Text>
        <Text style={styles.subtitle}>{items.length} order{items.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchOrders}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Order your first deal and help rescue food!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const p = item.product;
          const imageUrl = p?.images?.[0]?.image_url ?? null;
          const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          const totalPrice = `$${(item.total_price_cents / 100).toFixed(2)}`;
          const date = new Date(item.created_at).toLocaleDateString([], {
            month: 'short', day: 'numeric', year: 'numeric',
          });

          return (
            <View style={styles.orderCard}>
              <View style={styles.orderImageContainer}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.orderImage} resizeMode="cover" />
                ) : (
                  <View style={styles.orderImagePlaceholder}>
                    <Text style={styles.orderImageEmoji}>🍱</Text>
                  </View>
                )}
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderName} numberOfLines={1}>{p?.product_name ?? 'Product'}</Text>
                <Text style={styles.orderBusiness} numberOfLines={1}>{p?.business?.business_name ?? 'Store'}</Text>
                <Text style={styles.orderDate}>{date}</Text>
                {item.pickup_time && (
                  <Text style={styles.orderPickup}>
                    🕐 {new Date(item.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                )}
              </View>

              <View style={styles.orderRight}>
                <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
                <Text style={styles.orderTotal}>{totalPrice}</Text>
                <Text style={styles.orderQty}>×{item.quantity}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.charcoal },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xl },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl * 2, gap: Spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.charcoal },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.muted, textAlign: 'center' },
  orderCard: {
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
  orderImageContainer: { width: 60, height: 60, borderRadius: BorderRadius.md, overflow: 'hidden' },
  orderImage: { width: '100%', height: '100%' },
  orderImagePlaceholder: { flex: 1, backgroundColor: '#F0F0E8', alignItems: 'center', justifyContent: 'center' },
  orderImageEmoji: { fontSize: 26 },
  orderDetails: { flex: 1 },
  orderName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.charcoal },
  orderBusiness: { fontSize: FontSize.xs, color: Colors.muted },
  orderDate: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  orderPickup: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500', marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  statusPill: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  orderTotal: { fontSize: FontSize.md, fontWeight: '800', color: Colors.charcoal },
  orderQty: { fontSize: FontSize.xs, color: Colors.muted },
});

export default OrdersScreen;
