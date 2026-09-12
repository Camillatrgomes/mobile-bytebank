import useSWR, { mutate as globalMutate } from 'swr';
import { apiFetch } from '@/lib/api';
import { revalidateStatement } from './useInfiniteStatement';

export interface IApiTransaction {
  id: string;
  accountId: string;
  type: 'Credit' | 'Debit';
  value: number; // Debits are stored as negative numbers
  from?: string;
  to?: string;
  category?: string;
  date: string;
  anexo?: string | null;
  urlAnexo?: string | null;
}

export interface IAccountResponse {
  message: string;
  result: {
    account: { id: string; type: string; userId: string }[];
    transactions: IApiTransaction[];
    cards: { id: string; type: string; number: string; dueDate: string; functions: string }[];
  };
}

const fetcher = () => apiFetch<IAccountResponse>('/account');

export function useAccount() {
  const { data, error, isLoading, mutate } = useSWR<IAccountResponse>('/account', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const transactions = data?.result?.transactions ?? [];
  const credits = transactions.filter((t) => t.type === 'Credit');
  const debits = transactions.filter((t) => t.type === 'Debit');

  // Backend stores debit values as negative
  const saldo = transactions.reduce((acc, t) => acc + t.value, 0);
  const receitas = credits.reduce((acc, t) => acc + t.value, 0);
  const despesas = debits.reduce((acc, t) => acc + Math.abs(t.value), 0);
  const accountId = data?.result?.account?.[0]?.id ?? null;

  function getMetaMessage(): string {
    if (transactions.length === 0) return 'Você ainda não tem transações registradas';
    if (saldo < 0) return 'Atenção: seu saldo está negativo';
    return 'Seu saldo superou a meta do mês';
  }

  return {
    data,
    transactions,
    saldo,
    receitas,
    despesas,
    accountId,
    isLoading,
    error,
    mutate,
    metaMessage: getMetaMessage(),
  };
}

export function revalidateAccount() {
  revalidateStatement();
  return globalMutate('/account');
}
