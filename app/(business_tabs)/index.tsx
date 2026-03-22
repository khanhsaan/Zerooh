import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useProducts } from '../../hooks/useProducts';
import { useProfile } from '../../hooks/useProfile';
import useAuth from '../../hooks/useAuth';
import { useAsyncWithTimeout } from '../../hooks/useAsyncWithTimeout';
import { Product } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

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
 * Matches the BusinessDashboard mockup exactly:
 * - Header: zeroooh! logo + Add button (lime)
 * - Business name + subtitle below header
 * - Tabs: "Today" / "Listings" pill container (lime active tab)
 * - Today tab: orange revenue card, 2-col stats grid (items sold, food saved)
 * - Listings tab: darkGray listing cards with lime price, active/sold-out badge
 * - Add product modal
 */
export default function BusinessDashboardScreen() {
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
      Alert.alert('Listed!', `${form.productName} is now live.`);
    }
  }, [createProduct, form, fetchProducts]);

  if (loading && !products) return <LoadingScreen message="Loading your dashboard…" />;

  const listings = products ?? [];
  const totalStock = listings.reduce((s, p) => s + p.stock, 0);
  const itemsSold = listings.reduce((s, p) => s + Math.max(0, 10 - p.stock), 0);
  const revenueCents = listings.reduce((s, p) => s + p.discounted_price_cents * Math.max(0, 10 - p.stock), 0);
  const todayListings = listings.filter((p) => {
    const d = new Date(p.created_at ?? '');
    return d.toDateString() === new Date().toDateString();
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.logoText}>zeroooh!</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={16} color={Colors.black} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Info */}
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{businessName || 'Your Business'}</Text>
          <Text style={styles.businessSubtitle}>Business Partner Dashboard</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('today')}
            style={[styles.tab, activeTab === 'today' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('listings')}
            style={[styles.tab, activeTab === 'listings' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>Listings</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'today' ? (
          <View style={styles.section}>
            {/* Revenue Card */}
            <View style={styles.revenueCard}>
              <View style={styles.revenueIconContainer}>
                <Ionicons name="cash-outline" size={28} color={Colors.white} />
              </View>
              <Ionicons
                name="trending-up-outline"
                size={20}
                color={Colors.w60}
                style={{ position: 'absolute', top: 24, right: 24 }}
              />
              <Text style={styles.revenueLabel}>Revenue Today</Text>
              <Text style={styles.revenueValue}>${(revenueCents / 100).toFixed(2)}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="cube-outline" size={24} color={Colors.lime} />
                </View>
                <Text style={styles.statLabel}>Items Sold</Text>
                <Text style={styles.statValue}>{itemsSold}</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.statIconGreen]}>
                  <Ionicons name="leaf-outline" size={24} color={Colors.lime} />
                </View>
                <Text style={styles.statLabel}>Food Saved</Text>
                <Text style={[styles.statValue, { color: Colors.lime }]}>{(totalStock * 0.4).toFixed(1)}kg</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            {listings.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>No listings yet</Text>
                <Text style={styles.emptySubtitle}>Tap "Add" to list your first surplus item.</Text>
              </View>
            )}
            {listings.map((item) => {
              const salePrice = (item.discounted_price_cents / 100).toFixed(2);
              const origPrice = (item.original_price_cents / 100).toFixed(2);
              const isActive = item.stock > 0;
              return (
                <View key={item.id} style={styles.listingCard}>
                  <View style={styles.listingHeader}>
                    <Text style={styles.listingName}>{item.product_name}</Text>
                    <View style={[styles.listingStatus, isActive && styles.listingStatusActive]}>
                      <Text style={[styles.listingStatusText, isActive && styles.listingStatusTextActive]}>
                        {isActive ? 'Active' : 'Sold Out'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.listingFooter}>
                    <View style={styles.listingPriceContainer}>
                      <Text style={styles.listingPrice}>${salePrice}</Text>
                      <Text style={styles.listingOriginalPrice}>${origPrice}</Text>
                    </View>
                    <View style={styles.listingActions}>
                      <View style={styles.listingAvailable}>
                        <Text style={styles.listingAvailableText}>{item.stock} left</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.7}>
          {signingOut ? (
            <ActivityIndicator color={Colors.orange} size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={Colors.orange} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Surplus Item</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setForm(EMPTY_FORM);
              }}>
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
                  placeholderTextColor={Colors.w30}
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
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.submitButtonText}>PUBLISH LISTING</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  logoText: { color: Colors.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lime,
    borderRadius: 9999,
  },
  addButtonText: { fontSize: 14, fontWeight: '700', color: Colors.black },
  businessInfo: { paddingHorizontal: 20, marginBottom: 24 },
  businessName: { color: Colors.white, fontSize: 28, fontWeight: '900', marginBottom: 4 },
  businessSubtitle: { color: Colors.w60, fontSize: 14, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: Colors.w10,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.lime },
  tabText: {
    color: Colors.w60,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tabTextActive: { color: Colors.black },
  section: { paddingHorizontal: 20, gap: 16 },
  revenueCard: {
    backgroundColor: Colors.orange,
    borderRadius: 22,
    padding: 24,
    position: 'relative',
  },
  revenueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.w20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  revenueLabel: {
    color: Colors.w80,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  revenueValue: { color: Colors.white, fontSize: 48, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 20,
    padding: 20,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lime20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconGreen: {
    backgroundColor: Colors.deepGreen,
    borderWidth: 1,
    borderColor: Colors.lime30,
  },
  statLabel: {
    color: Colors.w60,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: { color: Colors.white, fontSize: 40, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  emptySubtitle: { fontSize: 15, color: Colors.w60, textAlign: 'center' },
  listingCard: {
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 20,
    padding: 20,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  listingName: { flex: 1, color: Colors.white, fontSize: 18, fontWeight: '900' },
  listingStatus: {
    backgroundColor: Colors.w10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  listingStatusActive: { backgroundColor: Colors.lime },
  listingStatusText: {
    color: Colors.w60,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  listingStatusTextActive: { color: Colors.black },
  listingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listingPriceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  listingPrice: { color: Colors.lime, fontSize: 28, fontWeight: '900' },
  listingOriginalPrice: {
    color: Colors.w30,
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  listingActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listingAvailable: {
    backgroundColor: Colors.w10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  listingAvailableText: { color: Colors.white, fontSize: 14, fontWeight: '900' },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.orange30,
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: Colors.orange },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: Colors.black },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.w10,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  modalClose: { fontSize: 20, color: Colors.w40, padding: 4 },
  modalScroll: { padding: 24, gap: 8, paddingBottom: 48 },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.w10,
  },
  submitButton: {
    backgroundColor: Colors.lime,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  disabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 15, fontWeight: '800', color: Colors.black, letterSpacing: 0.5 },
});
