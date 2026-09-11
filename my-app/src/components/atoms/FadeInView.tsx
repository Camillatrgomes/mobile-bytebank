import React, { useEffect, useState } from 'react';
import { Animated, Platform, type ViewProps } from 'react-native';

// react-native-web não tem driver nativo para Animated.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface FadeInViewProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offsetY?: number;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 350,
  offsetY = 16,
  style,
  ...rest
}: FadeInViewProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(offsetY));

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ translateY }] }]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
