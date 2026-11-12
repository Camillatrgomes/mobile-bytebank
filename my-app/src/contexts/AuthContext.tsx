import React, { useEffect } from 'react';
import { container } from '@/infra/container';
import { useAppStore } from '@/stores';

/** Liga o listener de autenticação ao authSlice; o estado em si vive na store. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let isInitialState = true;

    return container.onAuthChanged((user) => {
      const { setUser, markAuthReady } = useAppStore.getState();
      if (!user) {
        setUser(null);
      } else if (isInitialState) {
        // Logins feitos no app só entram na store depois do provisionamento, em useAuth.
        setUser(user);
      }
      isInitialState = false;
      markAuthReady();
    });
  }, []);

  return children;
}
