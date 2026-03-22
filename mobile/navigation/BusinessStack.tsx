import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import BusinessProfileSetupScreen from '../screens/business/BusinessProfileSetupScreen';

export type BusinessStackParamList = {
  BusinessDashboard: undefined;
  BusinessProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<BusinessStackParamList>();

const BusinessStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BusinessDashboard" component={BusinessDashboardScreen} />
    <Stack.Screen name="BusinessProfileSetup" component={BusinessProfileSetupScreen} />
  </Stack.Navigator>
);

export default BusinessStack;
