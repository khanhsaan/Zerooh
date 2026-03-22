import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useProfile } from '../../hooks/useProfile';

/**
 * BusinessProfileSetupScreen
 *
 * Onboarding screen for new business users. Collects:
 * - Business name
 * - Phone number
 * - Street address, suburb, postcode
 *
 * Calls `useProfile.setUpBusinessProfile` to write to the `business_profiles` table.
 * On success, navigates to the BusinessDashboard via `router.replace`.
 * Validation ensures all required fields are non-empty before submission.
 */
export default function BusinessProfileSetupScreen() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);

  const profileHook = useProfile();
  const setUpBusiness = profileHook.data?.setUpBusinessProfile;

  const handleSave = async () => {
    if (!setUpBusiness) return;
    if (!businessName.trim() || !phone.trim() || !address.trim() || !suburb.trim() || !postcode.trim()) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    const result = await setUpBusiness({
      businessName: businessName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      suburb: suburb.trim(),
      postcode: postcode.trim(),
    });
    setLoading(false);
    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else {
      router.replace('/(business_tabs)/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cream} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.topBadge}>
            <Text style={styles.badgeText}>🏪 Business Setup</Text>
          </View>

          <Text style={styles.title}>Tell us about{'\n'}your business</Text>
          <Text style={styles.subtitle}>
            This helps customers find you and know what to expect.
          </Text>

          {[
            { label: 'Business Name *', value: businessName, setter: setBusinessName, placeholder: 'Daily Crumb Bakery' },
            { label: 'Phone Number *', value: phone, setter: setPhone, placeholder: '+61 4XX XXX XXX', keyboard: 'phone-pad' },
            { label: 'Street Address *', value: address, setter: setAddress, placeholder: '123 Crown Street' },
            { label: 'Suburb *', value: suburb, setter: setSuburb, placeholder: 'Wollongong' },
            { label: 'Postcode *', value: postcode, setter: setPostcode, placeholder: '2500', keyboard: 'numeric' },
          ].map(({ label, value, setter, placeholder, keyboard }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.muted}
                value={value}
                onChangeText={setter}
                keyboardType={(keyboard as any) ?? 'default'}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            You can update these details at any time from your business profile.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xs },
  topBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  badgeText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.charcoal },
  title: { fontSize: FontSize.xxl + 2, fontWeight: '900', color: Colors.charcoal, lineHeight: 36, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, lineHeight: 22, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.charcoal, marginBottom: 4, marginTop: Spacing.sm },
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
  saveButton: {
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
  saveButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  note: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.muted, marginTop: Spacing.md },
});
