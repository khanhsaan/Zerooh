import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

/** BusinessDashboardScreen — stub, full implementation in Sprint 3 */
const BusinessDashboardScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Business Dashboard</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: Colors.charcoal, fontWeight: '700' },
});

export default BusinessDashboardScreen;
