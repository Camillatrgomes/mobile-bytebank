import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import type { RootState } from '@/store';

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
}

export function Header({ title, showLogout = false }: HeaderProps) {
  const user = useSelector((s: RootState) => s.auth.user);
  const { logout } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <View>
          <Text style={styles.appName}>ByteBank</Text>
          {user && (
            <Text style={styles.userName}>Olá, {user.username}!</Text>
          )}
        </View>
      </View>
      {showLogout && (
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.primary600,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary600,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    lineHeight: 22,
  },
  userName: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  logoutBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoutText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
