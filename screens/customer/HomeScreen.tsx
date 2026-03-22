import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

/** HomeScreen — stub, full implementation in Sprint 2 */
const HomeScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Home</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: Colors.charcoal, fontWeight: '700' },
});

export default HomeScreen;
