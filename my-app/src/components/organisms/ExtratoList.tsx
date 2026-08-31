import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ExtratoItem } from '@/components/molecules/ExtratoItem';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import type { IApiTransaction } from '@/hooks/useAccount';

interface ExtratoListProps {
  transactions: IApiTransaction[];
  isLoading?: boolean;
  compact?: boolean; // compact mode: show only 5 items (for dashboard preview)
  emptyMessage?: string;
}

export function ExtratoList({
  transactions,
  isLoading,
  compact = false,
  emptyMessage = 'Nenhuma transação encontrada',
}: ExtratoListProps) {
  const router = useRouter();
  const data = compact ? transactions.slice(0, 5) : transactions;

  if (isLoading) {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => (
        <ExtratoItem
          transaction={item}
          onPress={() =>
            // @ts-ignore — dynamic route with typed routes requires object form
            router.push(`/(app)/transactions/${item.id}`)
          }
        />
      )}
      contentContainerStyle={styles.list}
      scrollEnabled={!compact}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  skeletonContainer: {
    gap: Spacing.three,
  },
  empty: {
    paddingVertical: Spacing.eight,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.gray400,
    fontWeight: FontWeight.medium,
  },
});
