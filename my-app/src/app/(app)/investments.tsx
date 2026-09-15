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
import { PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function InvestmentsScreen() {
  const months = getLastMonths(6);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);

  const { transactions, receitas, despesas, lucro, byCategory, isLoading, mutate } =
    useTransactionList(selectedMonth);

  const selectedIndex = months.findIndex((m) => m.value === selectedMonth);
  const orderedMonths = [
    ...months.slice(selectedIndex),
    ...months.slice(0, selectedIndex),
  ];
  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < months.length - 1;

  function goToPrevMonth() {
    if (canGoPrev) setSelectedMonth(months[selectedIndex - 1].value);
  }

  function goToNextMonth() {
    if (canGoNext) setSelectedMonth(months[selectedIndex + 1].value);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />}
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>Meus investimentos</Text>

          <View style={styles.monthFilterRow}>
            <Text style={styles.filterLabel}>Filtrar por mês</Text>


            <View style={styles.monthNavRow}>


              <TouchableOpacity
                onPress={goToPrevMonth}
                disabled={!canGoPrev}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.65}
              >
                <View style={[styles.arrowBtn, !canGoPrev && styles.arrowBtnDisabled]}>
                  <ChevronLeft
                    size={16}
                    color={canGoPrev ? Colors.primary600 : Colors.gray300}
                  />
                </View>
              </TouchableOpacity>

              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.monthScroll}
                style={styles.monthScrollView}
              >
                {orderedMonths.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.monthChip, selectedMonth === m.value && styles.monthChipActive]}
                    onPress={() => setSelectedMonth(m.value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.monthChipText, selectedMonth === m.value && styles.monthChipTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={goToNextMonth}
                disabled={!canGoNext}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.65}
              >
                <View style={[styles.arrowBtn, !canGoNext && styles.arrowBtnDisabled]}>
                  <ChevronRight
                    size={16}
                    color={canGoNext ? Colors.primary600 : Colors.gray300}
                  />
                </View>
              </TouchableOpacity>

            </View>
          </View>
        </View>

        {isLoading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </>
        ) : transactions.length === 0 ? (
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
          <React.Fragment key={selectedMonth}>
            <FadeInView delay={0}>
              <InvestmentsKPICards receitas={receitas} despesas={despesas} lucro={lucro} />
            </FadeInView>

            <FadeInView delay={80}>
              <InvestmentsPieChart data={byCategory} />
            </FadeInView>

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
    borderRadius: 18,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e8f0d5',
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.investmentDark,
    letterSpacing: -0.3,
    paddingHorizontal: Spacing.five,
    marginBottom: Spacing.three,
  },

  monthFilterRow: {
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  filterLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary100,
    borderWidth: 1,
    borderColor: Colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
  },
  monthScrollView: {
    flex: 1,
  },
  monthScroll: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: 2,
    paddingHorizontal: Spacing.one,
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
    shadowColor: Colors.primary600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
