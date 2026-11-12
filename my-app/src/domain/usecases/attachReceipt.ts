import type { Receipt } from '../entities/Transaction';
import type { PickedFile, ReceiptRepository } from '../repositories/ReceiptRepository';

export type AttachReceiptResult =
  | { ok: true; receipt: Receipt }
  | { ok: false; message: string };

export function attachReceipt({ receipts }: { receipts: ReceiptRepository }) {
  return async (file: PickedFile): Promise<AttachReceiptResult> => {
    const message = receipts.validate(file);
    if (message !== null) return { ok: false, message };

    return { ok: true, receipt: await receipts.upload(file) };
  };
}
