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
  <View>
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
      </View>
         <View style={styles.card}>

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
  </View>


  
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    flexDirection: 'row',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 0,
    margin: 12,
  },
  item: {
    flex: 1,
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
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
    paddingLeft: 38, // aligns below icon+gap
  },
  divider: {
    width: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.three,
    marginVertical: 2,
  },
});
