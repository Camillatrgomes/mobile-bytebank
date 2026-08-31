import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms/Button';
import { FloatInput } from '@/components/atoms/FloatInput';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/atoms/Toast';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme';
import { AuthSidePanel } from '@/components/organisms/AuthSidePanel';

const registerSchema = z
  .object({
    username: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
    } catch (err: any) {
      toast(err.message ?? 'Erro ao criar conta. Tente novamente.', 'error');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>

          {/* Header panel */}
          <AuthSidePanel 
            heading="Criar Conta" 
            subtext="Preencha os dados abaixo para começar" 
          />

          {/* Form card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Criar conta</Text>

            <View style={styles.fields}>
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <FloatInput
                    label="Nome completo"
                    value={field.value}
                    onChangeText={field.onChange}
                    autoComplete="name"
                    error={errors.username?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FloatInput
                    label="E-mail"
                    value={field.value}
                    onChangeText={field.onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FloatInput
                    label="Senha"
                    value={field.value}
                    onChangeText={field.onChange}
                    isPassword
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FloatInput
                    label="Confirmar senha"
                    value={field.value}
                    onChangeText={field.onChange}
                    isPassword
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
            </View>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            >
              Criar minha conta
            </Button>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.loginLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.secondary300 },
  flex: { flex: 1 },
  container: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.eight,
    gap: Spacing.five,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: Spacing.two,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary600,
    fontWeight: FontWeight.medium,
  },
  panel: {
    backgroundColor: Colors.authPanel,
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    gap: Spacing.three,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.golden600,
  },
  panelHeading: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
    lineHeight: 40,
  },
  panelSub: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
    marginBottom: Spacing.five,
  },
  fields: {
    gap: Spacing.four,
    marginBottom: Spacing.five,
  },
  submitBtn: {
    marginBottom: Spacing.four,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
  loginLink: {
    fontSize: FontSize.sm,
    color: Colors.primary600,
    fontWeight: FontWeight.semibold,
  },
});
