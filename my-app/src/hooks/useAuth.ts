import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { storage } from '@/lib/storage';
import { setCredentials, logout as logoutAction } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  result: {
    token: string;
  };
}

function decodeJwtPayload(token: string): { id: string; username: string; email: string } | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((s: RootState) => s.auth.user);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  async function login(payload: LoginPayload): Promise<void> {
    const res = await apiFetch<AuthResponse>('/user/auth', {
      method: 'POST',
      body: payload,
      token: null,
    });

    const token = res.result?.token;
    if (!token) throw new Error('Token não retornado pelo servidor');

    await storage.setToken(token);

    const userData = decodeJwtPayload(token);
    if (!userData) throw new Error('Token inválido');

    await storage.setUser(userData);
    dispatch(setCredentials(userData));
    // @ts-ignore
    router.replace('/(app)/home');
  }

  async function register(payload: RegisterPayload): Promise<void> {
    // Create user — backend also auto-creates Account + Card
    await apiFetch('/user', {
      method: 'POST',
      body: payload,
      token: null,
    });

    // Auto-login after registration
    await login({ email: payload.email, password: payload.password });
  }

  async function logout(): Promise<void> {
    await storage.clear();
    dispatch(logoutAction());
    // @ts-ignore
    router.replace('/(auth)');
  }

  return { user, isAuthenticated, login, register, logout };
}
