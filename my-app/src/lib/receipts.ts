import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { auth, storage } from '@/lib/firebase';

export const RECEIPT_TYPES = ['image/*', 'application/pdf'];
const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

// Espelha o storage.rules para avisar antes de o upload ser recusado.
export function getReceiptError(asset: DocumentPickerAsset): string | null {
  const type = asset.mimeType ?? asset.file?.type ?? '';
  if (!type.startsWith('image/') && type !== 'application/pdf') return 'Envie uma imagem ou um PDF';
  if ((asset.size ?? asset.file?.size ?? 0) >= RECEIPT_MAX_BYTES) return 'O recibo deve ter menos de 5 MB';
  return null;
}

export async function uploadReceipt(asset: DocumentPickerAsset) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sessão expirada, entre novamente');

  try {
    const data = asset.file ?? (await (await fetch(asset.uri)).blob());
    const fileName = `${Date.now()}-${asset.name.replace(/[^\w.-]+/g, '_')}`;
    const fileRef = ref(storage, `receipts/${uid}/${fileName}`);
    await uploadBytes(fileRef, data, { contentType: asset.mimeType ?? data.type });
    return { anexo: asset.name, urlAnexo: await getDownloadURL(fileRef) };
  } catch {
    throw new Error('Não foi possível enviar o recibo');
  }
}
