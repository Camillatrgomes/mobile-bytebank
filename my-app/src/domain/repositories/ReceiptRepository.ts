import type { Receipt } from '../entities/Transaction';

export interface PickedFile {
  readonly name: string;
  readonly uri: string;
  readonly mimeType: string | null;
  readonly size: number | null;
  readonly file?: unknown;
}

export interface ReceiptRepository {
  /** null quando o arquivo é aceito; a mensagem de recusa quando não. */
  validate(file: PickedFile): string | null;
  upload(file: PickedFile): Promise<Receipt>;
}
