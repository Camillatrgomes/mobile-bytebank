import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/contexts/AuthContext';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { User } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
}

export function Header({ title, showLogout = false }: HeaderProps) {
  const { user } = useAuthContext();

  return (
    <View style={styles.header}>
      {/* Logo */}
      <View style={styles.brand}>
        <Image source={require('@/assets/images/bblogo.png')} style={styles.logo} />
        <View>
          <Text style={styles.appName}>
            <Text style={{ fontWeight: '300' }}>byte</Text>
            <Text style={{ fontWeight: 'bold' }}>bank</Text>
          </Text>
          <Text style={styles.tagline}>PLANNER FINANCEIRO</Text>
        </View>
      </View>

      {/* User area */}
      {user && (
        <TouchableOpacity
          style={styles.userArea}
         onPress={() => router.push('/profile')}

          activeOpacity={0.7}
        >
          <View style={styles.avatarCircle}>
            <User size={16} color={Colors.white} />
          </View>
          <Text style={styles.userName} numberOfLines={1}>{user.username}</Text>
        </TouchableOpacity>
      )}

    </View>
  );
  
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.primary600,
    position: 'relative',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 18,
    color: Colors.white,
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  tagline: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    marginTop: 1,
  },
  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary300,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 160,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    flexShrink: 1,
  },
});
