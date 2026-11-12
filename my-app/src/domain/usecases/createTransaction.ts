import {
  validateNewTransaction,
  type NewTransactionInput,
  type TransactionRuleError,
} from '../entities/Transaction';
import type { TransactionRepository } from '../repositories/TransactionRepository';

export interface TransactionDeps {
  transactions: TransactionRepository;
}

export type TransactionResult = { ok: true } | { ok: false; errors: TransactionRuleError[] };

export function createTransaction({ transactions }: TransactionDeps) {
  return async (
    accountId: string,
    input: NewTransactionInput,
    availableBalance: number
  ): Promise<TransactionResult> => {
    const errors = validateNewTransaction(input, availableBalance);
    if (errors.length > 0) return { ok: false, errors };

    await transactions.create(accountId, input);
    return { ok: true };
  };
}
