import type { AuthUser } from '../entities/User';

/** Falhas chegam como Error com a mensagem final em pt-BR. */
export interface AuthRepository {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(username: string, email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  updateUsername(username: string): Promise<void>;
  onAuthChanged(listener: (user: AuthUser | null) => void): () => void;
}
