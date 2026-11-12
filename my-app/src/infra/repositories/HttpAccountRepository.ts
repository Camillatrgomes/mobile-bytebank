import type { AccountSnapshot } from '@/domain/entities/Account';
import type { AccountRepository } from '@/domain/repositories/AccountRepository';
import { fromRecord, type TransactionRecord } from '../firebase/transactionMapper';
import { apiFetch } from '../http/apiClient';

interface AccountResponse {
  result: {
    account: { id: string; type: string }[];
    transactions: (TransactionRecord & { id: string })[];
  };
}

export class HttpAccountRepository implements AccountRepository {
  async getSnapshot(): Promise<AccountSnapshot> {
    const { result } = await apiFetch<AccountResponse>('/account');
    const account = result?.account?.[0];
    return {
      account: account ? { id: account.id, type: account.type } : null,
      transactions: (result?.transactions ?? []).map(({ id, ...record }) => fromRecord(id, record)),
    };
  }

  async provision(username: string | null): Promise<void> {
    await apiFetch('/user', { method: 'POST', body: { username } });
  }
}
