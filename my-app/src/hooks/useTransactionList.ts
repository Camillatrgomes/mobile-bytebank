import { useMemo } from 'react';
import type { Transaction } from '@/domain/entities/Transaction';
import { useAppStore } from '@/stores';
import { useAccountData } from '@/stores/selectors';

export interface ITransaction {
  id: string;
  amount: number; // always positive
  type: 'transferencia' | 'deposito';
  date: string;
  description: string;
  category: string;
}

function normalize(t: Transaction): ITransaction {
  return {
    id: t.id,
    amount: t.value,
    type: t.type === 'Credit' ? 'deposito' : 'transferencia',
    date: t.date,
    description: t.description || t.category,
    category: t.type === 'Credit' ? 'Renda' : t.category || 'Outros',
  };
}

export function useTransactionList(month?: string) {
  const { transactions, isLoading, error } = useAccountData();
  const loadAccount = useAppStore((s) => s.loadAccount);

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

  const mutate = () => loadAccount({ force: true });

  return { transactions: normalized, receitas, despesas, lucro, byCategory, isLoading, error, mutate };
}
