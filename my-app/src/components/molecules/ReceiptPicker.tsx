import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Paperclip, X } from 'lucide-react-native';
import { useToast } from '@/components/atoms/Toast';
import type { PickedFile } from '@/domain/repositories/ReceiptRepository';
import { container, RECEIPT_TYPES } from '@/infra/container';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';

interface ReceiptPickerProps {
  file: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  /** Nome do recibo já salvo na transação. */
  currentName?: string | null;
}

const toPickedFile = (asset: DocumentPicker.DocumentPickerAsset): PickedFile => ({
  name: asset.name,
  uri: asset.uri,
  mimeType: asset.mimeType ?? null,
  size: asset.size ?? null,
  file: asset.file,
});

export function ReceiptPicker({ file, onChange, currentName }: ReceiptPickerProps) {
  const toast = useToast();

  async function handlePick() {
    const result = await DocumentPicker.getDocumentAsync({
      type: RECEIPT_TYPES,
      base64: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const picked = toPickedFile(result.assets[0]);
    const error = container.validateReceipt(picked);
    if (error) {
      toast(error, 'error');
      return;
    }
    onChange(picked);
  }

  const name = file?.name ?? currentName;

  return (
    <View>
      <Text style={styles.label}>Recibo (opcional)</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.pickBtn} onPress={handlePick}>
          <Paperclip size={16} color={Colors.primary600} />
          <Text style={styles.pickText} numberOfLines={1}>
            {name ?? 'Anexar imagem ou PDF'}
          </Text>
        </TouchableOpacity>
        {file && (
          <TouchableOpacity
            onPress={() => onChange(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Remover recibo"
          >
            <X size={18} color={Colors.gray500} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.gray600,
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary300,
    backgroundColor: Colors.white,
  },
  pickText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.primary600,
    fontWeight: FontWeight.medium,
  },
});
