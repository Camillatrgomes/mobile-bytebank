import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';
import type { IApiTransaction } from '@/hooks/useAccount';
import { AlignCenter } from 'lucide-react-native';

interface DespesasPorCategoriaChartProps {
  transactions: IApiTransaction[];
  isLoading?: boolean;
}

const CHART_COLORS = Colors.chartColors;
const screenWidth = Dimensions.get('window').width;

export function DespesasPorCategoriaChart({ transactions, isLoading }: DespesasPorCategoriaChartProps) {
  const { data, total } = useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.filter(t => t.type === 'Debit').forEach(t => {
      const cat = t.category?.trim() || 'Outros';
      grouped[cat] = (grouped[cat] ?? 0) + Math.abs(t.value);
    });
    const entries = Object.entries(grouped)
      .map(([name, value], i) => ({
        name,
        population: value,
        color: CHART_COLORS[i % CHART_COLORS.length],
        legendFontColor: Colors.gray700,
        legendFontSize: 12,
      }))
      .sort((a, b) => b.population - a.population);
    const total = entries.reduce((s, d) => s + d.population, 0);
    return { data: entries, total };
  }, [transactions]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Despesas por categoria</Text>

      {isLoading ? (
        <View style={styles.loadingPlaceholder} />
      ) : data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma despesa registrada ainda.</Text>
          <Text style={styles.emptySubtext}>
            Registre uma saída para ver a distribuição por categoria.
          </Text>
        </View>
      ) : (
        <>
<View style={styles.chartWrapper}>
  <PieChart
    data={data}
    width={screenWidth - Spacing.five * 2 - Spacing.six * 2}
    height={200}
    chartConfig={{
      color: () => Colors.primary600,
      labelColor: () => Colors.gray700,
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
    }}
    accessor="population"
    backgroundColor="transparent"
    paddingLeft="0"
    center={[screenWidth / 4 - Spacing.five - Spacing.six, 0]}
    absolute={false}
    hasLegend={false}
  />
</View>

<View style={styles.breakdownList}>
            {data.map((d, i) => (
              <View key={d.name} style={styles.breakdownRow}>
                <View style={[styles.dot, { backgroundColor: d.color }]} />
                <Text style={styles.breakdownName} numberOfLines={1}>{d.name}</Text>
                <Text style={styles.breakdownPct}>
                  {total > 0 ? Math.round((d.population / total) * 100) : 0}%
                </Text>
                <Text style={styles.breakdownValue}>{formatCurrency(d.population)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: Spacing.six,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
    marginBottom: Spacing.four,
  },
  loadingPlaceholder: {
    height: 200,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
  },
  emptyState: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: Colors.gray400,
    fontStyle: 'italic',
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    color: Colors.gray400,
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  breakdownList: {
    marginTop: Spacing.three,
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: Spacing.three,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  breakdownName: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.gray700,
    fontWeight: FontWeight.medium,
    fontFamily: 'Inter_400Regular',
  },
  breakdownPct: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    width: 52,
    textAlign: 'left',
    fontFamily: 'Inter_400Regular',
  },
  breakdownValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.gray800,
    width: 100,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
});
