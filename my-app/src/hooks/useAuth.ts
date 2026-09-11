import { useDispatch, useSelector } from 'react-redux';
import { mutate } from 'swr';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiFetch } from '@/lib/api';
import { setCredentials } from '@/store/authSlice';
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

// Sem proteção contra enumeração de e-mail (ex.: emulador), o Auth devolve wrong-password/user-not-found.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha deve ter ao menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet e tente novamente.',
};

function toAuthError(err: unknown): Error {
  if (err instanceof FirebaseError) {
    return new Error(AUTH_ERROR_MESSAGES[err.code] ?? 'Não foi possível autenticar. Tente novamente.');
  }
  return err instanceof Error ? err : new Error('Não foi possível autenticar. Tente novamente.');
}

async function signOutAndThrow(err: unknown): Promise<never> {
  if (auth.currentUser) await signOut(auth);
  throw toAuthError(err);
}

export function toAuthUser(user: User) {
  return { id: user.uid, username: user.displayName ?? '', email: user.email ?? '' };
}

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  async function login({ email, password }: LoginPayload): Promise<void> {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      // Idempotente: recria conta e cartão se o cadastro falhou depois de criar o usuário no Auth.
      await apiFetch('/user', { method: 'POST', body: { username: firebaseUser.displayName } });
      dispatch(setCredentials(toAuthUser(firebaseUser)));
    } catch (err) {
      await signOutAndThrow(err);
    }
  }

  async function register({ username, email, password }: RegisterPayload): Promise<void> {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName: username });
      await apiFetch('/user', { method: 'POST', body: { username } });
      dispatch(setCredentials({ ...toAuthUser(firebaseUser), username }));
    } catch (err) {
      await signOutAndThrow(err);
    }
  }

  async function logout(): Promise<void> {
    await signOut(auth);
    // Limpa o cache do SWR para o próximo usuário não ver os dados do anterior.
    await mutate(() => true, undefined, { revalidate: false });
  }

  return { user, isAuthenticated, login, register, logout };
}
