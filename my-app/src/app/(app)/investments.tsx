import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/organisms/Header';
import { InvestmentsKPICards } from '@/components/molecules/InvestmentsKPICards';
import { InvestmentsPieChart } from '@/components/organisms/InvestmentsPieChart';
import { InvestmentsTable } from '@/components/organisms/InvestmentsTable';
import { FadeInView } from '@/components/atoms/FadeInView';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { useTransactionList } from '@/hooks/useTransactionList';
import { getLastMonths } from '@/lib/formatters';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { PiggyBank } from 'lucide-react-native';

const FULL_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function InvestmentsScreen() {
  const months = getLastMonths(6);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);

  const { transactions, receitas, despesas, lucro, byCategory, isLoading, mutate } =
    useTransactionList(selectedMonth);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />}
      >
        {/* Header card like MFE */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>Meus investimentos</Text>
          <View style={styles.monthFilterRow}>
            <Text style={styles.filterLabel}>Filtrar por mês</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthScroll}
            >
              {months.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.monthChip, selectedMonth === m.value && styles.monthChipActive]}
                  onPress={() => setSelectedMonth(m.value)}
                >
                  <Text style={[styles.monthChipText, selectedMonth === m.value && styles.monthChipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {isLoading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </>
        ) : transactions.length === 0 ? (
          /* Empty state matching MFE */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBg}>
              <PiggyBank size={28} color={Colors.primary600} />
            </View>
            <Text style={styles.emptyTitle}>Você ainda não tem transações para analisar</Text>
            <Text style={styles.emptySubtext}>
              Registre receitas e despesas na página inicial para ver seus investimentos aqui.
            </Text>
          </View>
        ) : (
          /* A key faz o bloco remontar a cada troca de mês, reexecutando a
             animação de entrada — é essa a transição entre seções. */
          <React.Fragment key={selectedMonth}>
            {/* KPI Cards */}
            <FadeInView delay={0}>
              <InvestmentsKPICards receitas={receitas} despesas={despesas} lucro={lucro} />
            </FadeInView>

            {/* Pie Chart */}
            <FadeInView delay={80}>
              <InvestmentsPieChart data={byCategory} />
            </FadeInView>

            {/* Table */}
            <FadeInView delay={160}>
              <InvestmentsTable transactions={transactions} />
            </FadeInView>
          </React.Fragment>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.secondary600,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.four,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8f0d5',
    gap: Spacing.three,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.investmentDark,
  },
  monthFilterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
  },
  monthScroll: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  monthChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  monthChipActive: {
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary600,
  },
  monthChipText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
  },
  monthChipTextActive: {
    color: Colors.primary700,
    fontWeight: FontWeight.semibold,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
});
