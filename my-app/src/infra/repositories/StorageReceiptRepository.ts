import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { Receipt } from '@/domain/entities/Transaction';
import type { PickedFile, ReceiptRepository } from '@/domain/repositories/ReceiptRepository';
import { auth, storage } from '../firebase/client';

export const RECEIPT_TYPES = ['image/*', 'application/pdf'];
const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

// Na web o DocumentPicker entrega um File; no nativo só a uri.
const blobOf = (file: PickedFile): Blob | undefined =>
  file.file instanceof Blob ? file.file : undefined;

export class StorageReceiptRepository implements ReceiptRepository {
  // Espelha o storage.rules para avisar antes de o upload ser recusado.
  validate(file: PickedFile): string | null {
    const type = file.mimeType ?? blobOf(file)?.type ?? '';
    if (!type.startsWith('image/') && type !== 'application/pdf') return 'Envie uma imagem ou um PDF';
    if ((file.size ?? blobOf(file)?.size ?? 0) >= RECEIPT_MAX_BYTES) return 'O recibo deve ter menos de 5 MB';
    return null;
  }

  async upload(file: PickedFile): Promise<Receipt> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Sessão expirada, entre novamente');

    try {
      const data = blobOf(file) ?? (await (await fetch(file.uri)).blob());
      const fileName = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
      const fileRef = ref(storage, `receipts/${uid}/${fileName}`);
      await uploadBytes(fileRef, data, { contentType: file.mimeType ?? data.type });
      return { name: file.name, url: await getDownloadURL(fileRef) };
    } catch {
      throw new Error('Não foi possível enviar o recibo');
    }
  }
}
