import type { StateCreator } from 'zustand';
import type { Account } from '@/domain/entities/Account';
import type { Transaction } from '@/domain/entities/Transaction';
import { container } from '@/infra/container';
import type { StoreState } from './index';

export interface AccountSlice {
  account: Account | null;
  /** Todas as transações da conta: base do saldo, nunca a página filtrada do extrato. */
  transactions: readonly Transaction[];
  /** Só na primeira carga, como o isLoading do SWR: recargas não piscam a tela. */
  isAccountLoading: boolean;
  accountError: Error | null;
  /** uid dono do cache persistido e quando o servidor o confirmou pela última vez (epoch ms). */
  cacheOwner: string | null;
  cachedAt: number | null;
  loadAccount: (options?: { force?: boolean }) => Promise<void>;
}

export const initialAccountState = {
  account: null,
  transactions: [],
  isAccountLoading: true,
  accountError: null,
  cacheOwner: null,
  cachedAt: null,
} satisfies Partial<AccountSlice>;

let latestRequest = 0;
let inFlight: Promise<void> | null = null;

/** Invalida respostas ainda a caminho, para não vazarem para o próximo usuário. */
export function cancelAccountRequests(): void {
  latestRequest += 1;
  inFlight = null;
}

export const createAccountSlice: StateCreator<StoreState, [['zustand/persist', unknown]], [], AccountSlice> = (set, get) => ({
  ...initialAccountState,
  loadAccount: ({ force = false } = {}) => {
    if (inFlight && !force) return inFlight;

    const requestId = ++latestRequest;
    const request = (async () => {
      try {
        const { account, transactions } = await container.loadAccount();
        if (requestId !== latestRequest) return;
        set({
          account,
          transactions,
          isAccountLoading: false,
          accountError: null,
          cacheOwner: get().user?.id ?? null,
          cachedAt: Date.now(),
        });
      } catch (error) {
        if (requestId !== latestRequest) return;
        set({ accountError: error as Error, isAccountLoading: false });
      } finally {
        if (requestId === latestRequest) inFlight = null;
      }
    })();
    inFlight = request;
    return request;
  },
});
