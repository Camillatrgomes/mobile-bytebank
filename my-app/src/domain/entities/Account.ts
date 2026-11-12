import type { Transaction } from './Transaction';

export interface Account {
  readonly id: string;
  readonly type: string;
}

export interface AccountSummary {
  readonly saldo: number;
  readonly receitas: number;
  readonly despesas: number;
}

export function summarize(transactions: readonly Transaction[]): AccountSummary {
  let receitas = 0;
  let despesas = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'Credit') receitas += Math.abs(transaction.value);
    else despesas += Math.abs(transaction.value);
  }

  return { saldo: receitas - despesas, receitas, despesas };
}

export function metaMessage(summary: AccountSummary, transactionCount: number): string {
  if (transactionCount === 0) return 'Você ainda não tem transações registradas';
  if (summary.saldo < 0) return 'Atenção: seu saldo está negativo';
  return 'Seu saldo superou a meta do mês';
}
