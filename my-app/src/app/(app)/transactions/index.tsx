import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/organisms/Header';
import { ExtratoList } from '@/components/organisms/ExtratoList';
import { FilterBar } from '@/components/molecules/FilterBar';
import { Modal } from '@/components/atoms/Modal';
import { useStatement } from '@/hooks/useStatement';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { SlidersHorizontal } from 'lucide-react-native';

export default function TransactionsScreen() {
  const { transactions, isLoading, mutate } = useStatement();
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />}
      >
        {/* Page title bar card matching MFE */}
        <View style={styles.titleCard}>
          <Text style={styles.title}>Extrato</Text>
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={styles.filterBtn}
          >
            <SlidersHorizontal size={16} color={Colors.primary600} />
            <Text style={styles.filterBtnText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction count */}
        <Text style={styles.count}>
          {transactions.length} transaç{transactions.length !== 1 ? 'ões' : 'ão'} encontrada{transactions.length !== 1 ? 's' : ''}
        </Text>

        <ExtratoList
          transactions={transactions}
          isLoading={isLoading}
          emptyMessage="Nenhuma transação para os filtros selecionados"
        />
      </ScrollView>

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
    backgroundColor: Colors.secondary600,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.three,
  },
  titleCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary300,
  },
  filterBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary600,
    fontWeight: FontWeight.semibold,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    paddingHorizontal: 2,
  },
});
