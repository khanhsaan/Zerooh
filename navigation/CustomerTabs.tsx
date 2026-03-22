import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

import HomeScreen from '../screens/customer/HomeScreen';
import MapScreen from '../screens/customer/MapScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import CustomerProfileSetupScreen from '../screens/customer/CustomerProfileSetupScreen';

export type CustomerTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  CustomerProfileSetup: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '⌂',
    Explore: '◎',
    Cart: '⊠',
    Orders: '☰',
    Profile: '◯',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.iconText, focused && styles.iconFocused]}>{icons[name]}</Text>
    </View>
  );
};

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <HomeStack.Screen name="CustomerProfileSetup" component={CustomerProfileSetupScreen} />
  </HomeStack.Navigator>
);

const CustomerTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: Colors.lime,
      tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
      tabBarLabelStyle: styles.tabLabel,
    }}>
    <Tab.Screen
      name="HomeTab"
      component={HomeStackNavigator}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="ExploreTab"
      component={MapScreen}
      options={{
        tabBarLabel: 'Explore',
        tabBarIcon: ({ focused }) => <TabIcon name="Explore" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="CartTab"
      component={CartScreen}
      options={{
        tabBarLabel: 'Cart',
        tabBarIcon: ({ focused }) => <TabIcon name="Cart" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="OrdersTab"
      component={OrdersScreen}
      options={{
        tabBarLabel: 'Orders',
        tabBarIcon: ({ focused }) => <TabIcon name="Orders" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.primary,
    borderTopWidth: 0,
    paddingTop: 6,
    paddingBottom: 4,
    height: 64,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.45)',
  },
  iconFocused: {
    color: Colors.lime,
  },
});

export default CustomerTabs;
