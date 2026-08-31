import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ExtratoItem } from '@/components/molecules/ExtratoItem';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { Receipt, Plus } from 'lucide-react-native';
import type { IApiTransaction } from '@/hooks/useAccount';

interface ExtratoListProps {
  transactions: IApiTransaction[];
  isLoading?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  onNewTransaction?: () => void;
  showViewAll?: boolean;
}

export function ExtratoList({
  transactions,
  isLoading,
  compact = false,
  emptyMessage = 'Nenhuma transação ainda',
  onNewTransaction,
  showViewAll = false,
}: ExtratoListProps) {
  const router = useRouter();
  const data = compact ? transactions.slice(0, 5) : transactions;

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Extrato</Text>
      </View>

      <View style={styles.divider} />

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <SkeletonCard lines={2} />
            </View>
          ))}
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Receipt size={24} color={Colors.primary600} />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma transação por aqui ainda</Text>
          <Text style={styles.emptySubtext}>
            Que tal registrar sua primeira receita ou despesa?
          </Text>
          {onNewTransaction && (
            <TouchableOpacity style={styles.emptyBtn} onPress={onNewTransaction}>
              <Plus size={14} color={Colors.white} />
              <Text style={styles.emptyBtnText}>Nova transação</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <View style={styles.transactionsList}>
            {data.map((item) => (
              <ExtratoItem
                key={item.id}
                transaction={item}
                onPress={() =>
                  // @ts-ignore
                  router.push(`/(app)/transactions/${item.id}`)
                }
              />
            ))}
          </View>

          {showViewAll && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/(app)/transactions')}
              >
                <Text style={styles.viewAllText}>Ver todas as transações</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.six,
  },
  skeletonContainer: {
    padding: Spacing.six,
    gap: Spacing.three,
  },
  skeletonRow: {
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: Spacing.six,
    gap: Spacing.three,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.gray700,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary600,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    marginTop: Spacing.two,
  },
  emptyBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  transactionsList: {
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  viewAllBtn: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary600,
  },
});
