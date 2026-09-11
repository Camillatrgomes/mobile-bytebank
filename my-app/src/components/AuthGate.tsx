import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toAuthUser } from '@/hooks/useAuth';
import { logout, setCredentials } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { Colors } from '@/constants/theme';

export function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isInitialState = true;

    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(logout());
      } else if (isInitialState) {
        // Logins feitos no app só entram no Redux depois do provisionamento, em useAuth.
        dispatch(setCredentials(toAuthUser(firebaseUser)));
      }
      isInitialState = false;
      setIsReady(true);
    });
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
