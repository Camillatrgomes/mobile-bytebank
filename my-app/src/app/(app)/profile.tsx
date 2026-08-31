import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme';
import { User, Mail, Pen, LogOut, ChevronRight, ShieldCheck, X, Check } from 'lucide-react-native';
import { FloatInput } from '@/components/atoms/FloatInput';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import type { RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import type { AppDispatch } from '@/store';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username ?? '');
  const [newEmail, setNewEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  function handleLogout() {
    setLogoutModalVisible(true);
  }

  function confirmLogout() {
    setLogoutModalVisible(false);
    logout();
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await apiFetch(`/user/${user?.id}`, {
        method: 'PUT',
        body: { username: newUsername, email: newEmail },
      });
      dispatch(setCredentials({ id: user!.id, username: newUsername, email: newEmail }));
      setEditing(false);
    } catch (err: any) {
      setError(err.message ?? 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setNewUsername(user?.username ?? '');
    setNewEmail(user?.email ?? '');
    setError(null);
    setEditing(false);
  }

  const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <Text style={styles.userName}>{user?.username}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <ShieldCheck size={18} color={Colors.primary600} />
                <Text style={styles.cardTitle}>Informações da conta</Text>
              </View>
              {!editing && (
                <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
                  <Pen size={14} color={Colors.primary600} />
                  <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            {editing ? (
              /* Edit form */
              <View style={styles.formArea}>
                <FloatInput
                  label="Nome de usuário"
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize="none"
                />
                <FloatInput
                  label="E-mail"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
                <View style={styles.formActions}>
                  <Button variant="outline" onPress={handleCancel} style={styles.actionBtn}>
                    Cancelar
                  </Button>
                  <Button variant="primary" loading={saving} onPress={handleSave} style={styles.actionBtn}>
                    Salvar
                  </Button>
                </View>
              </View>
            ) : (
              /* Info display */
              <View style={styles.infoArea}>
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBg, { backgroundColor: '#f0fdf4' }]}>
                    <User size={16} color={Colors.primary600} />
                  </View>
                  <View style={styles.infoTexts}>
                    <Text style={styles.infoLabel}>Nome</Text>
                    <Text style={styles.infoValue}>{user?.username}</Text>
                  </View>
                </View>

                <View style={styles.rowDivider} />

                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBg, { backgroundColor: '#eff6ff' }]}>
                    <Mail size={16} color="#2563EB" />
                  </View>
                  <View style={styles.infoTexts}>
                    <Text style={styles.infoLabel}>E-mail</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Logout Card */}
          <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.logoutLeft}>
              <View style={styles.logoutIconBg}>
                <LogOut size={18} color={Colors.expense} />
              </View>
              <Text style={styles.logoutText}>Sair da conta</Text>
            </View>
            <ChevronRight size={18} color={Colors.expense} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={logoutModalVisible} onClose={() => setLogoutModalVisible(false)} title="Sair da conta">
        <View style={{ gap: Spacing.four, marginTop: Spacing.two }}>
          <Text style={{ fontSize: FontSize.md, color: Colors.gray600 }}>
            Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta.
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two }}>
            <Button variant="outline" onPress={() => setLogoutModalVisible(false)} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button variant="danger" onPress={confirmLogout} style={{ flex: 1 }}>
              Sair
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.secondary600,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: 100,
    gap: Spacing.four,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary600,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 2,
  },
  userName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
    marginTop: Spacing.one,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary300,
  },
  editBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary600,
    fontWeight: FontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
  },

  // Info rows
  infoArea: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoTexts: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.gray800,
    fontWeight: FontWeight.semibold,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.gray100,
  },

  // Form
  formArea: {
    padding: Spacing.five,
    gap: Spacing.four,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.expense,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  actionBtn: {
    flex: 1,
  },

  // Logout
  logoutCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  logoutIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.expense,
  },
});
