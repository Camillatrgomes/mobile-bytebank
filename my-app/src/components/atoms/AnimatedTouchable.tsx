import React, { useRef } from 'react';
import {
  Animated,
  Platform,
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
  ...props
}: AnimatedTouchableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn(e: any) {
    Animated.spring(scale, {
      toValue: scaleTo,
      friction: 5,
      tension: 350,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
    onPressIn?.(e);
  }

  function handlePressOut(e: any) {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
    onPressOut?.(e);
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, containerStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        style={style}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
