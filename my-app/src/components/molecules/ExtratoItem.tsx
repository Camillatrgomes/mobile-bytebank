import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedTouchable } from '@/components/atoms/AnimatedTouchable';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import type { IApiTransaction } from '@/hooks/useAccount';

interface ExtratoItemProps {
  transaction: IApiTransaction;
  onPress?: () => void;
}

export function ExtratoItem({ transaction, onPress }: ExtratoItemProps) {
  const isCredit = transaction.type === 'Credit';
  const label = transaction.category || (isCredit ? 'Entrada' : 'Saída');

  return (
    <AnimatedTouchable
      scaleTo={0.97}
      activeOpacity={0.85}
      style={styles.item}
      onPress={onPress}
    >
      {/* Left: icon */}
      <View style={[styles.iconBg, isCredit ? styles.iconBgCredit : styles.iconBgDebit]}>
        {isCredit
          ? <ArrowUpRight color={Colors.income} size={18} />
          : <ArrowDownRight color={Colors.expense} size={18} />
        }
      </View>

      {/* Center: label + date */}
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>

      {/* Right: value */}
      <Text style={[styles.value, isCredit ? styles.valueCredit : styles.valueDebit]}>
        {isCredit ? '+ ' : '- '}{formatCurrency(Math.abs(transaction.value))}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: Spacing.three,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBgCredit: {
    backgroundColor: '#dcfce7',
  },
  iconBgDebit: {
    backgroundColor: '#fee2e2',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.gray700,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    flexShrink: 0,
  },
  valueCredit: {
    color: Colors.income,
  },
  valueDebit: {
    color: Colors.expense,
  },
});
