import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';

interface InvestmentsPieChartProps {
  data: { name: string; value: number }[];
}

const CHART_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#2563EB'];
const screenWidth = Dimensions.get('window').width;

export function InvestmentsPieChart({ data }: InvestmentsPieChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sem dados para exibir</Text>
      </View>
    );
  }

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
      <PieChart
        data={chartData}
        width={screenWidth - Spacing.eight * 2}
        height={200}
        chartConfig={{
          color: () => Colors.primary600,
          labelColor: () => Colors.gray700,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
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
