import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTransactionFilters } from '@/contexts/TransactionsContext';
import { FloatInput } from '@/components/atoms/FloatInput';
import { formatDateInput, maskDateInput, parseDateInput } from '@/lib/formatters';
import { Spacing } from '@/constants/theme';

const DATE_LENGTH = 10;

export function DateRangeFilter() {
  const {
    filters: { startDate, endDate },
    setDateRange,
  } = useTransactionFilters();

  const [start, setStart] = useState(() => formatDateInput(startDate));
  const [end, setEnd] = useState(() => formatDateInput(endDate));
  const [applied, setApplied] = useState({ startDate, endDate });

  // Reflete limpezas feitas fora daqui, como o chip de mês e "Limpar filtros".
  if (applied.startDate !== startDate || applied.endDate !== endDate) {
    setApplied({ startDate, endDate });
    setStart(formatDateInput(startDate));
    setEnd(formatDateInput(endDate));
  }

  const parsedStart = parseDateInput(start);
  const parsedEnd = parseDateInput(end);
  const startError = start.length === DATE_LENGTH && !parsedStart ? 'Data inválida' : undefined;
  const endError =
    end.length === DATE_LENGTH && !parsedEnd
      ? 'Data inválida'
      : parsedStart && parsedEnd && parsedStart > parsedEnd
        ? 'Antes da data inicial'
        : undefined;

  function handleChange(nextStart: string, nextEnd: string) {
    setStart(nextStart);
    setEnd(nextEnd);

    const nextStartDate = nextStart ? parseDateInput(nextStart) : null;
    const nextEndDate = nextEnd ? parseDateInput(nextEnd) : null;
    const isComplete = (!nextStart || nextStartDate) && (!nextEnd || nextEndDate);
    const isOrdered = !nextStartDate || !nextEndDate || nextStartDate <= nextEndDate;
    const hasChanged = nextStartDate !== startDate || nextEndDate !== endDate;

    if (isComplete && isOrdered && hasChanged) {
      setDateRange(nextStartDate, nextEndDate);
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <FloatInput
          label="De"
          value={start}
          onChangeText={(v) => handleChange(maskDateInput(v), end)}
          keyboardType="number-pad"
          maxLength={DATE_LENGTH}
          error={startError}
        />
      </View>
      <View style={styles.field}>
        <FloatInput
          label="Até"
          value={end}
          onChangeText={(v) => handleChange(start, maskDateInput(v))}
          keyboardType="number-pad"
          maxLength={DATE_LENGTH}
          error={endError}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  field: {
    flex: 1,
  },
});
