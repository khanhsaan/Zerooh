import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useOrders } from '../../hooks/useOrders';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Order } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

/**
 * OrdersScreen
 *
 * Matches the Orders mockup exactly:
 * - UPPERCASE "ORDERS" header
 * - darkGray order cards with #ID format, lime "Ready" badge, w10 "Done" badge
 * - lime10 pickup banner for ready orders
 * - lime total value, lime border-top on footer
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchOrders}
            tintColor={Colors.lime}
            colors={[Colors.lime]}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {items.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Order your first deal and help rescue food!</Text>
            </View>
          )}

          {items.map((order) => {
            const p = order.product;
            const isReady = order.status === 'pending';
            const totalPrice = `$${(order.total_price_cents / 100).toFixed(2)}`;
            const date = new Date(order.created_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>#{order.id.slice(0, 4).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>{date}</Text>
                  </View>
                  <View style={[styles.statusBadge, isReady ? styles.statusReady : styles.statusCompleted]}>
                    {isReady ? (
                      <>
                        <Ionicons name="time-outline" size={14} color={Colors.black} />
                        <Text style={styles.statusText}>Ready</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={14} color={Colors.white} />
                        <Text style={[styles.statusText, styles.statusTextDone]}>Done</Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Order Items */}
                <View style={styles.orderItems}>
                  <Text style={styles.orderItem}>
                    {order.quantity}x {p?.product_name ?? 'Product'}
                  </Text>
                  {p?.business?.business_name && (
                    <Text style={styles.orderBusiness}>{p.business.business_name}</Text>
                  )}
                </View>

                {/* Pickup Banner */}
                {isReady && order.pickup_time && (
                  <View style={styles.pickupBanner}>
                    <Text style={styles.pickupText}>
                      Pickup: {new Date(order.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Text>
                  </View>
                )}

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{totalPrice}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20 },
  headerTitle: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  ordersList: { paddingHorizontal: 20, paddingVertical: 20, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  emptySubtitle: { fontSize: 15, color: Colors.w60, textAlign: 'center' },
  orderCard: {
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 20,
    padding: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.w10,
  },
  orderId: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  orderDate: { color: Colors.w60, fontSize: 14, fontWeight: '600' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusReady: { backgroundColor: Colors.lime },
  statusCompleted: { backgroundColor: Colors.w10 },
  statusText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusTextDone: { color: Colors.white },
  orderItems: { gap: 8, marginBottom: 16 },
  orderItem: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  orderBusiness: { color: Colors.w60, fontSize: 13, fontWeight: '600' },
  pickupBanner: {
    backgroundColor: Colors.lime10,
    borderWidth: 1,
    borderColor: Colors.lime30,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  pickupText: {
    color: Colors.lime,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.w10,
  },
  totalLabel: {
    color: Colors.w70,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalValue: { color: Colors.lime, fontSize: 24, fontWeight: '900' },
});

export default OrdersScreen;
