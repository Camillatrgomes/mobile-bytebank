import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
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

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

interface Props {
  transactions: ITransaction[];
}

export function InvestmentsTable({ transactions }: Props) {
  const { width: screenWidth } = useWindowDimensions();

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

  const BAR_WIDTH = 10;
  const GROUP_INNER_SPACING = 4;
  const GROUP_GAP = 20;
  const chartMinWidth =
    daysLabel.length * (BAR_WIDTH * 2 + GROUP_INNER_SPACING + GROUP_GAP);
  const chartWidth = Math.max(chartMinWidth, screenWidth - 64);

  const chartData = useMemo(() => {
    return rawData.flatMap((d) => [
      {
        value: d.receita,
        label: d.name,
        frontColor: COLORS.primary,
        spacing: GROUP_INNER_SPACING,
        labelTextStyle: { color: COLORS.textLight, fontSize: 11 },
      },
      {
        value: d.despesa,
        frontColor: COLORS.secondary,
        spacing: GROUP_GAP,
      },
    ]);
  }, [rawData]);

  const maxValue = Math.max(1, ...rawData.flatMap((d) => [d.receita, d.despesa]));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo semanal</Text>
      </View>

      {availableWeeks.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.weekSelector}
          contentContainerStyle={styles.weekSelectorContent}
        >
          {availableWeeks.map((w) => {
            const isActive = w.key === activeWeekKey;
            return (
              <Pressable
                key={w.key}
                onPress={() => setSelectedWeekKey(w.key)}
                style={[styles.weekChip, isActive && styles.weekChipActive]}
              >
                <Text style={[styles.weekChipText, isActive && styles.weekChipTextActive]}>
                  {w.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>Nenhuma transação no mês</Text>
      )}

      <View style={styles.legendRow}>
        <LegendDot color={COLORS.primary} label="Receitas" />
        <LegendDot color={COLORS.secondary} label="Despesas" />
      </View>

      {maxValue > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={chartData}
            width={chartWidth}
            barWidth={BAR_WIDTH}
            barBorderRadius={4}
            height={220}
            maxValue={maxValue * 1.2}
            noOfSections={4}
            yAxisTextStyle={{ color: COLORS.textLight, fontSize: 11 }}
            yAxisLabelPrefix="R$ "
            xAxisColor={COLORS.grid}
            yAxisColor={COLORS.grid}
            rulesColor={COLORS.grid}
            rulesType="dashed"
            isAnimated
            animationDuration={600}
            renderTooltip={(item: { value: number }) => (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>R$ {formatCurrency(item.value)}</Text>
              </View>
            )}
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Sem movimentações nessa semana</Text>
        </View>
      )}
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
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4d6418',
  },
  weekSelector: {
    marginBottom: 12,
  },
  weekSelectorContent: {
    gap: 8,
    paddingRight: 8,
  },
  weekChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  weekChipActive: {
    backgroundColor: '#6B8E23',
    borderColor: '#6B8E23',
  },
  weekChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  weekChipTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  emptyChart: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
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