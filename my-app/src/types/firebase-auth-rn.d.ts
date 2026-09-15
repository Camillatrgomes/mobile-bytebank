import type { Persistence } from 'firebase/auth';

// Existe em runtime no bundle RN, mas falta nos tipos publicados (firebase-js-sdk#9316).
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
