import { lazy, Suspense, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/organisms/Header';
import { SaldoDashboard } from '@/components/organisms/SaldoDashboard';
import { ReceitasDespesasCard } from '@/components/molecules/ReceitasDespesasCard';
import { ExtratoList } from '@/components/organisms/ExtratoList';
import { TransactionForm } from '@/components/organisms/TransactionForm';
import { Button } from '@/components/atoms/Button';
import { FadeInView } from '@/components/atoms/FadeInView';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { useAccountData, useAccountSummary, useTransactionForm } from '@/stores/selectors';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

const DespesasPorCategoriaChart = lazy(() =>
  import('@/components/organisms/DespesasPorCategoriaChart').then((m) => ({
    default: m.DespesasPorCategoriaChart,
  })),
);

export default function HomeScreen() {
  const router = useRouter();
  const { account, transactions, isLoading } = useAccountData();
  const { saldo, receitas, despesas, metaMessage } = useAccountSummary();
  const { openForm } = useTransactionForm();

  useEffect(() => {
    router.prefetch('/transactions');
    router.prefetch('/investments');
  }, [router]);

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
              <Suspense fallback={<SkeletonCard lines={6} />}>
                <DespesasPorCategoriaChart transactions={transactions} />
              </Suspense>
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
      <TransactionForm accountId={account?.id ?? null} />
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
