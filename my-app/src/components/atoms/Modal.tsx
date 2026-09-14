import React, { useEffect, useRef } from 'react';
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
import { X } from 'lucide-react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const SHEET_DURATION = 380;

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {

  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: visible ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlayWrapper, { opacity: overlayOpacity }]}>
        <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Fechar" />
      </Animated.View>

      <Sheet title={title} onClose={onClose}>
        {children}
      </Sheet>
      <ModalToastHost />
    </RNModal>
  );
}

function Sheet({ title, onClose, children }: Omit<ModalProps, 'visible'>) {
  const { height } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(height)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 22,
        tension: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: SHEET_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sheet,
        { transform: [{ translateY }, { scale }] },
      ]}
    >

      <View style={styles.handleArea}>
        <View style={styles.handle} />
      </View>

      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <View style={styles.closeBtn}>
              <X size={16} color={Colors.gray600} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.white,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.eight,
    maxHeight: '92%',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 24,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: Colors.gray200,
    borderRadius: BorderRadius.full,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
});
