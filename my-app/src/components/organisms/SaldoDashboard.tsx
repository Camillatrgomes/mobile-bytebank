import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';
import { Eye, EyeOff } from 'lucide-react-native';

interface SaldoDashboardProps {
  saldo: number;
  metaMessage: string;
  children?: React.ReactNode;
}

export function SaldoDashboard({ saldo, metaMessage, children }: SaldoDashboardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>Saldo disponível</Text>
        <TouchableOpacity
          onPress={() => setHidden((v) => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {hidden ? <EyeOff color={Colors.white} size={22} /> : <Eye color={Colors.white} size={22} />}
        </TouchableOpacity>
      </View>

      <Text style={styles.saldo}>
        {hidden ? '••••••' : formatCurrency(saldo)}
      </Text>

      <Text style={styles.meta}>{metaMessage}</Text>

      {children && <View style={styles.childrenArea}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary600,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.medium,
  },
  eyeIcon: {
    fontSize: 20,
  },
  saldo: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.one,
  },
  meta: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: Spacing.one,
  },
  childrenArea: {
    marginTop: Spacing.three,
  },
});
