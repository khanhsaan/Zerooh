import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import useAuth from '../../hooks/useAuth';

/**
 * BusinessLoginScreen
 *
 * Business partner sign-in screen. Dark theme (#1a1a1a). Accepts email and password,
 * calls `useAuth.signInHandle`. On success, AuthContext session change
 * automatically redirects via the root index. Navigates to sign-up
 * with isBusiness=true param for new partners.
 */
export default function BusinessLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const authResponse = useAuth();
  const signIn = authResponse.data?.signInHandle;

  const handleLogin = async () => {
    if (!signIn) return;
    setLoading(true);
    const result = await signIn({ userEmail: email, userPassword: password });
    setLoading(false);
    if (result.error) {
      Alert.alert('Login Failed', result.error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.businessBadge}>
              <Text style={styles.businessBadgeText}>🏪 Business Partner</Text>
            </View>
            <Text style={styles.title}>Business Sign In</Text>
            <Text style={styles.subtitle}>
              Manage your surplus listings and reduce food waste.
            </Text>
          </View>

          <View style={styles.statsBar}>
            {[
              { label: 'Meals Rescued', value: '2.4M+' },
              { label: 'Partners', value: '1,200+' },
              { label: 'CO₂ Saved', value: '480t' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput
              style={styles.input}
              placeholder="business@example.com"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputInner}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((v) => !v)}
                activeOpacity={0.7}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={Colors.dark} />
              ) : (
                <Text style={styles.loginButtonText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => router.push({ pathname: '/(auth)/sign-up', params: { isBusiness: 'true' } })}>
              <Text style={styles.signupText}>
                New partner? <Text style={styles.signupAccent}>Register here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  scroll: { flexGrow: 1 },
  topBar: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  backText: { fontSize: FontSize.md, color: Colors.lime, fontWeight: '600' },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  businessBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  businessBadgeText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.dark },
  title: { fontSize: FontSize.xxl + 4, fontWeight: '900', color: Colors.white, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, lineHeight: 22 },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.lime },
  statLabel: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  formCard: {
    backgroundColor: Colors.darkCard,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    flex: 1,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.white, marginBottom: 2, marginTop: Spacing.sm },
  input: {
    backgroundColor: '#333333',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  eyeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  loginButton: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, letterSpacing: 0.5 },
  signupButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  signupText: { fontSize: FontSize.md, color: Colors.muted },
  signupAccent: { color: Colors.lime, fontWeight: '700' },
});
