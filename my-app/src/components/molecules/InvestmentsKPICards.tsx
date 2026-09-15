import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';

interface InvestmentsKPICardsProps {
  receitas: number;
  despesas: number;
  lucro: number;
}

interface KPICardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  prefix?: string;
  valueColor: string;
}

function KPICard({ label, value, icon, iconBg, borderColor, prefix = '', valueColor }: KPICardProps) {
  return (
    <View style={[styles.kpiCard, { borderColor }]}>
      <View style={[styles.iconBg, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.textArea}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={[styles.kpiValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
          {prefix}{formatCurrency(value)}
        </Text>
      </View>
    </View>
  );
}

export function InvestmentsKPICards({ receitas, despesas, lucro }: InvestmentsKPICardsProps) {
  const isPositive = lucro >= 0;
  return (
    <View style={styles.row}>
      <KPICard
        label="Receitas"
        value={receitas}
        valueColor={Colors.income}
        iconBg="#dcfce7"
        borderColor="#bbf7d0"
        icon={<TrendingUp size={20} color={Colors.income} />}
      />
      <KPICard
        label="Despesas"
        value={despesas}
        valueColor={Colors.expense}
        iconBg="#fee2e2"
        borderColor="#fecaca"
        icon={<TrendingDown size={20} color={Colors.expense} />}
      />
      <KPICard
        label="Economia"
        value={Math.abs(lucro)}
        valueColor={isPositive ? Colors.investmentDark : Colors.expense}
        iconBg={isPositive ? '#d1fae5' : '#fee2e2'}
        borderColor={isPositive ? '#a7f3d0' : '#fecaca'}
        prefix={isPositive ? '+' : '-'}
        icon={<Wallet size={20} color={isPositive ? Colors.investmentDark : Colors.expense} />}
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
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'flex-start',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    gap: 3,
    width: '100%',
  },
  kpiLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
  },
  kpiValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
