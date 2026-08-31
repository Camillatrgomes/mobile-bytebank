import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/organisms/Header';
import { InvestmentsKPICards } from '@/components/molecules/InvestmentsKPICards';
import { InvestmentsPieChart } from '@/components/organisms/InvestmentsPieChart';
import { InvestmentsTable } from '@/components/organisms/InvestmentsTable';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import { useTransactionList } from '@/hooks/useTransactionList';
import { getLastMonths } from '@/lib/formatters';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

export default function InvestmentsScreen() {
  const months = getLastMonths(6);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);

  const { transactions, receitas, despesas, lucro, byCategory, isLoading } =
    useTransactionList(selectedMonth);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => {}} />}
      >
        <Text style={styles.title}>Investimentos</Text>

        {/* Month filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthRow}
        >
          {months.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.monthChip,
                selectedMonth === m.value && styles.monthChipActive,
              ]}
              onPress={() => setSelectedMonth(m.value)}
            >
              <Text
                style={[
                  styles.monthChipText,
                  selectedMonth === m.value && styles.monthChipTextActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={3} />
          </>
        ) : (
          <>
            {/* KPI Cards */}
            <InvestmentsKPICards receitas={receitas} despesas={despesas} lucro={lucro} />

            {/* Pie Chart */}
            <InvestmentsPieChart data={byCategory} />

            {/* Table */}
            <InvestmentsTable transactions={transactions} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.four,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
  },
  monthRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  monthChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
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
});
