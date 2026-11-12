import type { Account } from '@/domain/entities/Account';
import type { AccountRepository } from '@/domain/repositories/AccountRepository';
import { apiFetch } from '../http/apiClient';

interface AccountResponse {
  result: { account: { id: string; type: string }[] };
}

export class HttpAccountRepository implements AccountRepository {
  async getCurrent(): Promise<Account | null> {
    const response = await apiFetch<AccountResponse>('/account');
    const account = response?.result?.account?.[0];
    return account ? { id: account.id, type: account.type } : null;
  }

  async provision(username: string | null): Promise<void> {
    await apiFetch('/user', { method: 'POST', body: { username } });
  }
}
