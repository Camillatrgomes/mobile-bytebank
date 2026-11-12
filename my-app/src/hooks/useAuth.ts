import { mutate } from 'swr';
import { container } from '@/infra/container';
import { resetAll, useAppStore } from '@/stores';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export function useAuth() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const isAuthenticated = user !== null;

  async function login({ email, password }: LoginPayload): Promise<void> {
    setUser(await container.login(email, password));
  }

  async function register({ username, email, password }: RegisterPayload): Promise<void> {
    setUser(await container.register(username, email, password));
  }

  async function updateUsername(username: string): Promise<void> {
    if (!user) throw new Error('Sessão expirada, entre novamente');
    await container.updateUsername(username);
    setUser({ ...user, username });
  }

  async function logout(): Promise<void> {
    try {
      await container.logout();
    } finally {
      resetAll();
      // Limpa o cache do SWR para o próximo usuário não ver os dados do anterior.
      await mutate(() => true, undefined, { revalidate: false });
    }
  }

  return { user, isAuthenticated, login, register, updateUsername, logout };
}
