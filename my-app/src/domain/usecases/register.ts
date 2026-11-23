import type { AuthUser } from '../entities/User';
import { orSignOut, type AuthDeps } from './login';

export function register({ auth, accounts }: AuthDeps) {
  return (username: string, email: string, password: string): Promise<AuthUser> =>
    orSignOut(auth, async () => {
      const user = await auth.signUp(username, email, password);
      await accounts.provision(username);
      return { ...user, username };
    });
}
