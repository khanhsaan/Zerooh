import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

/**
 * ExploreScreen (Map)
 *
 * Matches the Map mockup exactly:
 * - UPPERCASE "Checkout" / "Explore" header with back button
 * - darkGray map placeholder (256px) with lime circle marker pin at centre
 * - "Pickup Location" section: lime location card with business name + address + pickup time pill
 * - darkGray "Order Summary" card with lime total + lime border-top
 * - Lime "Confirm & Pay" button at bottom
 */
const ExploreScreen: React.FC = () => {
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const productsHook = useProducts();
  const getProducts = productsHook.data?.getProducts;

  const {
    data: products,
    error,
    loading,
    execute: fetchProducts,
  } = useAsyncWithTimeout<Product[]>(getProducts ?? (() => Promise.resolve({ data: [], error: null })), 10000, false);

  useEffect(() => {
    if (getProducts) fetchProducts();
  }, [getProducts]);

  useEffect(() => {
    if (error) displayError(error.message, error.isFatal);
  }, [error]);

  // Group products by business
  const businessMap: Record<string, { business: any; products: Product[] }> = {};
  (products ?? []).forEach((p) => {
    if (!p.business) return;
    const id = p.user_id;
    if (!businessMap[id]) businessMap[id] = { business: p.business, products: [] };
    businessMap[id].products.push(p);
  });
  const stores = Object.values(businessMap);

  if (loading && !products) return <LoadingScreen message="Finding stores near you…" />;

  if (orderConfirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => setOrderConfirmed(false)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Success</Text>
            </View>
          </View>

          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={64} color={Colors.black} />
            </View>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>Your rescue bags are ready for pickup</Text>

            <View style={styles.orderNumberCard}>
              <Text style={styles.orderNumberLabel}>Order Number</Text>
              <Text style={styles.orderNumber}>#8742</Text>
            </View>

            <View style={styles.pickupInfo}>
              <Text style={styles.pickupInfoTitle}>Pickup Info</Text>
              <View style={styles.pickupInfoList}>
                <Text style={styles.pickupInfoItem}>• Show your order number to staff</Text>
                <Text style={styles.pickupInfoItem}>• Pickup: Today, 5:00 - 6:30 PM</Text>
                <Text style={styles.pickupInfoItem}>• 123 Baker Street, Wollongong</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => setOrderConfirmed(false)}
              activeOpacity={0.85}>
              <Text style={styles.ctaButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.backButton}>
              <Ionicons name="map-outline" size={20} color={Colors.white} />
            </View>
            <Text style={styles.headerTitle}>Explore</Text>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location-outline" size={64} color={Colors.w10} />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <View style={styles.mapMarker}>
            <Ionicons name="location" size={28} color={Colors.black} />
          </View>
        </View>

        {/* Nearby Stores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Stores</Text>

          {stores.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏪</Text>
              <Text style={styles.emptyTitle}>No stores nearby</Text>
              <Text style={styles.emptySubtitle}>Check back soon!</Text>
            </View>
          )}

          {stores.map((store, i) => {
            const firstImg = store.products[0]?.images?.[0]?.image_url ?? null;
            const minPrice = Math.min(...store.products.map((p: Product) => p.discounted_price_cents));
            return (
              <View key={i} style={styles.locationCard}>
                <Text style={styles.locationName}>{store.business.business_name}</Text>
                <View style={styles.addressRow}>
                  <Ionicons name="location" size={16} color={Colors.black70} />
                  <Text style={styles.addressText}>
                    {store.business.suburb
                      ? `${store.business.suburb}, ${store.business.postcode}`
                      : 'Local area'}
                  </Text>
                </View>
                <View style={styles.locationMeta}>
                  <View style={styles.pickupTimePill}>
                    <Text style={styles.pickupTimeText}>
                      {store.products.length} deal{store.products.length !== 1 ? 's' : ''} · from ${(minPrice / 100).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{stores.length} stores nearby</Text>
              <Text style={styles.summaryValue}>{stores.reduce((s, st) => s + st.products.length, 0)} deals</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryFree}>Free</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20 },
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
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mapPlaceholder: {
    height: 256,
    backgroundColor: Colors.darkGray,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.w10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapPlaceholderText: { color: Colors.w30, fontSize: 16, fontWeight: '600' },
  mapMarker: {
    position: 'absolute',
    width: 48,
    height: 48,
    backgroundColor: Colors.lime,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  emptySubtitle: { fontSize: 15, color: Colors.w60 },
  locationCard: {
    backgroundColor: Colors.lime,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  locationName: { color: Colors.black, fontSize: 20, fontWeight: '900', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  addressText: { color: Colors.black70, fontSize: 15, fontWeight: '600', flex: 1 },
  locationMeta: { flexDirection: 'row' },
  pickupTimePill: {
    backgroundColor: Colors.black,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickupTimeText: { color: Colors.lime, fontSize: 14, fontWeight: '700' },
  summaryCard: {
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 20,
    padding: 20,
  },
  summaryTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: { color: Colors.w70, fontSize: 15, fontWeight: '600' },
  summaryValue: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  summaryFree: { color: Colors.lime, fontSize: 15, fontWeight: '900' },
  bottomSpacer: { height: 40 },
  // Success screen styles
  successContent: { paddingHorizontal: 20, paddingVertical: 48, alignItems: 'center' },
  successIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  successSubtitle: {
    color: Colors.w60,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 40,
  },
  orderNumberCard: {
    backgroundColor: Colors.deepGreen,
    borderRadius: 22,
    padding: 24,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.lime20,
  },
  orderNumberLabel: {
    color: Colors.lime,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  orderNumber: { color: Colors.white, fontSize: 48, fontWeight: '900' },
  pickupInfo: {
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  pickupInfoTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  pickupInfoList: { gap: 10 },
  pickupInfoItem: { color: Colors.w70, fontSize: 15, fontWeight: '600' },
  ctaButton: {
    backgroundColor: Colors.lime,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaButtonText: {
    color: Colors.black,
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default ExploreScreen;
