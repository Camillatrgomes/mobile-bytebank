import { useMemo } from 'react';
import { useAccount, type IApiTransaction } from './useAccount';

export interface ITransaction {
  id: string;
  amount: number; // always positive
  type: 'transferencia' | 'deposito';
  date: string;
  description: string;
  category: string;
}

function normalize(t: IApiTransaction): ITransaction {
  return {
    id: t.id,
    amount: Math.abs(t.value),
    type: t.type === 'Credit' ? 'deposito' : 'transferencia',
    date: t.date,
    description: t.to ?? t.from ?? t.category ?? '',
    category: t.type === 'Credit' ? 'Renda' : (t.category ?? 'Outros'),
  };
}

export function useTransactionList(month?: string) {
  const { transactions, isLoading, error, mutate } = useAccount();

  const normalized = useMemo(() => {
    let list = transactions.map(normalize);
    if (month) {
      list = list.filter((t) => t.date.startsWith(month));
    }
    return list;
  }, [transactions, month]);

  const receitas = useMemo(
    () => normalized.filter((t) => t.type === 'deposito').reduce((s, t) => s + t.amount, 0),
    [normalized]
  );
  const despesas = useMemo(
    () => normalized.filter((t) => t.type === 'transferencia').reduce((s, t) => s + t.amount, 0),
    [normalized]
  );
  const lucro = receitas - despesas;

  // Group by category for pie chart
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    normalized.forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [normalized]);

  return { transactions: normalized, receitas, despesas, lucro, byCategory, isLoading, error, mutate };
}
