import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/atoms/Button';
import { FloatInput } from '@/components/atoms/FloatInput';
import { container } from '@/infra/container';
import { useToast } from '@/components/atoms/Toast';
import { useAccountSummary } from '@/stores/selectors';
import { ReceiptPicker } from '@/components/molecules/ReceiptPicker';
import {
  createTransactionSchema,
  formatAmountInput,
  parseAmount,
  sanitizeAmountInput,
  transactionRuleMessage,
  type TransactionFormValues,
} from '@/lib/transactionSchema';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { CREDIT_CATEGORIES, DEBIT_CATEGORIES } from '@/constants/categories';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import type { PickedFile } from '@/domain/repositories/ReceiptRepository';
import { signedValue, type Transaction } from '@/domain/entities/Transaction';

interface TransactionEditFormProps {
  transaction: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionEditForm({ transaction, onSuccess, onCancel }: TransactionEditFormProps) {
  const toast = useToast();
  const { saldo } = useAccountSummary();
  const [receipt, setReceipt] = useState<PickedFile | null>(null);
  // O valor original volta ao saldo: editar não pode ser barrado pelo próprio lançamento.
  const availableBalance = saldo - signedValue(transaction);
  const schema = useMemo(() => createTransactionSchema({ availableBalance }), [availableBalance]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction.type,
      value: formatAmountInput(transaction.value),
      description: transaction.description,
      category: transaction.category,
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

  async function onSubmit(data: TransactionFormValues) {
    try {
      const attached = receipt ? await container.attachReceipt(receipt) : null;
      if (attached && !attached.ok) {
        toast(attached.message, 'error');
        return;
      }

      const result = await container.updateTransaction(
        transaction.id,
        {
          type: data.type,
          value: parseAmount(data.value) ?? 0,
          description: data.description,
          category: data.category,
          receipt: attached?.receipt ?? null,
        },
        availableBalance
      );
      if (!result.ok) {
        toast(transactionRuleMessage(result.errors[0]), 'error');
        return;
      }

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
              onChangeText={(v) => field.onChange(sanitizeAmountInput(v))}
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
              maxLength={60}
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

        <ReceiptPicker file={receipt} onChange={setReceipt} currentName={transaction.receipt?.name || null} />
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
