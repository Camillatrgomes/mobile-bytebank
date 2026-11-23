import { CREDIT_CATEGORIES, DEBIT_CATEGORIES } from '@/constants/categories';

export type TransactionType = 'Credit' | 'Debit';

export interface Receipt {
  readonly name: string;
  readonly url: string;
}

export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  /** Sempre positivo; o sinal é detalhe de persistência. */
  readonly value: number;
  readonly description: string;
  readonly category: string;
  /** ISO 8601 em UTC. */
  readonly date: string;
  readonly receipt: Receipt | null;
}

export interface NewTransactionInput {
  readonly type: TransactionType;
  readonly value: number;
  readonly description: string;
  readonly category: string;
  readonly receipt: Receipt | null;
}

export const MAX_TRANSACTION_VALUE = 1_000_000;
export const MIN_DESCRIPTION_LENGTH = 3;
export const MAX_DESCRIPTION_LENGTH = 60;

export type TransactionRuleError =
  | 'value-not-positive'
  | 'value-too-high'
  | 'description-too-short'
  | 'description-too-long'
  | 'category-mismatch'
  | 'insufficient-balance';

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === 'Credit' ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;
}

export function validateNewTransaction(
  input: NewTransactionInput,
  availableBalance: number
): TransactionRuleError[] {
  const errors: TransactionRuleError[] = [];
  const description = input.description.trim();

  if (!(input.value > 0)) errors.push('value-not-positive');
  if (input.value > MAX_TRANSACTION_VALUE) errors.push('value-too-high');
  if (description.length < MIN_DESCRIPTION_LENGTH) errors.push('description-too-short');
  if (description.length > MAX_DESCRIPTION_LENGTH) errors.push('description-too-long');
  if (!categoriesFor(input.type).includes(input.category)) errors.push('category-mismatch');
  if (input.type === 'Debit' && input.value > availableBalance) errors.push('insufficient-balance');

  return errors;
}

export function signedValue(transaction: Pick<Transaction, 'type' | 'value'>): number {
  return transaction.type === 'Debit' ? -Math.abs(transaction.value) : Math.abs(transaction.value);
}
