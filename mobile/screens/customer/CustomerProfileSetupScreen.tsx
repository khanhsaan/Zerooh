import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useProfile } from '../../hooks/useProfile';

const CustomerProfileSetupScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const profileResponse = useProfile();
  const setupProfile = profileResponse.data?.setUpCustomerProfile;

  const handleSave = async () => {
    if (!setupProfile) return;
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Required', 'Please enter your first and last name.');
      return;
    }
    setLoading(true);
    const result = await setupProfile({ firstName: firstName.trim(), lastName: lastName.trim() }, false, '');
    setLoading(false);
    if (result.error) {
      Alert.alert('Error', result.error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cream} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>Help us personalise your experience.</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} placeholder="Jane" placeholderTextColor={Colors.muted} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} placeholder="Smith" placeholderTextColor={Colors.muted} value={lastName} onChangeText={setLastName} />

        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Let's Go!</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.charcoal, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, textAlign: 'center', marginBottom: Spacing.xl },
  label: { alignSelf: 'flex-start', fontSize: FontSize.sm, fontWeight: '600', color: Colors.charcoal, marginBottom: 4, marginTop: Spacing.sm },
  input: { width: '100%', backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.charcoal, borderWidth: 1.5, borderColor: Colors.border },
  button: { width: '100%', backgroundColor: Colors.orange, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md + 2, alignItems: 'center', marginTop: Spacing.xl },
  disabled: { opacity: 0.7 },
  buttonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});

export default CustomerProfileSetupScreen;
