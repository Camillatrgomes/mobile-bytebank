import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { FloatInput } from '@/components/atoms/FloatInput';
import { apiFetch } from '@/lib/api';
import { suggestCategory } from '@/lib/categoryHelpers';
import { useToast } from '@/components/atoms/Toast';
import { revalidateAccount } from '@/hooks/useAccount';
import { useTransactions } from '@/contexts/TransactionsContext';
import { ReceiptPicker } from '@/components/molecules/ReceiptPicker';
import { uploadReceipt } from '@/lib/receipts';
import {
  createTransactionSchema,
  parseAmount,
  sanitizeAmountInput,
  type TransactionFormValues,
} from '@/lib/transactionSchema';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { CREDIT_CATEGORIES, DEBIT_CATEGORIES } from '@/constants/categories';
import { AnimatedTouchable } from '@/components/atoms/AnimatedTouchable';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import type { DocumentPickerAsset } from 'expo-document-picker';

interface TransactionFormProps {
  accountId: string | null;
}

export function TransactionForm({ accountId }: TransactionFormProps) {
  const { isFormOpen, closeForm, saldo } = useTransactions();
  const toast = useToast();
  const [receipt, setReceipt] = useState<DocumentPickerAsset | null>(null);
  const schema = useMemo(() => createTransactionSchema({ availableBalance: saldo }), [saldo]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'Debit', value: '', description: '', category: '' },
  });

  const type = watch('type');
  const description = watch('description');
  const categories = type === 'Credit' ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;

  useEffect(() => {
    if (description.length > 3) {
      const suggested = suggestCategory(description);
      if (suggested && categories.includes(suggested as any)) {
        setValue('category', suggested);
      }
    }
  }, [description, categories]);

  useEffect(() => {
    const current = getValues('category');
    if (current && !categories.includes(current as never)) {
      setValue('category', '');
    }
  }, [type]);

  function handleClose() {
    reset();
    setReceipt(null);
    closeForm();
  }

  async function onSubmit(data: TransactionFormValues) {
    if (!accountId) {
      toast('Conta não encontrada', 'error');
      return;
    }

    try {
      const amount = parseAmount(data.value) ?? 0;
      const attachment = receipt ? await uploadReceipt(receipt) : {};
      await apiFetch('/account/transaction', {
        method: 'POST',
        body: {
          accountId,
          type: data.type,
          value: data.type === 'Debit' ? -amount : amount,
          to: data.description,
          category: data.category,
          ...attachment,
        },
      });

      await revalidateAccount();
      toast('Transação criada com sucesso!', 'success');
      handleClose();
    } catch (err: any) {
      toast(err.message ?? 'Erro ao criar transação', 'error');
    }
  }

  return (
    <Modal visible={isFormOpen} onClose={handleClose} title="Nova Transação">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Type toggle */}
        <View style={styles.typeToggle}>
          {(['Debit', 'Credit'] as const).map((t) => (
            <Controller
              key={t}
              control={control}
              name="type"
              render={({ field }) => (
                <AnimatedTouchable
                  scaleTo={0.93} activeOpacity={1}
                  style={[
                    styles.typeBtn,
                    field.value === t && (t === 'Credit' ? styles.typeBtnActiveCredit : styles.typeBtnActiveDebit),
                  ]}
                  onPress={() => field.onChange(t)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {t === 'Debit' ? (
                      <ArrowDownLeft size={18} color={field.value === t ? Colors.expense : Colors.gray500} />
                    ) : (
                      <ArrowUpRight size={18} color={field.value === t ? Colors.income : Colors.gray500} />
                    )}
                    <Text style={[styles.typeBtnText, field.value === t && styles.typeBtnTextActive]}>
                      {t === 'Debit' ? 'Saída' : 'Entrada'}
                    </Text>
                  </View>
                </AnimatedTouchable>
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

          <View>
            <Text style={styles.categoryLabel}>Categoria</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Controller
                  key={cat}
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <AnimatedTouchable
                  scaleTo={0.93} activeOpacity={1}
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
                    </AnimatedTouchable>
                  )}
                />
              ))}
            </View>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category.message}</Text>
            )}
          </View>

          <ReceiptPicker asset={receipt} onChange={setReceipt} />
        </View>

        <Button
          variant="primary"
          fullWidth
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitBtn}
        >
          Criar Transação
        </Button>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  typeBtnActiveCredit: {
    backgroundColor: '#dcfce7',
    borderColor: Colors.income,
  },
  typeBtnActiveDebit: {
    backgroundColor: '#fee2e2',
    borderColor: Colors.expense,
  },
  typeBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.gray500,
    paddingHorizontal:  8,
  },
  typeBtnTextActive: {
    color: Colors.gray800,
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
  submitBtn: {
    marginTop: Spacing.six,
  },
});
