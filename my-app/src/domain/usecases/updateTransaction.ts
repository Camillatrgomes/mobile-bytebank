import { validateNewTransaction, type NewTransactionInput } from '../entities/Transaction';
import type { TransactionDeps, TransactionResult } from './createTransaction';

export function updateTransaction({ transactions }: TransactionDeps) {
  return async (
    id: string,
    input: NewTransactionInput,
    availableBalance: number
  ): Promise<TransactionResult> => {
    const errors = validateNewTransaction(input, availableBalance);
    if (errors.length > 0) return { ok: false, errors };

    await transactions.update(id, input);
    return { ok: true };
  };
}
