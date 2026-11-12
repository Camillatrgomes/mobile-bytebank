import type { TransactionDeps } from './createTransaction';

export function deleteTransaction({ transactions }: TransactionDeps) {
  return (id: string): Promise<void> => transactions.remove(id);
}
