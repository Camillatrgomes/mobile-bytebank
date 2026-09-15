import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AnimatedTouchable } from '@/components/atoms/AnimatedTouchable';
import { useTransactionFilters } from '@/contexts/TransactionsContext';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { getLastMonths } from '@/lib/formatters';
import { FloatInput } from '@/components/atoms/FloatInput';
import { DateRangeFilter } from '@/components/molecules/DateRangeFilter';
import { DEBIT_CATEGORIES, CREDIT_CATEGORIES } from '@/constants/categories';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface SliderOption {
  value: string;
  label: string;
}

interface FilterSliderProps {
  options: SliderOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

function FilterSlider({
  options,
  selectedValue,
  onSelect,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: FilterSliderProps) {
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const orderedOptions = selectedIndex > 0
    ? [options[selectedIndex], ...options.slice(selectedIndex + 1), ...options.slice(0, selectedIndex)]
    : options;

  return (
    <View style={styles.sliderRow}>
      <TouchableOpacity
        onPress={onPrevious}
        disabled={!canGoPrevious}
        style={[styles.arrowBtn, !canGoPrevious && styles.arrowBtnDisabled]}
        accessibilityLabel="Opção anterior"
      >
        <ChevronLeft size={16} color={canGoPrevious ? Colors.primary600 : Colors.gray300} />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.sliderScroll}
      >
        {orderedOptions.map((option) => {
          const isActive = option.value === selectedValue;
          return (
            <AnimatedTouchable
              key={option.value || 'all'}
              scaleTo={0.92}
              activeOpacity={1}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(option.value)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {option.label}
              </Text>
            </AnimatedTouchable>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        onPress={onNext}
        disabled={!canGoNext}
        style={[styles.arrowBtn, !canGoNext && styles.arrowBtnDisabled]}
        accessibilityLabel="Próxima opção"
      >
        <ChevronRight size={16} color={canGoNext ? Colors.primary600 : Colors.gray300} />
      </TouchableOpacity>
    </View>
  );
}

export function FilterBar() {
  const {
    filters: { month, type, category, search, startDate, endDate },
    setMonth,
    setType,
    setCategory,
    setSearch,
    resetFilters,
  } = useTransactionFilters();
  const isAllMonths = month === '' && !startDate && !endDate;
  const months = getLastMonths(6);
  const categories = [...new Set([...CREDIT_CATEGORIES, ...DEBIT_CATEGORIES])];
  const monthOptions = [
    { value: '', label: 'Todos os meses' },
    ...months,
  ];
  const categoryOptions = [
    { value: '', label: 'Todas' },
    ...categories.map((value) => ({ value, label: value })),
  ];
  const monthIndex = months.findIndex((item) => item.value === month);
  const categoryIndex = categories.findIndex((item) => item === category);

  return (
    <View style={styles.container}>
      {/* Search */}
      <FloatInput
        label="Buscar transação..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Month filter */}
      <Text style={styles.sectionLabel}>Mês</Text>
      <FilterSlider
        options={monthOptions}
        selectedValue={isAllMonths ? '' : month || '__period__'}
        onSelect={setMonth}
        onPrevious={() => setMonth(monthIndex < 0 ? months[0].value : months[monthIndex - 1]?.value ?? month)}
        onNext={() => monthIndex >= 0 && monthIndex < months.length - 1 && setMonth(months[monthIndex + 1].value)}
        canGoPrevious={monthIndex < 0 || monthIndex > 0}
        canGoNext={monthIndex >= 0 && monthIndex < months.length - 1}
      />

      <Text style={styles.sectionLabel}>Período (DD/MM/AAAA)</Text>
      <DateRangeFilter />

      {/* Type filter */}
      <Text style={styles.sectionLabel}>Tipo</Text>
      <View style={styles.typeRow}>
        {([['all', 'Todos'], ['Credit', 'Entradas ↑'], ['Debit', 'Saídas ↓']] as const).map(
          ([val, label]) => (
            <AnimatedTouchable
              key={val}
              scaleTo={0.95}
              activeOpacity={1}
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
              onPress={() => setType(val)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  type === val && { color: Colors.gray800, fontWeight: FontWeight.bold },
                ]}
              >
                {label}
              </Text>
            </AnimatedTouchable>
          )
        )}
      </View>

      {/* Category filter */}
      <Text style={styles.sectionLabel}>Categoria</Text>
      <FilterSlider
        options={categoryOptions}
        selectedValue={category}
        onSelect={setCategory}
        onPrevious={() => categoryIndex >= 0 && categoryIndex < categories.length - 1 && setCategory(categories[categoryIndex + 1])}
        onNext={() => setCategory(categoryIndex < 0 ? categories[0] : categories[categoryIndex - 1] ?? category)}
        canGoPrevious={categoryIndex >= 0 && categoryIndex < categories.length - 1}
        canGoNext={categoryIndex < 0 || categoryIndex > 0}
      />

      {/* Reset */}
      <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
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
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  sliderScroll: {
    flex: 1,
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary100,
    borderWidth: 1,
    borderColor: Colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
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
    marginHorizontal:Spacing.two,
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
    paddingHorizontal: Spacing.four,
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
