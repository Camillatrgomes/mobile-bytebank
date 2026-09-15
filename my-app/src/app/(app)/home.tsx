import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/organisms/Header';
import { SaldoDashboard } from '@/components/organisms/SaldoDashboard';
import { ReceitasDespesasCard } from '@/components/molecules/ReceitasDespesasCard';
import { ExtratoList } from '@/components/organisms/ExtratoList';
import { DespesasPorCategoriaChart } from '@/components/organisms/DespesasPorCategoriaChart';
import { TransactionForm } from '@/components/organisms/TransactionForm';
import { Button } from '@/components/atoms/Button';
import { FadeInView } from '@/components/atoms/FadeInView';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { useTransactions } from '@/contexts/TransactionsContext';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

export default function HomeScreen() {
  const {
    transactions,
    saldo,
    receitas,
    despesas,
    accountId,
    isLoading,
    mutate,
    metaMessage,
    openForm,
  } = useTransactions();

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
            <FadeInView delay={0}>
              <SaldoDashboard saldo={saldo} metaMessage={metaMessage}>
                <ReceitasDespesasCard receitas={receitas} despesas={despesas} />
              </SaldoDashboard>
            </FadeInView>

            {/* New Transaction Button */}
            <FadeInView delay={80}>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onPress={openForm}
              >
                + Nova Transação
              </Button>
            </FadeInView>

            {/* Expenses Chart */}
            <FadeInView delay={160}>
              <DespesasPorCategoriaChart transactions={transactions} />
            </FadeInView>

            {/* Recent Transactions */}
            <FadeInView delay={240} style={styles.section}>
              <ExtratoList
                transactions={recentTransactions}
                compact
                emptyMessage="Nenhuma transação ainda"
              />
            </FadeInView>
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
