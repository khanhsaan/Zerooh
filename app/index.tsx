import { Redirect } from 'expo-router';
import useAuthContext from '../hooks/useAuthContext';
import { View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * Index
 *
 * Entry redirect screen. Reads the auth session from AuthContext and routes:
 * - Not authenticated → /(auth)/splash
 * - Authenticated as customer → /(customer_tabs)/
 * - Authenticated as business → /(business_tabs)/
 *
 * Shows a minimal loading state while the auth context resolves.
 */
export default function Index() {
  const { data } = useAuthContext();
  const session = data?.authSession ?? null;
  const loading = data?.authLoading ?? true;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream }}>
        <Text style={{ fontSize: 32 }}>🌿</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/splash" />;
  }

  const isBusiness = session.user?.user_metadata?.isBusiness === true;
  return <Redirect href={isBusiness ? '/(business_tabs)/' : '/(customer_tabs)/'} />;
}
