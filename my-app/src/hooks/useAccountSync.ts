import { useEffect } from 'react';
import { container } from '@/infra/container';
import { trackLive, useAppStore } from '@/stores';

/** Carrega a conta uma vez e assina as transações ao vivo enquanto houver usuário. */
export function useAccountSync(): void {
  const uid = useAppStore((s) => s.user?.id ?? null);

  useEffect(() => {
    if (!uid) return;
    const { loadAccount, setTransactions, failTransactions } = useAppStore.getState();
    loadAccount();
    const subscription = trackLive(
      container.watchAllTransactions(uid).subscribe({
        next: (transactions) => setTransactions(uid, transactions),
        error: failTransactions,
      })
    );
    return () => subscription.unsubscribe();
  }, [uid]);
}
