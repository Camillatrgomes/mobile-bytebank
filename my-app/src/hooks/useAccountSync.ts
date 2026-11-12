import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAppStore } from '@/stores';

/** Carrega a conta ao entrar e de novo quando o app volta ao primeiro plano. */
export function useAccountSync(): void {
  const uid = useAppStore((s) => s.user?.id ?? null);

  useEffect(() => {
    if (!uid) return;
    const { loadAccount } = useAppStore.getState();
    loadAccount();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadAccount();
    });
    return () => subscription.remove();
  }, [uid]);
}
