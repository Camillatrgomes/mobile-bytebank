import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantConfig: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary:  { bg: Colors.primary600, text: Colors.white },
  secondary:{ bg: Colors.secondary600, text: Colors.primary700 },
  danger:   { bg: Colors.expense, text: Colors.white },
  ghost:    { bg: 'transparent', text: Colors.primary600 },
  outline:  { bg: 'transparent', text: Colors.primary600, border: Colors.primary600 },
};

const sizeConfig: Record<ButtonSize, { py: number; px: number; fontSize: number; height: number }> = {
  sm: { py: Spacing.two,   px: Spacing.three, fontSize: FontSize.sm, height: 36 },
  md: { py: Spacing.three, px: Spacing.four,  fontSize: FontSize.md, height: 44 },
  lg: { py: Spacing.four,  px: Spacing.five,  fontSize: FontSize.lg, height: 52 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const vc = variantConfig[variant];
  const sc = sizeConfig[size];
  const isDisabled = disabled || loading;


  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, {
      toValue: 0.96,
      friction: 6,
      tension: 300,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  function onPressOut() {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.base,
          {
            backgroundColor: vc.bg,
            borderColor: vc.border ?? 'transparent',
            borderWidth: vc.border ? 1.5 : 0,
            paddingVertical: sc.py,
            paddingHorizontal: sc.px,
            height: sc.height,
            opacity: isDisabled ? 0.6 : 1,
          },
        ]}
        disabled={isDisabled}
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={vc.text} size="small" />
        ) : (
          <View style={styles.content}>
            {leftIcon}
            <Text style={[styles.label, { color: vc.text, fontSize: sc.fontSize }]}>
              {children}
            </Text>
            {rightIcon}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontWeight: FontWeight.semibold,
  },
});
