import { Tabs } from 'expo-router';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { Colors, FontSize } from '@/constants/theme';
import { Home, ArrowRightLeft, TrendingUp, UserCircle } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <TransactionsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary600,
          tabBarInactiveTintColor: Colors.gray400,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopColor: Colors.gray200,
            borderTopWidth: 1,
            height: 68,
            paddingBottom: 6,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 12,
          },
          tabBarLabelStyle: {
            fontSize: FontSize.xs,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Extrato',
            tabBarIcon: ({ color, size }) => <ArrowRightLeft color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="investments"
          options={{
            title: 'Investimentos',
            tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} />,
          }}
        />
      </Tabs>
    </TransactionsProvider>
  );
}
