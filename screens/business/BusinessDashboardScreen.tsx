import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList,
  TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BusinessStackParamList } from '../../navigation/BusinessStack';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useProfile } from '../../hooks/useProfile';
import useAuth from '../../hooks/useAuth';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

type NavProp = NativeStackNavigationProp<BusinessStackParamList, 'BusinessDashboard'>;

interface AddProductForm {
  productName: string;
  shortDescription: string;
  originalPrice: string;
  discountedPrice: string;
  stock: string;
  pickupStart: string;
  pickupEnd: string;
}

const EMPTY_FORM: AddProductForm = {
  productName: '',
  shortDescription: '',
  originalPrice: '',
  discountedPrice: '',
  stock: '',
  pickupStart: '',
  pickupEnd: '',
};

/**
 * BusinessDashboardScreen
 *
 * Merchant-facing home screen showing:
 * - Daily stats cards: items listed, stock remaining, revenue recovered
 * - Active product listings with name, price, stock, and status indicator
 * - "Add Product" modal form (product name, description, original/discounted price,
 *   stock quantity, pickup window start/end)
 * - Sign out action
 *
 * Uses `useProducts.getBusinessProducts` to fetch own listings and
 * `useProducts.createProduct` to publish new surplus items.
 * TypeScript clean, follows ResponseType pattern throughout.
 */
const BusinessDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [businessName, setBusinessName] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'listings'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<AddProductForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const productsHook = useProducts();
  const profileHook = useProfile();
  const authHook = useAuth();

  const getBusinessProducts = productsHook.data?.getBusinessProducts;
  const createProduct = productsHook.data?.createProduct;
  const getUserFirstName = profileHook.data?.getUserFirstName;
  const signOut = authHook.data?.signOutHandle;

  const {
    data: products,
    error,
    loading,
    execute: fetchProducts,
  } = useAsyncWithTimeout<Product[]>(
    getBusinessProducts ?? (() => Promise.resolve({ data: [], error: null })),
    10000,
    false,
  );

  useEffect(() => {
    if (getBusinessProducts) fetchProducts();
  }, [getBusinessProducts]);

  // Fetch business name via first name hook (re-uses profile)
  useEffect(() => {
    if (!getUserFirstName) return;
    getUserFirstName().then((res: { data: any; error: any }) => {
      if (!res.error && res.data) setBusinessName(res.data);
    });
  }, [getUserFirstName]);

  useEffect(() => {
    if (error) displayError(error.message, error.isFatal);
  }, [error]);

  const handleSignOut = useCallback(async () => {
    if (!signOut) return;
    Alert.alert('Sign out', 'Sign out of business portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          const res = await signOut();
          setSigningOut(false);
          if (res.error) displayError(res.error.message, res.error.isFatal);
        },
      },
    ]);
  }, [signOut]);

  const handleAddProduct = useCallback(async () => {
    if (!createProduct) return;
    if (!form.productName || !form.originalPrice || !form.discountedPrice || !form.stock) {
      Alert.alert('Validation', 'Please fill in product name, prices, and stock.');
      return;
    }
    setSubmitting(true);
    const result = await createProduct({
      product_name: form.productName,
      short_description: form.shortDescription,
      long_description: form.shortDescription,
      original_price_cents: Math.round(parseFloat(form.originalPrice) * 100),
      discounted_price_cents: Math.round(parseFloat(form.discountedPrice) * 100),
      stock: parseInt(form.stock, 10),
      pickup_start: form.pickupStart ? new Date(form.pickupStart).toISOString() : null,
      pickup_end: form.pickupEnd ? new Date(form.pickupEnd).toISOString() : null,
    });
    setSubmitting(false);
    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else {
      setForm(EMPTY_FORM);
      setShowAddModal(false);
      fetchProducts();
      Alert.alert('✅ Listed!', `${form.productName} is now live.`);
    }
  }, [createProduct, form, fetchProducts]);

  if (loading && !products) return <LoadingScreen message="Loading your dashboard…" />;

  const listings = products ?? [];
  const totalStock = listings.reduce((s, p) => s + p.stock, 0);
  const revenueCents = listings.reduce((s, p) => s + p.discounted_price_cents * (10 - p.stock), 0); // estimated
  const todayCount = listings.filter((p) => {
    const d = new Date(p.created_at ?? '');
    return d.toDateString() === new Date().toDateString();
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Good morning 👋</Text>
          <Text style={styles.headerName}>{businessName || 'Your Business'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} disabled={signingOut} style={styles.signOutIcon}>
            {signingOut ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.signOutIconText}>⏏</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats cards */}
      <View style={styles.statsRow}>
        {[
          { emoji: '📦', value: listings.length.toString(), label: 'Active listings' },
          { emoji: '🍱', value: totalStock.toString(), label: 'Portions left' },
          { emoji: '💰', value: `$${(revenueCents / 100).toFixed(0)}`, label: 'Est. recovered' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['today', 'listings'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'today' ? `Today (${todayCount})` : `All Listings (${listings.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Listings */}
      <FlatList
        data={activeTab === 'today' ? listings.filter(p => {
          const d = new Date(p.created_at ?? '');
          return d.toDateString() === new Date().toDateString();
        }) : listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Add" to list your first surplus item.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const salePrice = `$${(item.discounted_price_cents / 100).toFixed(2)}`;
          const origPrice = `$${(item.original_price_cents / 100).toFixed(2)}`;
          const isLow = item.stock <= 2;
          return (
            <View style={styles.listingCard}>
              <View style={styles.listingLeft}>
                <Text style={styles.listingName}>{item.product_name}</Text>
                <Text style={styles.listingDescription} numberOfLines={1}>{item.short_description}</Text>
                <View style={styles.listingPriceRow}>
                  <Text style={styles.listingSalePrice}>{salePrice}</Text>
                  <Text style={styles.listingOrigPrice}>{origPrice}</Text>
                </View>
              </View>
              <View style={styles.listingRight}>
                <View style={[styles.stockBadge, isLow && styles.stockBadgeLow]}>
                  <Text style={[styles.stockText, isLow && styles.stockTextLow]}>
                    {item.stock} left
                  </Text>
                </View>
                <View style={[styles.statusDot, item.stock > 0 ? styles.statusDotActive : styles.statusDotSoldOut]} />
              </View>
            </View>
          );
        }}
      />

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Surplus Item</Text>
            <TouchableOpacity onPress={() => { setShowAddModal(false); setForm(EMPTY_FORM); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {[
              { key: 'productName', label: 'Item Name *', placeholder: 'e.g. Morning Pastry Pack' },
              { key: 'shortDescription', label: 'Description', placeholder: 'Brief description of the item' },
              { key: 'originalPrice', label: 'Original Price * ($)', placeholder: '10.00', keyboard: 'numeric' },
              { key: 'discountedPrice', label: 'Sale Price * ($)', placeholder: '3.99', keyboard: 'numeric' },
              { key: 'stock', label: 'Quantity Available *', placeholder: '5', keyboard: 'numeric' },
              { key: 'pickupStart', label: 'Pickup Start (YYYY-MM-DDTHH:MM)', placeholder: '2026-03-22T09:00' },
              { key: 'pickupEnd', label: 'Pickup End (YYYY-MM-DDTHH:MM)', placeholder: '2026-03-22T11:00' },
            ].map(({ key, label, placeholder, keyboard }) => (
              <View key={key}>
                <Text style={styles.formLabel}>{label}</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.muted}
                  value={form[key as keyof AddProductForm]}
                  onChangeText={(val) => setForm((f) => ({ ...f, [key]: val }))}
                  keyboardType={(keyboard as any) ?? 'default'}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabled]}
              onPress={handleAddProduct}
              disabled={submitting}
              activeOpacity={0.85}>
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Publish Listing</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerGreeting: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  headerName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  addButton: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  addButtonText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.charcoal },
  signOutIcon: { padding: 4 },
  signOutIconText: { fontSize: 20, color: 'rgba(255,255,255,0.7)' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.muted, textAlign: 'center' },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.charcoal },
  tabTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.charcoal },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.muted, textAlign: 'center' },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  listingLeft: { flex: 1, gap: 4 },
  listingName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.charcoal },
  listingDescription: { fontSize: FontSize.xs, color: Colors.muted },
  listingPriceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  listingSalePrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  listingOrigPrice: { fontSize: FontSize.xs, color: Colors.muted, textDecorationLine: 'line-through' },
  listingRight: { alignItems: 'flex-end', gap: Spacing.xs },
  stockBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockBadgeLow: { backgroundColor: '#FEE7EC' },
  stockText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.charcoal },
  stockTextLow: { color: Colors.error },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusDotActive: { backgroundColor: '#34D399' },
  statusDotSoldOut: { backgroundColor: Colors.muted },
  modalContainer: { flex: 1, backgroundColor: Colors.cream },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.charcoal },
  modalClose: { fontSize: 20, color: Colors.muted, padding: 4 },
  modalScroll: { padding: Spacing.lg, gap: Spacing.xs, paddingBottom: Spacing.xxl },
  formLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.charcoal, marginBottom: 4, marginTop: Spacing.sm },
  formInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabled: { opacity: 0.7 },
  submitButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});

export default BusinessDashboardScreen;
