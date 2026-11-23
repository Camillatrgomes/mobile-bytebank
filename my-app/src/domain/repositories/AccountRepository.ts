import type { AccountSnapshot } from '../entities/Account';

export interface AccountRepository {
  /** Conta do usuário com todas as transações, base do saldo e do resumo. */
  getSnapshot(): Promise<AccountSnapshot>;
  provision(username: string | null): Promise<void>;
}
