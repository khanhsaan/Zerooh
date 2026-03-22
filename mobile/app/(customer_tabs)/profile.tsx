import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useProfile } from '../../hooks/useProfile';
import useAuth from '../../hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

/**
 * ProfileScreen
 *
 * Matches the Profile mockup exactly:
 * - UPPERCASE "Account" header, then left-aligned profileRow (80px lime avatar + name/email)
 * - deepGreen impact card with 3-col stats grid (orders, saved, CO₂)
 * - darkGray menu items with lime icon containers (44×44)
 * - Orange-styled sign out row (orange text, orangeOpacity20 icon bg, orange30 border)
 */
const ProfileScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const profileHook = useProfile();
  const authHook = useAuth();

  const getUserFirstName = profileHook.data?.getUserFirstName;
  const getUserEmail = profileHook.data?.getUserEmail;
  const signOut = authHook.data?.signOutHandle;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (getUserFirstName) {
        const r = await getUserFirstName();
        if (!r.error) setFirstName(r.data ?? '');
      }
      if (getUserEmail) {
        const r = await getUserEmail();
        if (!r.error) setEmail(r.data ?? '');
      }
      setLoading(false);
    };
    load();
  }, [getUserFirstName, getUserEmail]);

  const handleSignOut = async () => {
    if (!signOut) return;
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          const result = await signOut();
          setSigningOut(false);
          if (result.error) displayError(result.error.message, result.error.isFatal);
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen message="Loading profile…" />;

  const initials = firstName
    ? firstName
        .trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const menuItems = [
    { icon: 'settings-outline' as const, label: 'Settings' },
    { icon: 'time-outline' as const, label: 'Order History' },
    { icon: 'heart-outline' as const, label: 'Favourites' },
    { icon: 'help-circle-outline' as const, label: 'Help' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.name}>{firstName || 'Food Rescuer'}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {/* Impact Card */}
          <View style={styles.impactCard}>
            <Text style={styles.impactLabel}>🌍 Your Impact</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.orange }]}>$0</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.lime }]}>0kg</Text>
                <Text style={styles.statLabel}>CO₂</Text>
              </View>
            </View>

            <View style={styles.impactMessage}>
              <Text style={styles.impactMessageText}>
                🎉 Start ordering to track your food rescue impact!
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={20} color={Colors.black} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}

            {/* Sign Out */}
            <TouchableOpacity
              style={styles.menuItemLogout}
              onPress={handleSignOut}
              disabled={signingOut}
              activeOpacity={0.7}>
              <View style={styles.menuIconContainerLogout}>
                {signingOut ? (
                  <ActivityIndicator color={Colors.orange} size="small" />
                ) : (
                  <Ionicons name="log-out-outline" size={20} color={Colors.orange} />
                )}
              </View>
              <Text style={styles.menuLabelLogout}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 32 },
  headerTitle: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.black, fontSize: 30, fontWeight: '900' },
  name: { color: Colors.white, fontSize: 22, fontWeight: '900', marginBottom: 2 },
  email: { color: Colors.w60, fontSize: 15, fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  impactCard: {
    backgroundColor: Colors.deepGreen,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.lime20,
  },
  impactLabel: {
    color: Colors.lime,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { color: Colors.white, fontSize: 32, fontWeight: '900' },
  statLabel: { color: Colors.w70, fontSize: 13, fontWeight: '700' },
  impactMessage: {
    backgroundColor: Colors.w10,
    borderRadius: 14,
    padding: 12,
  },
  impactMessageText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  menuItems: { gap: 8 },
  menuItem: {
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.w10,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, color: Colors.white, fontSize: 16, fontWeight: '700' },
  menuArrow: { color: Colors.w30, fontSize: 24 },
  menuItemLogout: {
    backgroundColor: Colors.darkGray,
    borderWidth: 1,
    borderColor: Colors.orange30,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  menuIconContainerLogout: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.orange20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabelLogout: { flex: 1, color: Colors.orange, fontSize: 16, fontWeight: '700' },
});

export default ProfileScreen;
