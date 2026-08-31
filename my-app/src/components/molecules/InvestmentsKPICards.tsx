import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';

interface InvestmentsKPICardsProps {
  receitas: number;
  despesas: number;
  lucro: number;
}

interface KPICardProps {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  prefix?: string;
}

function KPICard({ label, value, color, bgColor, prefix = '' }: KPICardProps) {
  return (
    <View style={[styles.kpiCard, { backgroundColor: bgColor }]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>
        {prefix}{formatCurrency(value)}
      </Text>
    </View>
  );
}

export function InvestmentsKPICards({ receitas, despesas, lucro }: InvestmentsKPICardsProps) {
  return (
    <View style={styles.row}>
      <KPICard
        label="Receitas"
        value={receitas}
        color={Colors.income}
        bgColor="#dcfce7"
      />
      <KPICard
        label="Despesas"
        value={despesas}
        color={Colors.expense}
        bgColor="#fee2e2"
      />
      <KPICard
        label="Lucro"
        value={Math.abs(lucro)}
        color={lucro >= 0 ? Colors.investmentDark : Colors.expense}
        bgColor={lucro >= 0 ? '#d1fae5' : '#fee2e2'}
        prefix={lucro >= 0 ? '+' : '-'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  kpiCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
  },
  kpiLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray600,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
});
