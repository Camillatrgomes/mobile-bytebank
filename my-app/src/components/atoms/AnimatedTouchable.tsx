import React, { useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export interface AnimatedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;

  scaleTo?: number;

  containerStyle?: StyleProp<ViewStyle>;
}


export function AnimatedTouchable({
  children,
  scaleTo = 0.95,
  style,
  containerStyle,
  onPressIn,
  onPressOut,
  activeOpacity = 0.85,
  disabled = false,
  ...props
}: AnimatedTouchableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(disabled ? 0.55 : 1)).current;

  function handlePressIn(e: GestureResponderEvent) {
    if (!disabled) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: scaleTo,
          friction: 6,
          tension: 320,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 0.78,
          duration: 100,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }
    onPressIn?.(e);
  }

  function handlePressOut(e: GestureResponderEvent) {
    if (!disabled) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 220,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }
    onPressOut?.(e);
  }

  return (
    <Animated.View style={[styles.wrapper, { opacity, transform: [{ scale }] }, containerStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        disabled={disabled}
        style={style}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
  },
});
