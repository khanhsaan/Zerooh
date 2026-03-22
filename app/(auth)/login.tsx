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
 * LoginScreen
 *
 * Customer sign-in screen. Dark theme (#1a1a1a). Accepts email and password,
 * calls `useAuth.signInHandle`. On success, AuthContext session change
 * automatically redirects via the root index. On failure, shows an Alert.
 */
export default function LoginScreen() {
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
    // On success, AuthContext session change triggers navigation automatically
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>Sign in to discover food deals near you.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => router.push({ pathname: '/(auth)/sign-up', params: { isBusiness: 'false' } })}>
              <Text style={styles.signupText}>
                New here? <Text style={styles.signupAccent}>Create an account</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  back: { marginBottom: Spacing.lg },
  backText: { fontSize: FontSize.md, color: Colors.lime, fontWeight: '600' },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, lineHeight: 22 },
  form: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.white, marginBottom: 2, marginTop: Spacing.xs },
  input: {
    backgroundColor: Colors.darkCard,
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
    backgroundColor: Colors.darkCard,
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.muted },
  signupButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  signupText: { fontSize: FontSize.md, color: Colors.muted },
  signupAccent: { color: Colors.lime, fontWeight: '700' },
});
