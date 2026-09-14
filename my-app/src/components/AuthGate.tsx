import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isReady } = useAuthContext();

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!isAuthenticated && inAppGroup) {
      // @ts-ignore — Expo Router's typed routes don't support group paths as strings
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      // @ts-ignore — Expo Router's typed routes don't support group paths as strings
      router.replace('/(app)/home');
    }
  }, [isAuthenticated, segments, isReady, router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary600 }}>
        <ActivityIndicator color={Colors.white} size="large" />
      </View>
    );
  }

  return <Slot />;
}
