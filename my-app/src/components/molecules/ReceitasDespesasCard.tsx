import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';

interface ReceitasDespesasCardProps {
  receitas: number;
  despesas: number;
}

export function ReceitasDespesasCard({ receitas, despesas }: ReceitasDespesasCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.item}>
        <View style={styles.labelRow}>
          <ArrowUpCircle size={16} color={Colors.income} />
          <Text style={styles.label}>Receitas</Text>
        </View>
        <Text style={[styles.value, { color: Colors.income }]}>
          {formatCurrency(receitas)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <View style={styles.labelRow}>
          <ArrowDownCircle size={16} color={Colors.expense} />
          <Text style={styles.label}>Despesas</Text>
        </View>
        <Text style={[styles.value, { color: Colors.expense }]}>
          {formatCurrency(despesas)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  item: {
    flex: 1,
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  arrow: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.income,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.three,
  },
});
