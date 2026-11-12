import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// shortcut: na web não há Keychain/Keystore, localStorage só serve para desenvolvimento.
const isWeb = Platform.OS === 'web';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getSecureItem(key: string): Promise<string | null> {
  return isWeb ? globalThis.localStorage.getItem(key) : SecureStore.getItemAsync(key, options);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) globalThis.localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value, options);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) globalThis.localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key, options);
}
