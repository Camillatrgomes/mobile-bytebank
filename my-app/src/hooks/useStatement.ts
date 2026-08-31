import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAccount, type IApiTransaction } from './useAccount';
import type { RootState } from '@/store';

export function useStatement() {
  const { transactions, isLoading, error, mutate } = useAccount();
  const { month, type, category, search, startDate, endDate } = useSelector(
    (s: RootState) => s.filter
  );

  const filtered = useMemo(() => {
    return transactions.filter((t: IApiTransaction) => {
      if (month && !t.date.startsWith(month)) return false;
      if (type !== 'all' && t.type !== type) return false;
      if (category && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [t.to, t.from, t.category].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  }, [transactions, month, type, category, search, startDate, endDate]);

  // Sort by date descending
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered]
  );

  return { transactions: sorted, isLoading, error, mutate };
}
