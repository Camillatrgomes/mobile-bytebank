import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ExtratoItem } from '@/components/molecules/ExtratoItem';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { ExtratoCardHeader, ExtratoEmptyState, extratoStyles } from './ExtratoList';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import type { IApiTransaction } from '@/hooks/useAccount';

interface ExtratoListInfiniteProps {
  transactions: IApiTransaction[];
  isLoading?: boolean;
  /** Há mais páginas além do que já foi carregado. */
  hasMore?: boolean;
  /** Carregamento da próxima página em andamento. */
  isLoadingMore?: boolean;
  /** Chamado ao chegar perto do fim da lista. */
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
  onNewTransaction?: () => void;
}

/**
 * Extrato completo com scroll infinito.
 *
 * A FlatList é o único container rolável desta árvore — o card ao redor é uma
 * View comum. Aninhar a FlatList dentro de um ScrollView vertical dispararia o
 * aviso "VirtualizedLists should never be nested" e, pior, desligaria a
 * virtualização, que é justamente o ponto de trocar o .map() por FlatList.
 */
export function ExtratoListInfinite({
  transactions,
  isLoading,
  hasMore = false,
  isLoadingMore = false,
  onEndReached,
  onRefresh,
  refreshing = false,
  emptyMessage,
  onNewTransaction,
}: ExtratoListInfiniteProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={[extratoStyles.card, styles.fill]}>
        <ExtratoCardHeader />
        <View style={extratoStyles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={extratoStyles.skeletonRow}>
              <SkeletonCard lines={2} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[extratoStyles.card, styles.fill]}>
      <ExtratoCardHeader />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExtratoItem
            transaction={item}
            onPress={() =>
              // @ts-ignore
              router.push(`/(app)/transactions/${item.id}`)
            }
          />
        )}
        contentContainerStyle={[
          extratoStyles.transactionsList,
          transactions.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={hasMore ? onEndReached : undefined}
        onEndReachedThreshold={0.4}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        ListEmptyComponent={
          <ExtratoEmptyState message={emptyMessage} onNewTransaction={onNewTransaction} />
        }
        ListFooterComponent={
          hasMore || isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={Colors.primary600} />
            </View>
          ) : transactions.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Fim do extrato</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
});
