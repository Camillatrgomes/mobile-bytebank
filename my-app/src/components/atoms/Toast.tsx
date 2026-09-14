import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '@/constants/theme';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

interface ToastListContextValue {
  toasts: ToastMessage[];
  registerModalHost: () => () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const ToastListContext = createContext<ToastListContextValue>({
  toasts: [],
  registerModalHost: () => () => {},
});

const TOAST_DURATION = 3000;

const variantStyles: Record<ToastVariant, { bg: string; text: string }> = {
  success: { bg: Colors.income, text: Colors.white },
  error: { bg: Colors.expense, text: Colors.white },
  warning: { bg: Colors.golden600, text: Colors.white },
  info: { bg: Colors.primary600, text: Colors.white },
};

function ToastItem({ message, variant }: { message: string; variant: ToastVariant }) {
  const style = variantStyles[variant];
  return (
    <View style={[styles.toast, { backgroundColor: style.bg }]}>
      <Text style={[styles.toastText, { color: style.text }]}>{message}</Text>
    </View>
  );
}

function ToastList({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <View style={styles.container}>
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} variant={t.variant} />
      ))}
    </View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [modalHosts, setModalHosts] = useState(0);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const registerModalHost = useCallback(() => {
    setModalHosts((count) => count + 1);
    return () => setModalHosts((count) => count - 1);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastListContext.Provider value={{ toasts, registerModalHost }}>
        {children}
        {modalHosts === 0 && <ToastList toasts={toasts} />}
      </ToastListContext.Provider>
    </ToastContext.Provider>
  );
}

// Modal nativo fica acima de toda a árvore: com um aberto, os toasts são desenhados dentro dele.
export function ModalToastHost() {
  const { toasts, registerModalHost } = useContext(ToastListContext);
  useEffect(registerModalHost, [registerModalHost]);
  return <ToastList toasts={toasts} />;
}

export function useToast(): (message: string, variant?: ToastVariant) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.four,
    right: Spacing.four,
    gap: Spacing.two,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
