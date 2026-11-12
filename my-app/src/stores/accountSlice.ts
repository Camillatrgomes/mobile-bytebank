import type { StateCreator } from 'zustand';
import type { Account } from '@/domain/entities/Account';
import type { Transaction } from '@/domain/entities/Transaction';
import { container } from '@/infra/container';
import type { StoreState } from './index';

export interface AccountSlice {
  account: Account | null;
  /** Todas as transações da conta, ao vivo: base do saldo, nunca a página filtrada do extrato. */
  transactions: readonly Transaction[];
  /** Só até a primeira emissão do stream (ou o cache hidratado): depois a tela não pisca. */
  isAccountLoading: boolean;
  accountError: Error | null;
  /** uid dono do cache persistido e quando o stream o atualizou pela última vez (epoch ms). */
  cacheOwner: string | null;
  cachedAt: number | null;
  /** Id e tipo da conta, que só o backend conhece: uma vez por sessão. */
  loadAccount: () => Promise<void>;
  /** Emissão do stream de transações; uid é o dono do stream que emitiu. */
  setTransactions: (uid: string, transactions: readonly Transaction[]) => void;
  failTransactions: (error: Error) => void;
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

export const createAccountSlice: StateCreator<StoreState, [['zustand/persist', unknown]], [], AccountSlice> = (set) => ({
  ...initialAccountState,
  loadAccount: () => {
    if (inFlight) return inFlight;

    const requestId = ++latestRequest;
    const request = (async () => {
      try {
        const { account } = await container.loadAccount();
        if (requestId !== latestRequest) return;
        set({ account, accountError: null });
      } catch (error) {
        if (requestId !== latestRequest) return;
        set({ accountError: error as Error });
      } finally {
        if (requestId === latestRequest) inFlight = null;
      }
    })();
    inFlight = request;
    return request;
  },
  setTransactions: (uid, transactions) =>
    set({ transactions, isAccountLoading: false, cacheOwner: uid, cachedAt: Date.now() }),
  failTransactions: (error) => set({ accountError: error, isAccountLoading: false }),
});
