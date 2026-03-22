import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useProfile } from '../../hooks/useProfile';
import useAuth from '../../hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';
import { displayError } from '../../utilities/handleError';

/**
 * ProfileScreen
 *
 * Dark theme (#1a1a1a bg, #2a2a2a cards). Customer account screen displaying:
 * - Lime avatar initials badge (generated from first name)
 * - First name, email address
 * - Green gradient impact stats card (meals rescued, CO₂ saved, total saved)
 * - Dark menu items with lime icon backgrounds
 * - Sign out button (orange styling)
 *
 * Uses `useProfile` to fetch name/email and `useAuth.signOutHandle` to log out.
 * Errors surface via Alert using `displayError`.
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
          // Auth state change triggers navigation automatically
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen message="Loading profile…" />;

  const initials = firstName ? firstName[0].toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{firstName || 'Food Rescuer'}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>🌿 Eco Member</Text>
          </View>
        </View>

        {/* Impact stats — green gradient card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Impact</Text>
          <View style={styles.statsRow}>
            {[
              { emoji: '🍱', value: '0', label: 'Meals rescued' },
              { emoji: '💨', value: '0g', label: 'CO₂ saved' },
              { emoji: '💰', value: '$0', label: 'Total saved' },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {[
            { icon: '👤', label: 'Edit Profile' },
            { icon: '🔔', label: 'Notifications' },
            { icon: '📍', label: 'Saved Addresses' },
            { icon: '❓', label: 'Help & Support' },
            { icon: 'ℹ️', label: 'About Zeroooh!' },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i < arr.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}>
              <View style={styles.menuIconBadge}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutButton, signingOut && styles.disabled]}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.85}>
          {signingOut ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>Zeroooh! v1.0.0 · Save food, save the planet</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  scroll: { paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl, paddingTop: Spacing.xxl },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarText: { fontSize: FontSize.huge, fontWeight: '900', color: Colors.dark },
  name: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  email: { fontSize: FontSize.md, color: Colors.muted, marginBottom: Spacing.sm },
  memberBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  memberBadgeText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
  statsCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statsTitle: { fontSize: FontSize.md, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.lime },
  statLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
  menuSection: {
    backgroundColor: Colors.darkCard,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(217,224,33,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.white, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: Colors.muted },
  signOutButton: {
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
    marginBottom: Spacing.md,
  },
  disabled: { opacity: 0.7 },
  signOutText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.orange },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.muted },
});

export default ProfileScreen;
