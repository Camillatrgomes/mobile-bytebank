import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

interface InvestmentsPieChartProps {
  data: { name: string; value: number }[];
}

const CHART_COLORS = Colors.chartColors;
const screenWidth = Dimensions.get('window').width;

export function InvestmentsPieChart({ data }: InvestmentsPieChartProps) {
  const chartData = data.map((d, i) => ({
    name: d.name,
    population: d.value,
    color: CHART_COLORS[i % CHART_COLORS.length],
    legendFontColor: Colors.gray700,
    legendFontSize: 12,
  }));

  const total = chartData.reduce((s, d) => s + d.population, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Distribuição por Categoria</Text>

      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma transação neste período.</Text>
          <Text style={styles.emptySubtext}>Selecione outro mês ou registre transações.</Text>
        </View>
      ) : (
        <>
          <View style={styles.chartWrapper}>
            <PieChart
              data={chartData}
              width={screenWidth - Spacing.four * 2 - Spacing.six * 2}
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
              center={[screenWidth / 4 - Spacing.four - Spacing.six, 0]}
              hasLegend={false}
            />
          </View>

          <View style={styles.breakdownList}>
            {chartData.map((d) => (
              <View key={d.name} style={styles.breakdownRow}>
                <View style={[styles.dot, { backgroundColor: d.color }]} />
                <Text style={styles.breakdownName} numberOfLines={1}>{d.name}</Text>
                <Text style={styles.breakdownPct}>
                  {total > 0 ? Math.round((d.population / total) * 100) : 0}%
                </Text>
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
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
    marginBottom: Spacing.four,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  emptyState: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: Colors.gray500,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    color: Colors.gray400,
    fontSize: FontSize.xs,
    textAlign: 'center',
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
  },
  breakdownPct: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    width: 32,
    textAlign: 'right',
  },
});