import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal as RNModal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { ModalToastHost } from '@/components/atoms/Toast';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '@/constants/theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const SHEET_DURATION = 300;

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    // O fade do Modal cuida do overlay; o painel sobe com animação própria.
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Fechar" />
      <Sheet title={title} onClose={onClose}>
        {children}
      </Sheet>
      <ModalToastHost />
    </RNModal>
  );
}

function Sheet({ title, onClose, children }: Omit<ModalProps, 'visible'>) {
  const { height } = useWindowDimensions();
  const [translateY] = useState(() => new Animated.Value(height));

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: SHEET_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [translateY]);

  return (
    <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
      <View style={styles.handle} />
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.eight,
    paddingTop: Spacing.three,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
  },
  closeBtn: {
    fontSize: FontSize.lg,
    color: Colors.gray500,
    fontWeight: FontWeight.bold,
  },
});
