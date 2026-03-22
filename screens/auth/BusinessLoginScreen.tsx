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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import useAuth from '../../hooks/useAuth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'BusinessLogin'>;
};

const BusinessLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
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

          {/* Stats bar */}
          <View style={styles.statsBar}>
            {[{ label: 'Meals Rescued', value: '2.4M+' }, { label: 'Partners', value: '1,200+' }, { label: 'CO₂ Saved', value: '480t' }].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput
              style={styles.input}
              placeholder="business@example.com"
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('SignUp', { isBusiness: true })}>
              <Text style={styles.signupText}>
                New partner? <Text style={styles.signupAccent}>Register here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },
  topBar: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  backText: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  businessBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  businessBadgeText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.charcoal },
  title: { fontSize: FontSize.xxl + 4, fontWeight: '900', color: Colors.white, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.lime },
  statLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  formCard: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    flex: 1,
    gap: Spacing.xs,
  },
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
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  signupButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  signupText: { fontSize: FontSize.md, color: Colors.charcoal },
  signupAccent: { color: Colors.primary, fontWeight: '700' },
});

export default BusinessLoginScreen;
