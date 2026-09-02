import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAccount, revalidateAccount } from '@/hooks/useAccount';
import { TransactionEditForm } from '@/components/organisms/TransactionEditForm';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/atoms/Toast';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme';
import { Pencil, Trash } from 'lucide-react-native';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { transactions, isLoading } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const transaction = transactions.find((t) => t.id === id);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  async function handleDeleteClick() {
    setDeleteModalVisible(true);
  }

  async function confirmDelete() {
    setDeleteModalVisible(false);
    setIsDeleting(true);
    try {
      await apiFetch(`/account/transaction/${id}`, { method: 'DELETE' });
      toast('Transação excluída', 'success');
      router.back();
      // Revalidate after navigating to avoid re-render with missing transaction
      revalidateAccount();
    } catch (err: any) {
      toast(err.message ?? 'Erro ao excluir', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary600} size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Transação não encontrada</Text>
          <Button variant="primary" onPress={() => router.back()}>
            Voltar
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isCredit = transaction.type === 'Credit';
  const description = transaction.to ?? transaction.from ?? transaction.category ?? 'Transação';

  if (isEditing) {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Text style={styles.backText}>← Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Transação</Text>
          <View style={{ width: 80 }} />
        </View>
        <ScrollView contentContainerStyle={styles.editContent}>
          <TransactionEditForm
            transaction={transaction}
            onSuccess={() => {
              setIsEditing(false);
              router.back();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhe</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Type indicator */}
        <View style={[styles.typeCircle, { backgroundColor: isCredit ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={[styles.typeArrow, { color: isCredit ? Colors.income : Colors.expense }]}>
            {isCredit ? '↑' : '↓'}
          </Text>
        </View>

        {/* Amount */}
        <Text style={[styles.amount, { color: isCredit ? Colors.income : Colors.expense }]}>
          {isCredit ? '+' : '-'} {formatCurrency(transaction.value)}
        </Text>

        <Text style={styles.description}>{description}</Text>

        {/* Details card */}
        <View style={styles.detailCard}>
          <DetailRow label="Tipo" value={isCredit ? 'Entrada (Crédito)' : 'Saída (Débito)'} />
          <DetailRow label="Data" value={formatDate(transaction.date)} />
          {transaction.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Categoria</Text>
              <Badge
                label={transaction.category}
                variant={isCredit ? 'income' : 'expense'}
              />
            </View>
          )}
          {transaction.from && <DetailRow label="De" value={transaction.from} />}
          {transaction.to && <DetailRow label="Para" value={transaction.to} />}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            variant="outline"
            fullWidth
            onPress={() => setIsEditing(true)}
          >
            <Pencil /> Editar
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={isDeleting}
            onPress={handleDeleteClick}
          >
            <Trash /> Excluir
          </Button>
        </View>
      </ScrollView>

      <Modal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} title="Excluir transação">
        <View style={{ gap: Spacing.four, marginTop: Spacing.two }}>
          <Text style={{ fontSize: FontSize.md, color: Colors.gray600 }}>
            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two }}>
            <Button variant="outline" onPress={() => setDeleteModalVisible(false)} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button variant="danger" onPress={confirmDelete} style={{ flex: 1 }}>
              Excluir
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  notFound: {
    fontSize: FontSize.lg,
    color: Colors.gray500,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.primary600,
  },
  backText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    width: 80,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  content: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
    paddingBottom: 100,
    alignItems: 'center',
    gap: Spacing.four,
  },
  editContent: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: 100,
  },
  typeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeArrow: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
  },
  amount: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
  },
  description: {
    fontSize: FontSize.lg,
    color: Colors.gray700,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    width: '100%',
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
  },
  detailValue: {
    fontSize: FontSize.sm,
    color: Colors.gray800,
    fontWeight: FontWeight.semibold,
  },
  actions: {
    width: '100%',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
});
