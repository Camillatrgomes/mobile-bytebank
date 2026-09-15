import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { ITransaction } from '../../hooks/useTransactionList';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

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

/** Animated chip that pulses when selected */
function WeekChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
    onPress();
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.weekChip, isActive && styles.weekChipActive, { transform: [{ scale }] }]}>
        <Text style={[styles.weekChipText, isActive && styles.weekChipTextActive]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** Slide + fade animation when chart content changes */
function AnimatedChartContainer({ children, weekKey }: { children: React.ReactNode; weekKey: string | null }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const prevKey = useRef(weekKey);

  useEffect(() => {
    if (prevKey.current === weekKey) return;
    prevKey.current = weekKey;

    // Slide out left, then slide in from right
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(translateX, { toValue: -20, duration: 120, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.spring(translateX, { toValue: 0, friction: 7, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
    ]).start();
  }, [weekKey]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
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
  const activeWeekIndex = availableWeeks.findIndex((week) => week.key === activeWeekKey);
  const orderedWeeks = activeWeekIndex > 0
    ? [availableWeeks[activeWeekIndex], ...availableWeeks.slice(activeWeekIndex + 1), ...availableWeeks.slice(0, activeWeekIndex)]
    : availableWeeks;
  const canGoPreviousWeek = activeWeekIndex >= 0 && activeWeekIndex < availableWeeks.length - 1;
  const canGoNextWeek = activeWeekIndex > 0;

  function goToPreviousWeek() {
    if (canGoPreviousWeek) setSelectedWeekKey(availableWeeks[activeWeekIndex + 1].key);
  }

  function goToNextWeek() {
    if (canGoNextWeek) setSelectedWeekKey(availableWeeks[activeWeekIndex - 1].key);
  }

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
        <View style={styles.weekSlider}>
          <Pressable
            onPress={goToPreviousWeek}
            disabled={!canGoPreviousWeek}
            style={[styles.arrowBtn, !canGoPreviousWeek && styles.arrowBtnDisabled]}
            accessibilityLabel="Semana mais antiga"
          >
            <ChevronLeft size={16} color={canGoPreviousWeek ? COLORS.primary : '#D1D5DB'} />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.weekSelector}
            contentContainerStyle={styles.weekSelectorContent}
          >
            {orderedWeeks.map((w) => (
              <WeekChip
                key={w.key}
                label={w.label}
                isActive={w.key === activeWeekKey}
                onPress={() => setSelectedWeekKey(w.key)}
              />
            ))}
          </ScrollView>

          <Pressable
            onPress={goToNextWeek}
            disabled={!canGoNextWeek}
            style={[styles.arrowBtn, !canGoNextWeek && styles.arrowBtnDisabled]}
            accessibilityLabel="Semana mais recente"
          >
            <ChevronRight size={16} color={canGoNextWeek ? COLORS.primary : '#D1D5DB'} />
          </Pressable>
        </View>
      ) : (
        <Text style={styles.emptyText}>Nenhuma transação no mês</Text>
      )}

      <View style={styles.legendRow}>
        <LegendDot color={COLORS.primary} label="Receitas" />
        <LegendDot color={COLORS.secondary} label="Despesas" />
      </View>

      <AnimatedChartContainer weekKey={activeWeekKey}>
        {maxValue > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              key={activeWeekKey ?? 'empty'}
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
      </AnimatedChartContainer>
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
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4d6418',
  },
  weekSelector: {
    flex: 1,
  },
  weekSelectorContent: {
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  weekSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDE9BD',
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
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