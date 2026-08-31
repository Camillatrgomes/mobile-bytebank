import React, { useEffect, useState } from 'react';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { FloatInput } from '@/components/atoms/FloatInput';
import { closeModal, setSubmitting } from '@/store/transactionFormSlice';
import { apiFetch } from '@/lib/api';
import { suggestCategory } from '@/lib/categoryHelpers';
import { useToast } from '@/components/atoms/Toast';
import { revalidateAccount } from '@/hooks/useAccount';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { CREDIT_CATEGORIES, DEBIT_CATEGORIES } from '@/constants/categories';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import type { RootState, AppDispatch } from '@/store';

const schema = z.object({
  type: z.enum(['Credit', 'Debit']),
  value: z.string().min(1, 'Informe o valor').refine((v) => !isNaN(parseFloat(v.replace(',', '.'))) && parseFloat(v.replace(',', '.')) > 0, 'Valor deve ser positivo'),
  description: z.string().min(1, 'Informe uma descrição'),
  category: z.string().min(1, 'Selecione uma categoria'),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  accountId: string | null;
}

export function TransactionForm({ accountId }: TransactionFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isModalOpen = useSelector((s: RootState) => s.transactionForm.isModalOpen);
  const isSubmitting = useSelector((s: RootState) => s.transactionForm.isSubmitting);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'Debit', value: '', description: '', category: '' },
  });

  const type = watch('type');
  const description = watch('description');
  const categories = type === 'Credit' ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;

  // Auto-suggest category from description
  useEffect(() => {
    if (description.length > 3) {
      const suggested = suggestCategory(description);
      if (suggested && categories.includes(suggested as any)) {
        setValue('category', suggested);
      }
    }
  }, [description, categories]);

  // Reset category when type changes
  useEffect(() => {
    setValue('category', '');
  }, [type]);

  async function onSubmit(data: FormData) {
    if (!accountId) {
      toast('Conta não encontrada', 'error');
      return;
    }

    dispatch(setSubmitting(true));
    try {
      const numericValue = parseFloat(data.value.replace(',', '.'));
      await apiFetch('/account/transaction', {
        method: 'POST',
        body: {
          accountId,
          type: data.type,
          value: data.type === 'Debit' ? -numericValue : numericValue,
          to: data.description,
          category: data.category,
        },
      });

      await revalidateAccount();
      toast('Transação criada com sucesso!', 'success');
      reset();
      dispatch(closeModal());
    } catch (err: any) {
      toast(err.message ?? 'Erro ao criar transação', 'error');
    } finally {
      dispatch(setSubmitting(false));
    }
  }

  function handleClose() {
    reset();
    dispatch(closeModal());
  }

  return (
    <Modal visible={isModalOpen} onClose={handleClose} title="Nova Transação">
      <ScrollView showsVerticalScrollIndicator={false}>
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
