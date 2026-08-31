import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/organisms/Header';
import { ExtratoList } from '@/components/organisms/ExtratoList';
import { FilterBar } from '@/components/molecules/FilterBar';
import { Modal } from '@/components/atoms/Modal';
import { useStatement } from '@/hooks/useStatement';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

export default function TransactionsScreen() {
  const { transactions, isLoading, mutate } = useStatement();
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />

      {/* Page title + filter toggle */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Transferências</Text>
        <TouchableOpacity
          onPress={() => setFilterVisible(true)}
          style={styles.filterBtn}
        >
          <Text style={styles.filterBtnText}>⚙️ Filtros</Text>
        </TouchableOpacity>
      </View>

      {/* Count */}
      <Text style={styles.count}>
        {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''} encontrada{transactions.length !== 1 ? 's' : ''}
      </Text>

      <ExtratoList
        transactions={transactions}
        isLoading={isLoading}
        emptyMessage="Nenhuma transação para os filtros selecionados"
      />

      {/* Filter bottom sheet */}
      <Modal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title="Filtrar Transações"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <FilterBar />
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
  },
  filterBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filterBtnText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
    fontWeight: FontWeight.medium,
  },
  count: {
    paddingHorizontal: Spacing.four,
    fontSize: FontSize.sm,
    color: Colors.gray500,
    marginBottom: Spacing.two,
  },
});
