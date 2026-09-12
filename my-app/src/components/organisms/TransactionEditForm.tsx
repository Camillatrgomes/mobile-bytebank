import React, { useEffect, useState } from 'react';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/atoms/Button';
import { FloatInput } from '@/components/atoms/FloatInput';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/atoms/Toast';
import { revalidateAccount } from '@/hooks/useAccount';
import { ReceiptPicker } from '@/components/molecules/ReceiptPicker';
import { uploadReceipt } from '@/lib/receipts';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { CREDIT_CATEGORIES, DEBIT_CATEGORIES } from '@/constants/categories';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import type { IApiTransaction } from '@/hooks/useAccount';

const schema = z.object({
  type: z.enum(['Credit', 'Debit']),
  value: z.string().min(1, 'Informe o valor').refine(
    (v) => !isNaN(parseFloat(v.replace(',', '.'))) && parseFloat(v.replace(',', '.')) > 0,
    'Valor deve ser positivo'
  ),
  description: z.string().min(1, 'Informe uma descrição'),
  category: z.string().min(1, 'Selecione uma categoria'),
});

type FormData = z.infer<typeof schema>;

interface TransactionEditFormProps {
  transaction: IApiTransaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionEditForm({ transaction, onSuccess, onCancel }: TransactionEditFormProps) {
  const toast = useToast();
  const [receipt, setReceipt] = useState<DocumentPickerAsset | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction.type,
      value: String(Math.abs(transaction.value)),
      description: transaction.to ?? transaction.from ?? '',
      category: transaction.category ?? '',
    },
  });

  const type = watch('type');
  const categories = type === 'Credit' ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;

  // Limpa a categoria apenas quando ela não existe na lista do tipo selecionado.
  // Limpar incondicionalmente apagava a categoria pré-carregada na montagem.
  useEffect(() => {
    const current = getValues('category');
    if (current && !categories.includes(current as never)) {
      setValue('category', '');
    }
  }, [type]);

  async function onSubmit(data: FormData) {
    try {
      const numericValue = parseFloat(data.value.replace(',', '.'));
      const attachment = receipt ? await uploadReceipt(receipt) : {};
      await apiFetch(`/account/transaction/${transaction.id}`, {
        method: 'PUT',
        body: {
          type: data.type,
          value: data.type === 'Debit' ? -numericValue : numericValue,
          to: data.description,
          category: data.category,
          ...attachment,
        },
      });

      await revalidateAccount();
      toast('Transação atualizada!', 'success');
      onSuccess();
    } catch (err: any) {
      toast(err.message ?? 'Erro ao atualizar transação', 'error');
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Type toggle */}
      <View style={styles.typeToggle}>
        {(['Debit', 'Credit'] as const).map((t) => (
          <Controller
            key={t}
            control={control}
            name="type"
            render={({ field }) => (
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  field.value === t && {
                    backgroundColor: t === 'Credit' ? '#dcfce7' : '#fee2e2',
                    borderColor: t === 'Credit' ? Colors.income : Colors.expense,
                  },
                ]}
                onPress={() => field.onChange(t)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {t === 'Debit' ? (
                    <ArrowDownLeft size={18} color={field.value === t ? Colors.expense : Colors.gray500} />
                  ) : (
                    <ArrowUpRight size={18} color={field.value === t ? Colors.income : Colors.gray500} />
                  )}
                  <Text
                    style={[
                      styles.typeBtnText,
                      field.value === t && { color: Colors.gray800 },
                    ]}
                  >
                    {t === 'Debit' ? 'Saída' : 'Entrada'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ))}
      </View>

      <View style={styles.fields}>
        <Controller
          control={control}
          name="value"
          render={({ field }) => (
            <FloatInput
              label="Valor (R$)"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="decimal-pad"
              error={errors.value?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FloatInput
              label="Descrição / Destinatário"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.description?.message}
            />
          )}
        />

        {/* Category selector */}
        <View>
          <Text style={styles.categoryLabel}>Categoria</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <Controller
                key={cat}
                control={control}
                name="category"
                render={({ field }) => (
                  <TouchableOpacity
                    style={[styles.catChip, field.value === cat && styles.catChipActive]}
                    onPress={() => field.onChange(cat)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        field.value === cat && styles.catChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category.message}</Text>
          )}
        </View>

        <ReceiptPicker asset={receipt} onChange={setReceipt} currentName={transaction.anexo} />
      </View>

      <View style={styles.actions}>
        <Button variant="outline" onPress={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={{ flex: 1 }}
        >
          Salvar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.gray500,
  },
  fields: {
    gap: Spacing.four,
  },
  categoryLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.gray600,
    marginBottom: Spacing.two,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  catChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  catChipActive: {
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary600,
  },
  catChipText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
  },
  catChipTextActive: {
    color: Colors.primary700,
    fontWeight: FontWeight.semibold,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.expense,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.six,
    paddingBottom: Spacing.four,
  },
});
