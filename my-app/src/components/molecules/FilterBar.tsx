import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMonth,
  setType,
  setCategory,
  setSearch,
  resetFilters,
} from '@/store/filterSlice';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { getLastMonths } from '@/lib/formatters';
import { FloatInput } from '@/components/atoms/FloatInput';
import { DEBIT_CATEGORIES, CREDIT_CATEGORIES } from '@/constants/categories';
import type { RootState, AppDispatch } from '@/store';

export function FilterBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { month, type, category, search } = useSelector((s: RootState) => s.filter);
  const months = getLastMonths(6);
  const categories = [...CREDIT_CATEGORIES, ...DEBIT_CATEGORIES];

  return (
    <View style={styles.container}>
      {/* Search */}
      <FloatInput
        label="Buscar transação..."
        value={search}
        onChangeText={(v) => dispatch(setSearch(v))}
      />

      {/* Month filter */}
      <Text style={styles.sectionLabel}>Mês</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {months.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.chip, month === m.value && styles.chipActive]}
            onPress={() => dispatch(setMonth(m.value))}
          >
            <Text style={[styles.chipText, month === m.value && styles.chipTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Type filter */}
      <Text style={styles.sectionLabel}>Tipo</Text>
      <View style={styles.typeRow}>
        {([['all', 'Todos'], ['Credit', 'Entradas ↑'], ['Debit', 'Saídas ↓']] as const).map(
          ([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.typeBtn,
                type === val && {
                  backgroundColor:
                    val === 'Credit'
                      ? '#dcfce7'
                      : val === 'Debit'
                      ? '#fee2e2'
                      : Colors.primary100,
                  borderColor:
                    val === 'Credit'
                      ? Colors.income
                      : val === 'Debit'
                      ? Colors.expense
                      : Colors.primary600,
                },
              ]}
              onPress={() => dispatch(setType(val))}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  type === val && { color: Colors.gray800, fontWeight: FontWeight.bold },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Category filter */}
      <Text style={styles.sectionLabel}>Categoria</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, category === '' && styles.chipActive]}
          onPress={() => dispatch(setCategory(''))}
        >
          <Text style={[styles.chipText, category === '' && styles.chipTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => dispatch(setCategory(cat))}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reset */}
      <TouchableOpacity onPress={() => dispatch(resetFilters())} style={styles.resetBtn}>
        <Text style={styles.resetText}>Limpar filtros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
    marginTop: Spacing.one,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  chipActive: {
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary600,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
  },
  chipTextActive: {
    color: Colors.primary700,
    fontWeight: FontWeight.semibold,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeBtnText: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
  resetBtn: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.one,
  },
  resetText: {
    fontSize: FontSize.sm,
    color: Colors.primary600,
    fontWeight: FontWeight.medium,
    textDecorationLine: 'underline',
  },
});
