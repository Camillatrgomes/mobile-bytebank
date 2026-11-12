import React, { useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/infra/firebase/client';
import { useAppStore } from '@/stores';
import type { AuthUser } from '@/stores/authSlice';

export function toAuthUser(user: User): AuthUser {
  return { id: user.uid, username: user.displayName ?? '', email: user.email ?? '' };
}

/** Liga o listener do Firebase Auth ao authSlice; o estado em si vive na store. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let isInitialState = true;

    return onAuthStateChanged(auth, (firebaseUser) => {
      const { setUser, markAuthReady } = useAppStore.getState();
      if (!firebaseUser) {
        setUser(null);
      } else if (isInitialState) {
        // Logins feitos no app só entram na store depois do provisionamento, em useAuth.
        setUser(toAuthUser(firebaseUser));
      }
      isInitialState = false;
      markAuthReady();
    });
  }, []);

  return children;
}
