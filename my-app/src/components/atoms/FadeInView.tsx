import React, { useEffect, useRef } from 'react';
import { Animated, Platform, type ViewProps } from 'react-native';

// O react-native-web executa a API Animated em JavaScript puro — não existe
// driver nativo lá, então a flag só é ligada nas plataformas nativas.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface FadeInViewProps extends ViewProps {
  children: React.ReactNode;
  /** Atraso antes de iniciar, em ms. Use para escalonar a entrada de vários blocos. */
  delay?: number;
  /** Duração da animação, em ms. */
  duration?: number;
  /** Deslocamento vertical inicial, em px. */
  offsetY?: number;
}

/**
 * Envolve uma seção do dashboard e a faz entrar com fade + deslize vertical.
 *
 * As duas propriedades animadas são combinadas com Animated.parallel para
 * começarem e terminarem juntas. Trocar a `key` do componente remonta e
 * reexecuta a animação — é assim que a transição entre seções (ex.: troca de
 * mês na tela de investimentos) é disparada.
 */
export function FadeInView({
  children,
  delay = 0,
  duration = 350,
  offsetY = 16,
  style,
  ...rest
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offsetY)).current;

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
