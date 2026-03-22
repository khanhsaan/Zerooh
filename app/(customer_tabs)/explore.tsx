import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  FlatList, Image,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

/**
 * MapScreen
 *
 * Dark theme (#1a1a1a bg). Explore screen showing nearby food businesses and
 * their available deals. Displays a mock location banner (map integration is
 * a v2 feature). Lists participating stores with deal counts and thumbnails.
 *
 * Uses `useProducts` grouped by business to build the store list.
 * Uses `useAsyncWithTimeout` for loading state management.
 */
const MapScreen: React.FC = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

      {/* Map placeholder */}
      <View style={styles.mapArea}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <Text style={styles.mapText}>Wollongong & Sydney</Text>
          <Text style={styles.mapSubtext}>Interactive map — coming soon</Text>
        </View>

        {/* Store pins overlay */}
        <View style={styles.pinsRow}>
          {stores.slice(0, 4).map((store, i) => (
            <View key={i} style={[styles.pin, i % 2 === 0 ? styles.pinGreen : styles.pinLime]}>
              <Text style={styles.pinText}>🏪</Text>
              <Text style={[styles.pinLabel, i % 2 !== 0 && styles.pinLabelDark]} numberOfLines={1}>
                {store.business.business_name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Nearby stores list */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        <Text style={styles.sheetTitle}>Nearby Stores 📍</Text>
        <Text style={styles.sheetSubtitle}>{stores.length} store{stores.length !== 1 ? 's' : ''} with active deals</Text>

        <FlatList
          data={stores}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.storeList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏪</Text>
              <Text style={styles.emptyTitle}>No stores nearby</Text>
              <Text style={styles.emptySubtitle}>Check back soon!</Text>
            </View>
          }
          renderItem={({ item: store }) => {
            const firstImg = store.products[0]?.images?.[0]?.image_url ?? null;
            const minPrice = Math.min(...store.products.map((p: Product) => p.discounted_price_cents));
            return (
              <View style={styles.storeCard}>
                <View style={styles.storeImageContainer}>
                  {firstImg ? (
                    <Image source={{ uri: firstImg }} style={styles.storeImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.storeImagePlaceholder}>
                      <Text style={styles.storeImageEmoji}>🏪</Text>
                    </View>
                  )}
                </View>
                <View style={styles.storeDetails}>
                  <Text style={styles.storeName}>{store.business.business_name}</Text>
                  <Text style={styles.storeAddress} numberOfLines={1}>
                    {store.business.suburb ? `${store.business.suburb}, ${store.business.postcode}` : 'Local area'}
                  </Text>
                  <View style={styles.storeMetaRow}>
                    <View style={styles.dealCountBadge}>
                      <Text style={styles.dealCountText}>{store.products.length} deal{store.products.length !== 1 ? 's' : ''}</Text>
                    </View>
                    <Text style={styles.storeDistance}>≈ 1.2 km</Text>
                  </View>
                </View>
                <View style={styles.storePriceBlock}>
                  <Text style={styles.storePriceFrom}>from</Text>
                  <Text style={styles.storePrice}>${(minPrice / 100).toFixed(2)}</Text>
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  mapArea: {
    height: 220,
    backgroundColor: '#0d2d1a',
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapPlaceholder: { alignItems: 'center', gap: 4 },
  mapEmoji: { fontSize: 48, marginBottom: 4 },
  mapText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.lime },
  mapSubtext: { fontSize: FontSize.sm, color: Colors.muted },
  pinsRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    maxWidth: 130,
  },
  pinGreen: { backgroundColor: Colors.primary },
  pinLime: { backgroundColor: Colors.lime },
  pinText: { fontSize: 13 },
  pinLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.white, flexShrink: 1 },
  pinLabelDark: { color: Colors.dark },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  sheetSubtitle: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: Spacing.md },
  storeList: { gap: Spacing.sm, paddingBottom: Spacing.xxl },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.muted },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeImageContainer: { width: 60, height: 60, borderRadius: BorderRadius.md, overflow: 'hidden' },
  storeImage: { width: '100%', height: '100%' },
  storeImagePlaceholder: { flex: 1, backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center' },
  storeImageEmoji: { fontSize: 28 },
  storeDetails: { flex: 1 },
  storeName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  storeAddress: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  storeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  dealCountBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dealCountText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.dark },
  storeDistance: { fontSize: FontSize.xs, color: Colors.muted },
  storePriceBlock: { alignItems: 'flex-end' },
  storePriceFrom: { fontSize: FontSize.xs, color: Colors.muted },
  storePrice: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.lime },
});

export default MapScreen;
