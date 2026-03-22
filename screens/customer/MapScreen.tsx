import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

/** MapScreen — stub, full implementation in Sprint 2 */
const MapScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Explore</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: Colors.charcoal, fontWeight: '700' },
});

export default MapScreen;
