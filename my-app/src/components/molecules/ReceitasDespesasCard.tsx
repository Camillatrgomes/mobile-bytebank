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
      {/* Receitas */}
      <View style={styles.item}>
        <View style={styles.labelRow}>
          <View style={[styles.iconBg, { backgroundColor: '#dcfce7' }]}>
            <ArrowUpCircle size={18} color={Colors.income} />
          </View>
          <Text style={styles.label}>Receitas</Text>
        </View>
        <Text style={[styles.value, { color: Colors.income }]}>
          {formatCurrency(receitas)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <View style={styles.labelRow}>
          <View style={[styles.iconBg, { backgroundColor: '#fee2e2' }]}>
            <ArrowDownCircle size={18} color={Colors.expense} />
          </View>
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
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  item: {
    flex: 1,
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    paddingLeft: 5, 
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.three,
  },
});
