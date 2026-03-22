import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useCarts } from '../../hooks/useCarts';
import { useProfile } from '../../hooks/useProfile';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import CategoryPill from '../../components/CategoryPill';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';
import { restartAppMessage } from '../../constants/errorMessages';

const CATEGORIES = [
  { emoji: '⭐', label: 'All' },
  { emoji: '🥐', label: 'Bakery' },
  { emoji: '☕', label: 'Cafe' },
  { emoji: '🍱', label: 'Meals' },
  { emoji: '🧃', label: 'Drinks' },
  { emoji: '🛒', label: 'Grocery' },
];

/**
 * HomeScreen
 *
 * Main customer feed. Displays:
 * - Personalised greeting with first name from Supabase
 * - Location + search bar
 * - Eco-impact banner (CO₂ saved, meals rescued)
 * - Category filter pills
 * - 2-column product card grid, filtered by selected category
 * - Pull-to-refresh support
 *
 * Uses `useAsyncWithTimeout` for products fetch and `useCarts.addItem` for cart actions.
 * Errors are handled via `displayError` per CLAUDE.md.
 */
export default function HomeScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('All');
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

  const filtered = (products ?? []).filter((p: Product) => {
    const matchCategory =
      selectedCategory === 'All' || p.category?.name === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.business?.business_name ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (productsLoading && !products) {
    return <LoadingScreen message="Finding deals near you…" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cream} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  {firstName ? `Hey, ${firstName} 👋` : 'Hey there 👋'}
                </Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationPin}>📍</Text>
                  <Text style={styles.location}>Wollongong · 2.5 km</Text>
                </View>
              </View>
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarText}>{firstName ? firstName[0].toUpperCase() : '?'}</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Restaurant, bakery, or dish…"
                placeholderTextColor={Colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>

            <View style={styles.impactBanner}>
              <View style={styles.impactItem}>
                <Text style={styles.impactEmoji}>🌿</Text>
                <Text style={styles.impactValue}>2.4M+</Text>
                <Text style={styles.impactLabel}>Meals rescued</Text>
              </View>
              <View style={styles.impactDivider} />
              <View style={styles.impactItem}>
                <Text style={styles.impactEmoji}>💨</Text>
                <Text style={styles.impactValue}>480t</Text>
                <Text style={styles.impactLabel}>CO₂ saved</Text>
              </View>
              <View style={styles.impactDivider} />
              <View style={styles.impactItem}>
                <Text style={styles.impactEmoji}>🏪</Text>
                <Text style={styles.impactValue}>1,200+</Text>
                <Text style={styles.impactLabel}>Partners</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat.label}
                  emoji={cat.emoji}
                  label={cat.label}
                  active={selectedCategory === cat.label}
                  onPress={() => setSelectedCategory(cat.label)}
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'All'
                  ? '🔥 Hot Deals'
                  : `${CATEGORIES.find((c) => c.label === selectedCategory)?.emoji} ${selectedCategory}`}
              </Text>
              <Text style={styles.sectionCount}>{filtered.length} available</Text>
            </View>

            {filtered.length === 0 && !productsLoading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>No deals found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try a different search.' : 'Check back soon for new listings.'}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              router.push({
                pathname: '/(customer_tabs)/product-detail',
                params: { productId: item.id },
              })
            }
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  listContent: { paddingBottom: Spacing.xl },
  columnWrapper: {
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.charcoal, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationPin: { fontSize: 13 },
  location: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: '500' },
  avatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.charcoal },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.charcoal, padding: 0 },
  impactBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  impactItem: { flex: 1, alignItems: 'center', gap: 2 },
  impactEmoji: { fontSize: 18 },
  impactValue: { fontSize: FontSize.md, fontWeight: '800', color: Colors.lime },
  impactLabel: { fontSize: FontSize.xs - 1, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
  impactDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' },
  categoryRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.charcoal },
  sectionCount: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.charcoal, marginBottom: Spacing.xs },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.muted, textAlign: 'center' },
});
