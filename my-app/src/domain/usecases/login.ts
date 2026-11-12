import type { AuthUser } from '../entities/User';
import type { AccountRepository } from '../repositories/AccountRepository';
import type { AuthRepository } from '../repositories/AuthRepository';

export interface AuthDeps {
  auth: AuthRepository;
  accounts: AccountRepository;
}

/** Roda a ação e, se falhar, encerra a sessão que ela possa ter aberto. */
export async function orSignOut<T>(auth: AuthRepository, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (err) {
    await auth.signOut().catch(() => {});
    throw err;
  }
}

export function login({ auth, accounts }: AuthDeps) {
  return (email: string, password: string): Promise<AuthUser> =>
    orSignOut(auth, async () => {
      const user = await auth.signIn(email, password);
      // Idempotente: recria conta e cartão se o cadastro falhou depois de criar o usuário no Auth.
      await accounts.provision(user.username || null);
      return user;
    });
}
