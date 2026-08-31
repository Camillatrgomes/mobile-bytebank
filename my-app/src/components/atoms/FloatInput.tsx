import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '@/constants/theme';

interface FloatInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function FloatInput({ label, error, isPassword = false, style, ...props }: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = !!props.value;
  const isFloating = focused || hasValue;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <Text
          style={[
            styles.label,
            isFloating && styles.labelFloating,
            focused && styles.labelFocusedColor,
            !!error && styles.labelError,
          ]}
        >
          {label}
        </Text>
        <TextInput
          style={[styles.input, style]}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={Colors.gray400}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingTop: 20,
    paddingBottom: Spacing.two,
    backgroundColor: Colors.white,
    position: 'relative',
  },
  inputFocused: {
    borderColor: Colors.primary600,
  },
  inputError: {
    borderColor: Colors.expense,
  },
  label: {
    position: 'absolute',
    left: Spacing.three,
    top: 14,
    fontSize: FontSize.md,
    color: Colors.gray500,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  labelFloating: {
    top: 6,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  labelFocusedColor: {
    color: Colors.primary600,
  },
  labelError: {
    color: Colors.expense,
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.gray900,
    paddingTop: 4,
    paddingRight: 32,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.three,
    top: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.expense,
    marginLeft: Spacing.one,
  },
});
