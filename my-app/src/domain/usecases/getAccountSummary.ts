import { metaMessage, summarize, type AccountSummary } from '../entities/Account';
import type { Transaction } from '../entities/Transaction';

export interface AccountOverview extends AccountSummary {
  readonly metaMessage: string;
}

export function getAccountSummary(transactions: readonly Transaction[]): AccountOverview {
  const summary = summarize(transactions);
  return { ...summary, metaMessage: metaMessage(summary, transactions.length) };
}
