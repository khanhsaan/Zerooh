import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import useAuthContext from '../hooks/useAuthContext';
import AuthStack from './AuthStack';
import CustomerTabs from './CustomerTabs';
import BusinessStack from './BusinessStack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const AppNavigator: React.FC = () => {
  const { data } = useAuthContext();
  const session = data?.authSession ?? null;
  const loading = data?.authLoading ?? true;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isBusiness = session?.user?.user_metadata?.isBusiness === true;

  return (
    <NavigationContainer>
      {!session ? (
        <AuthStack />
      ) : isBusiness ? (
        <BusinessStack />
      ) : (
        <CustomerTabs />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cream,
  },
});

export default AppNavigator;
