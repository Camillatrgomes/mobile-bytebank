import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';
import type { IApiTransaction } from '@/hooks/useAccount';

interface DespesasPorCategoriaChartProps {
  transactions: IApiTransaction[];
}

const CHART_COLORS = Colors.chartColors;
const screenWidth = Dimensions.get('window').width;

export function DespesasPorCategoriaChart({ transactions }: DespesasPorCategoriaChartProps) {
  const debits = transactions.filter((t) => t.type === 'Debit' && t.category);

  // Group by category
  const grouped: Record<string, number> = {};
  debits.forEach((t) => {
    const cat = t.category!;
    grouped[cat] = (grouped[cat] ?? 0) + Math.abs(t.value);
  });

  const data = Object.entries(grouped).map(([name, value], i) => ({
    name,
    population: value,
    color: CHART_COLORS[i % CHART_COLORS.length],
    legendFontColor: Colors.gray700,
    legendFontSize: 12,
  }));

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sem despesas categorizadas</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Despesas por Categoria</Text>
      <PieChart
        data={data}
        width={screenWidth - Spacing.eight * 2}
        height={180}
        chartConfig={{
          color: () => Colors.primary600,
          labelColor: () => Colors.gray700,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
        hasLegend
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
    marginBottom: Spacing.three,
    alignSelf: 'flex-start',
  },
  empty: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.gray400,
    fontSize: FontSize.md,
  },
});
