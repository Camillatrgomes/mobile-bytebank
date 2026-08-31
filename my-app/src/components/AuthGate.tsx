import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { storage } from '@/lib/storage';
import { setCredentials } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { Colors } from '@/constants/theme';

/**
 * AuthGate: Restores session from SecureStore on startup,
 * then guards routes based on authentication state.
 */
export function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await storage.getToken();
        const user = await storage.getUser();
        if (token && user) {
          dispatch(setCredentials(user));
        }
      } finally {
        setIsReady(true);
      }
    }
    restoreSession();
  }, [dispatch]);

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
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary600 }}>
        <ActivityIndicator color={Colors.white} size="large" />
      </View>
    );
  }

  return <Slot />;
}
