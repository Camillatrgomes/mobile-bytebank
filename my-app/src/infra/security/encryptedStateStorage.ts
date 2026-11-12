import AsyncStorage from '@react-native-async-storage/async-storage';
import { open, seal } from './cryptoBox';

// Operações em fila: no logout dá para esperar toda escrita pendente antes de esquecer a chave.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => undefined);
  return run;
}

/** Mesma forma do AsyncStorage, com o valor cifrado em repouso. */
export const encryptedStateStorage = {
  async getItem(key: string): Promise<string | null> {
    const payload = await AsyncStorage.getItem(key);
    return payload === null ? null : open(payload);
  },
  setItem: (key: string, value: string): Promise<void> =>
    enqueue(async () => AsyncStorage.setItem(key, await seal(value))),
  removeItem: (key: string): Promise<void> => enqueue(() => AsyncStorage.removeItem(key)),
  /** Resolve quando todas as escritas já pedidas terminaram. */
  idle: (): Promise<unknown> => queue,
};
