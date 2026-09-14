import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';
import { Eye, EyeOff } from 'lucide-react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface SaldoDashboardProps {
  saldo: number;
  metaMessage: string;
  children?: React.ReactNode;
}

function useCountUp(target: number, duration = 600) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animated.setValue(0);
    const id = animated.addListener(({ value }) => setDisplay(value));
    Animated.timing(animated, {
      toValue: target,
      duration,
      useNativeDriver: false,
    }).start();
    return () => animated.removeListener(id);
  }, [target]);

  return display;
}

export function SaldoDashboard({ saldo, metaMessage, children }: SaldoDashboardProps) {
  const [hidden, setHidden] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;

  function toggleHidden() {
    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
    setHidden((v) => !v);
  }

  const scaleX = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  const countedSaldo = useCountUp(saldo);

  const entryAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, []);

  const cardScale = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const cardOpacity = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>Saldo disponível</Text>
        <TouchableOpacity
          onPress={toggleHidden}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {hidden ? <EyeOff color={Colors.white} size={22} /> : <Eye color={Colors.white} size={22} />}
        </TouchableOpacity>
      </View>

      <Animated.View style={{ transform: [{ scaleX }] }}>
        <Text style={styles.saldo}>
          {hidden ? '••••••' : formatCurrency(countedSaldo)}
        </Text>
      </Animated.View>

      <Text style={styles.meta}>{metaMessage}</Text>

      {children && (
        <>
          <View style={styles.separator} />
          <View style={styles.childrenArea}>{children}</View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary600,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    gap: Spacing.two,
    shadowColor: Colors.primary700,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
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
    letterSpacing: 0.3,
  },
  saldo: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.one,
    letterSpacing: -0.5,
  },
  meta: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: Spacing.one,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: Spacing.two,
  },
  childrenArea: {
    marginTop: Spacing.one,
  },
});
