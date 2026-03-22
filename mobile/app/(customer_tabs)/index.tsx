import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useCarts } from '../../hooks/useCarts';
import { useProfile } from '../../hooks/useProfile';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';
import { restartAppMessage } from '../../constants/errorMessages';

const CATEGORIES = [
  { icon: '🥐', label: 'Bakery' },
  { icon: '☕', label: 'Cafe' },
  { icon: '🍱', label: 'Meals' },
  { icon: '🥗', label: 'Salad' },
];

/**
 * HomeScreen
 *
 * Main customer feed. Matches Premium Food Waste App Mock-up React Native design:
 * - Logo + lime avatar header
 * - Location row + search bar (whiteOpacity10 bg, icon left)
 * - Deep green impact banner
 * - 4-column category grid (whiteOpacity10 bg)
 * - 2-column deal card grid (darkGray cards, orange discount badge, lime price, lime + circle)
 *
 * Uses `useAsyncWithTimeout` for products, `useCarts.addItem` for cart.
 */
export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [firstName, setFirstName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const productsHook = useProducts();
  const cartsHook = useCarts();
  const profileHook = useProfile();

  const getProducts = productsHook.data?.getProducts;
  const addToCart = cartsHook.data?.addItem;
  const getUserFirstName = profileHook.data?.getUserFirstName;

  const {
    data: products,
    error: productsError,
    loading: productsLoading,
    execute: fetchProducts,
  } = useAsyncWithTimeout<Product[]>(
    getProducts ?? (() => Promise.resolve({ data: [], error: null })),
    10000,
    false,
  );

  useEffect(() => {
    if (getProducts) fetchProducts();
  }, [getProducts]);

  useEffect(() => {
    if (!getUserFirstName) return;
    getUserFirstName().then((res: { data: any; error: any }) => {
      if (!res.error && res.data) setFirstName(res.data);
    });
  }, [getUserFirstName]);

  useEffect(() => {
    if (productsError) {
      displayError(
        productsError.isFatal ? restartAppMessage : productsError.message,
        productsError.isFatal,
      );
    }
  }, [productsError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (getProducts) await fetchProducts();
    setRefreshing(false);
  }, [getProducts, fetchProducts]);

  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!addToCart) return;
      const result = await addToCart(product.id, 1);
      if (result.error) {
        Alert.alert('Cart Error', result.error.message);
      } else {
        Alert.alert('Added!', `${product.product_name} added to cart.`);
      }
    },
    [addToCart],
  );

  const filtered = (products ?? []).filter((p: Product) =>
    !searchQuery ||
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.business?.business_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const initials = firstName ? firstName[0].toUpperCase() : '?';

  if (productsLoading && !products) {
    return <LoadingScreen message="Finding deals near you…" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.lime}
            colors={[Colors.lime]}
          />
        }>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.logoText}>zeroooh!</Text>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <TouchableOpacity style={styles.location}>
            <Ionicons name="location-outline" size={16} color={Colors.w90} />
            <Text style={styles.locationText}>Wollongong • 2.5 km</Text>
            <Text style={styles.locationArrow}>▼</Text>
          </TouchableOpacity>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.w40} style={styles.searchIcon} />
            <TextInput
              placeholder="Restaurant, bakery, or dish..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor={Colors.w40}
            />
          </View>
        </View>

        {/* Impact Banner */}
        <View style={styles.section}>
          <View style={styles.impactBanner}>
            <Text style={styles.impactLabel}>🌍 Your Impact</Text>
            <Text style={styles.impactNumber}>7.6M</Text>
            <Text style={styles.impactSubtext}>tonnes of food saved in Australia</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity key={category.label} style={styles.categoryItem}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Deals</Text>

          <View style={styles.dealsGrid}>
            {filtered.map((deal) => {
              const imageUrl = deal.images?.[0]?.image_url ?? null;
              const discountPct = Math.round(
                ((deal.original_price_cents - deal.discounted_price_cents) / deal.original_price_cents) * 100,
              );
              const salePrice = (deal.discounted_price_cents / 100).toFixed(2);
              const origPrice = (deal.original_price_cents / 100).toFixed(2);

              return (
                <TouchableOpacity
                  key={deal.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(customer_tabs)/product-detail',
                      params: { productId: deal.id },
                    })
                  }
                  style={styles.dealCard}>
                  <View style={styles.dealImageContainer}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.dealImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.dealImagePlaceholder}>
                        <Text style={styles.dealImageEmoji}>🍱</Text>
                      </View>
                    )}
                    {/* Discount badge */}
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discountPct}% OFF</Text>
                    </View>
                    {/* Rating badge */}
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color={Colors.lime} />
                      <Text style={styles.ratingText}>4.8</Text>
                    </View>
                  </View>

                  <View style={styles.dealContent}>
                    <Text style={styles.dealName} numberOfLines={1}>{deal.product_name}</Text>
                    <Text style={styles.dealRestaurant} numberOfLines={1}>
                      {deal.business?.business_name ?? 'Local Store'}
                    </Text>
                    <Text style={styles.dealPickup}>
                      {deal.pickup_start ? `Today ${formatPickup(deal.pickup_start)}` : 'Pickup today'}
                    </Text>

                    <View style={styles.dealFooter}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.dealPrice}>${salePrice}</Text>
                        <Text style={styles.dealOriginalPrice}>${origPrice}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToCart(deal)}>
                        <Ionicons name="add" size={20} color={Colors.black} strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {filtered.length === 0 && !productsLoading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>No deals found</Text>
                <Text style={styles.emptySubtitle}>Check back soon for new listings.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatPickup(start: string): string {
  const s = new Date(start);
  return s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoText: { color: Colors.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.black, fontSize: 14, fontWeight: '700' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  locationText: { color: Colors.w90, fontSize: 14, fontWeight: '600' },
  locationArrow: { color: Colors.w90, fontSize: 10 },
  searchContainer: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 16, top: 18, zIndex: 1 },
  searchInput: {
    width: '100%',
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 16,
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w20,
    borderRadius: 16,
    color: Colors.white,
    fontSize: 16,
  },
  section: { paddingHorizontal: 20, paddingBottom: 20 },
  impactBanner: {
    backgroundColor: Colors.deepGreen,
    borderRadius: 20,
    padding: 20,
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
  impactNumber: { color: Colors.white, fontSize: 32, fontWeight: '900', lineHeight: 32 },
  impactSubtext: { color: Colors.w80, fontSize: 14, fontWeight: '600' },
  categoriesGrid: { flexDirection: 'row', gap: 12 },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w10,
  },
  categoryIcon: { fontSize: 32 },
  categoryLabel: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  dealsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  dealCard: {
    width: '48%',
    backgroundColor: Colors.darkGray,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.w10,
  },
  dealImageContainer: { height: 128, position: 'relative' },
  dealImage: { width: '100%', height: '100%' },
  dealImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealImageEmoji: { fontSize: 36 },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  discountText: { color: Colors.white, fontSize: 14, fontWeight: '900' },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.black70,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  dealContent: { padding: 12 },
  dealName: { color: Colors.white, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  dealRestaurant: { color: Colors.w60, fontSize: 12, marginBottom: 8 },
  dealPickup: { color: Colors.w60, fontSize: 11, fontWeight: '600', marginBottom: 12 },
  dealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  dealPrice: { color: Colors.lime, fontSize: 20, fontWeight: '900' },
  dealOriginalPrice: { color: Colors.w30, fontSize: 12, textDecorationLine: 'line-through' },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: 48, width: '100%' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: Colors.w60, textAlign: 'center' },
  bottomSpacer: { height: 20 },
});
