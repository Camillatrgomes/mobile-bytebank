import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { Header } from '@/components/organisms/Header';
import { SaldoDashboard } from '@/components/organisms/SaldoDashboard';
import { ReceitasDespesasCard } from '@/components/molecules/ReceitasDespesasCard';
import { ExtratoList } from '@/components/organisms/ExtratoList';
import { DespesasPorCategoriaChart } from '@/components/organisms/DespesasPorCategoriaChart';
import { TransactionForm } from '@/components/organisms/TransactionForm';
import { Button } from '@/components/atoms/Button';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { useAccount } from '@/hooks/useAccount';
import { openModal } from '@/store/transactionFormSlice';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import type { AppDispatch } from '@/store';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    transactions,
    saldo,
    receitas,
    despesas,
    accountId,
    isLoading,
    mutate,
    metaMessage,
  } = useAccount();

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header showLogout />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />
        }
      >
        {isLoading ? (
          <>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={2} />
          </>
        ) : (
          <>
            {/* Balance Card */}
            <SaldoDashboard saldo={saldo} metaMessage={metaMessage}>
              <ReceitasDespesasCard receitas={receitas} despesas={despesas} />
            </SaldoDashboard>

            {/* New Transaction Button */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onPress={() => dispatch(openModal())}
            >
              + Nova Transação
            </Button>

            {/* Expenses Chart */}
            <DespesasPorCategoriaChart transactions={transactions} />

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Extrato Recente</Text>
              <ExtratoList
                transactions={recentTransactions}
                compact
                emptyMessage="Nenhuma transação ainda"
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Transaction form modal */}
      <TransactionForm accountId={accountId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
});
