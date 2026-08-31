import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/atoms/Badge';
import type { ITransaction } from '@/hooks/useTransactionList';

interface InvestmentsTableProps {
  transactions: ITransaction[];
}

export function InvestmentsTable({ transactions }: InvestmentsTableProps) {
  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhuma transação no período</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Transações</Text>

      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerText, { flex: 2 }]}>Descrição</Text>
        <Text style={[styles.cell, styles.headerText]}>Tipo</Text>
        <Text style={[styles.cell, styles.headerText, { textAlign: 'right' }]}>Valor</Text>
      </View>

      <ScrollView style={styles.tableBody} nestedScrollEnabled>
        {transactions.map((t) => (
          <View key={t.id} style={[styles.row, styles.dataRow]}>
            <View style={{ flex: 2 }}>
              <Text style={styles.desc} numberOfLines={1}>
                {t.description || t.category}
              </Text>
              <Text style={styles.date}>{formatDate(t.date)}</Text>
            </View>
            <View style={styles.cell}>
              <Badge
                label={t.type === 'deposito' ? 'Entrada' : 'Saída'}
                variant={t.type === 'deposito' ? 'income' : 'expense'}
              />
            </View>
            <Text
              style={[
                styles.cell,
                styles.amount,
                { color: t.type === 'deposito' ? Colors.income : Colors.expense, textAlign: 'right' },
              ]}
            >
              {t.type === 'deposito' ? '+' : '-'}{formatCurrency(t.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>
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
    color: Colors.gray800,
    marginBottom: Spacing.three,
  },
  tableBody: {
    maxHeight: 300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  headerRow: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.gray200,
    marginBottom: Spacing.one,
  },
  dataRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.gray800,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
