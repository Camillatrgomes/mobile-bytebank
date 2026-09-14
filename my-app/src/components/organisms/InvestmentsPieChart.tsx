import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface InvestmentsPieChartProps {
  data: { name: string; value: number }[];
}

const CHART_COLORS = Colors.chartColors;
const screenWidth = Dimensions.get('window').width;

/** Staggered slide-in + fade for each legend row */
function AnimatedRow({ children, index }: { children: React.ReactNode; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-24)).current;

  useEffect(() => {
    const delay = index * 55;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        friction: 7,
        tension: 80,
        delay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
}

export function InvestmentsPieChart({ data }: InvestmentsPieChartProps) {
  const chartData = data.map((d, i) => ({
    name: d.name,
    population: d.value,
    color: CHART_COLORS[i % CHART_COLORS.length],
    legendFontColor: Colors.gray700,
    legendFontSize: 12,
  }));

  const total = chartData.reduce((s, d) => s + d.population, 0);

  const chartScale = useRef(new Animated.Value(0.75)).current;
  const chartOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (data.length === 0) return;
    Animated.parallel([
      Animated.spring(chartScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(chartOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [data.length]);

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
          <Animated.View
            style={[
              styles.chartWrapper,
              { opacity: chartOpacity, transform: [{ scale: chartScale }] },
            ]}
          >
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
          </Animated.View>

          <View style={styles.breakdownList}>
            {chartData.map((d, i) => (
              <AnimatedRow key={d.name} index={i}>
                <View style={styles.breakdownRow}>
                  <View style={[styles.dot, { backgroundColor: d.color }]} />
                  <Text style={styles.breakdownName} numberOfLines={1}>{d.name}</Text>
                  <Text style={styles.breakdownPct}>
                    {total > 0 ? Math.round((d.population / total) * 100) : 0}%
                  </Text>
                </View>
              </AnimatedRow>
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
    borderRadius: 16,
    padding: Spacing.six,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
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
    paddingVertical: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    width: 36,
    textAlign: 'right',
    fontWeight: FontWeight.semibold,
  },
});