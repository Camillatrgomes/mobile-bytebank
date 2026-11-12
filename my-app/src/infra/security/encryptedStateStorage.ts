import AsyncStorage from '@react-native-async-storage/async-storage';
import { open, seal } from './cryptoBox';

/** Mesma forma do AsyncStorage, com o valor cifrado em repouso. */
export const encryptedStateStorage = {
  async getItem(key: string): Promise<string | null> {
    const payload = await AsyncStorage.getItem(key);
    return payload === null ? null : open(payload);
  },
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, await seal(value));
  },
  removeItem: (key: string): Promise<void> => AsyncStorage.removeItem(key),
};
