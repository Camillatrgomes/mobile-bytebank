import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Picker } from '@react-native-picker/picker';
import type { ITransaction } from '../../hooks/useTransactionList';

const COLORS = {
  primary: '#6B8E23', // receita
  secondary: '#EB0E0E', // despesa
  textMain: '#474A51',
  textLight: '#8B8B8B',
  grid: '#E5ECD4',
  background: '#FFFFFF',
};

const daysLabel = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${fmt(weekStart)} – ${fmt(end)}`;
}

interface Props {
  transactions: ITransaction[];
}

export function InvestmentsTable({ transactions }: Props) {
  const availableWeeks = useMemo(() => {
    const weekMap = new Map<string, Date>();
    transactions.forEach((t) => {
      const start = getWeekStart(new Date(t.date));
      const key = start.toISOString();
      if (!weekMap.has(key)) weekMap.set(key, start);
    });
    return Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, date]) => ({ key, date, label: formatWeekLabel(date) }));
  }, [transactions]);

  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null);
  const activeWeekKey = selectedWeekKey ?? availableWeeks.at(-1)?.key ?? null;

  // dados brutos por dia (mesma lógica do Next)
  const rawData = useMemo(() => {
    const dataMap = daysLabel.map((day) => ({ name: day, receita: 0, despesa: 0 }));
    if (!activeWeekKey) return dataMap;

    const weekStart = new Date(activeWeekKey);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    transactions
      .filter((t) => {
        const d = new Date(t.date);
        return d >= weekStart && d < weekEnd;
      })
      .forEach((t) => {
        const dayIndex = new Date(t.date).getDay();
        if (t.type === 'deposito') dataMap[dayIndex].receita += Number(t.amount);
        else dataMap[dayIndex].despesa += Number(t.amount);
      });
    return dataMap;
  }, [transactions, activeWeekKey]);

  // gifted-charts monta grupos intercalando barras + espaçamento
  // (equivalente a duas <Bar> do Recharts lado a lado)
  const chartData = useMemo(() => {
    return rawData.flatMap((d) => [
      {
        value: d.receita,
        label: d.name,
        frontColor: COLORS.primary,
        spacing: 2,
        labelTextStyle: { color: COLORS.textLight, fontSize: 11 },
      },
      {
        value: d.despesa,
        frontColor: COLORS.secondary,
        spacing: 18,
      },
    ]);
  }, [rawData]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo semanal</Text>

        {availableWeeks.length > 0 ? (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={activeWeekKey}
              onValueChange={(value) => setSelectedWeekKey(value)}
              style={styles.picker}
              dropdownIconColor={COLORS.textLight}
            >
              {availableWeeks.map((w) => (
                <Picker.Item key={w.key} label={w.label} value={w.key} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhuma transação no mês</Text>
        )}
      </View>

      <View style={styles.legendRow}>
        <LegendDot color={COLORS.primary} label="Receitas" />
        <LegendDot color={COLORS.secondary} label="Despesas" />
      </View>

      <BarChart
        data={chartData}
        barWidth={14}
        barBorderRadius={4}
        height={200}
        noOfSections={4}
        yAxisTextStyle={{ color: COLORS.textLight, fontSize: 11 }}
        yAxisLabelPrefix="R$"
        xAxisColor={COLORS.grid}
        yAxisColor={COLORS.grid}
        rulesColor={COLORS.grid}
        rulesType="dashed"
        isAnimated
        animationDuration={800}
        renderTooltip={(item: { value: number }) => (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>
              R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4d6418',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: 140,
    height: 36,
    color: COLORS.textMain,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    padding: 2,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECD4',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
});