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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import useAuth from '../../hooks/useAuth';

/**
 * SignUpScreen
 *
 * Account creation screen for both customers and business partners.
 * Reads `isBusiness` from Expo Router search params (string 'true'/'false').
 * Calls `useAuth.signUpHandle` with `userMetadata: { isBusiness }`.
 * On success, AuthContext session change automatically redirects.
 */
export default function SignUpScreen() {
  const router = useRouter();
  const { isBusiness: isBusinessParam } = useLocalSearchParams<{ isBusiness: string }>();
  const isBusiness = isBusinessParam === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const authResponse = useAuth();
  const signUp = authResponse.data?.signUpHandle;

  const handleSignUp = async () => {
    if (!signUp) return;
    setLoading(true);
    const result = await signUp({
      userEmail: email,
      userPassword: password,
      userConfirmPassword: confirmPassword,
      userMetadata: { isBusiness },
    });
    setLoading(false);
    if (result.error) {
      Alert.alert('Sign Up Failed', result.error.message);
    }
    // On success, AuthContext handles navigation
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cream} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            {isBusiness ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🏪 Business</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeCustomer]}>
                <Text style={styles.badgeText}>🛍️ Customer</Text>
              </View>
            )}
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              {isBusiness
                ? 'Start selling your surplus food and recover revenue.'
                : 'Discover great food deals and reduce waste together.'}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
              placeholderTextColor={Colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor={Colors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.disabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.loginLinkAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  back: { marginBottom: Spacing.lg },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  header: { marginBottom: Spacing.xl },
  badge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  badgeCustomer: { backgroundColor: Colors.orange },
  badgeText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.charcoal },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.charcoal, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, lineHeight: 22 },
  form: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.charcoal, marginBottom: 2, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  signupButton: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabled: { opacity: 0.7 },
  signupButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.md },
  loginLinkText: { fontSize: FontSize.md, color: Colors.charcoal },
  loginLinkAccent: { color: Colors.primary, fontWeight: '700' },
});
