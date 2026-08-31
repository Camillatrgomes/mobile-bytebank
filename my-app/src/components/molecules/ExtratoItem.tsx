import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/atoms/Badge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import type { IApiTransaction } from '@/hooks/useAccount';

interface ExtratoItemProps {
  transaction: IApiTransaction;
  onPress?: () => void;
}

export function ExtratoItem({ transaction, onPress }: ExtratoItemProps) {
  const isCredit = transaction.type === 'Credit';
  const description = transaction.to ?? transaction.from ?? transaction.category ?? 'Transação';

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.typeIndicator, { backgroundColor: isCredit ? '#dcfce7' : '#fee2e2' }]}>
        {isCredit ? (
          <ArrowUpRight color={Colors.income} size={20} />
        ) : (
          <ArrowDownRight color={Colors.expense} size={20} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <View style={styles.meta}>
          {transaction.category && (
            <Badge
              label={transaction.category}
              variant={isCredit ? 'income' : 'expense'}
            />
          )}
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
      </View>

      <Text style={[styles.value, { color: isCredit ? Colors.income : Colors.expense }]}>
        {isCredit ? '+' : '-'} {formatCurrency(transaction.value)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typeArrow: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  description: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.gray800,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
  },
  value: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    flexShrink: 0,
  },
});
