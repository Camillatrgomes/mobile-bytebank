import type { Account } from '../entities/Account';

export interface AccountRepository {
  getCurrent(): Promise<Account | null>;
  provision(username: string | null): Promise<void>;
}
