import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import type { AuthUser } from '@/domain/entities/User';
import type { AuthRepository } from '@/domain/repositories/AuthRepository';
import { auth } from '../firebase/client';

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

function toAuthUser(user: User): AuthUser {
  return { id: user.uid, username: user.displayName ?? '', email: user.email ?? '' };
}

export class FirebaseAuthRepository implements AuthRepository {
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return toAuthUser(user);
    } catch (err) {
      throw toAuthError(err);
    }
  }

  async signUp(username: string, email: string, password: string): Promise<AuthUser> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: username });
      return toAuthUser(user);
    } catch (err) {
      throw toAuthError(err);
    }
  }

  async signOut(): Promise<void> {
    if (auth.currentUser) await signOut(auth);
  }

  async updateUsername(username: string): Promise<void> {
    if (!auth.currentUser) throw new Error('Sessão expirada, entre novamente');
    await updateProfile(auth.currentUser, { displayName: username });
  }

  onAuthChanged(listener: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => listener(user && toAuthUser(user)));
  }
}
