import {
  aesDecryptAsync,
  aesEncryptAsync,
  AESEncryptionKey,
  AESKeySize,
  AESSealedData,
} from 'expo-crypto';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secureStorage';

const KEY_ALIAS = 'bytebank.cache.key';

let keyPromise: Promise<AESEncryptionKey> | null = null;

async function loadOrCreateKey(): Promise<AESEncryptionKey> {
  const stored = await getSecureItem(KEY_ALIAS);
  if (stored) return AESEncryptionKey.import(stored, 'base64');

  const key = await AESEncryptionKey.generate(AESKeySize.AES256);
  await setSecureItem(KEY_ALIAS, await key.encoded('base64'));
  return key;
}

function getKey(): Promise<AESEncryptionKey> {
  keyPromise ??= loadOrCreateKey().catch((err) => {
    keyPromise = null;
    throw err;
  });
  return keyPromise;
}

// UTF-8 via escape/unescape: TextDecoder não é garantido no Hermes e isso roda igual nas duas plataformas.
const toBytes = (text: string) =>
  Uint8Array.from(unescape(encodeURIComponent(text)), (c) => c.charCodeAt(0));

function fromBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return decodeURIComponent(escape(binary));
}

/** Cifra com AES-256-GCM; devolve iv + texto cifrado + tag em base64. */
export async function seal(plaintext: string): Promise<string> {
  const sealed = await aesEncryptAsync(toBytes(plaintext), await getKey());
  return sealed.combined('base64');
}

/** null se a chave mudou ou o payload está corrompido. */
export async function open(payload: string): Promise<string | null> {
  try {
    const bytes = await aesDecryptAsync(AESSealedData.fromCombined(payload), await getKey());
    return fromBytes(bytes);
  } catch {
    return null;
  }
}

export async function forgetKey(): Promise<void> {
  keyPromise = null;
  await deleteSecureItem(KEY_ALIAS);
}
