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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Distribuição por Categoria</Text>

      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma transação neste período.</Text>
          <Text style={styles.emptySubtext}>Selecione outro mês ou registre transações.</Text>
        </View>
      ) : (
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
          paddingLeft="15"
          hasLegend
        />
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
});
