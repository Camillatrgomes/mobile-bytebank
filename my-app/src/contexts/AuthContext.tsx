import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** O Firebase já informou se existe sessão salva. */
  isReady: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function toAuthUser(user: User): AuthUser {
  return { id: user.uid, username: user.displayName ?? '', email: user.email ?? '' };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isInitialState = true;

    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
      } else if (isInitialState) {
        // Logins feitos no app só entram no contexto depois do provisionamento, em useAuth.
        setUser(toAuthUser(firebaseUser));
      }
      isInitialState = false;
      setIsReady(true);
    });
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, isReady, setUser }),
    [user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}
