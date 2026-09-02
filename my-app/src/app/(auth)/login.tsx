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

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data);
    } catch (err: any) {
      toast(err.message ?? 'Erro ao fazer login. Verifique suas credenciais.', 'error');
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
          <View style={styles.panel}>
                      
                                {/* Header panel */}
                                <AuthSidePanel 
                                  heading="Bem-vindo de volta" 
                                  subtext="Entre na sua conta para gerenciar suas finanças" 
                                />
                      </View>


          {/* Form card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Entrar</Text>

            <View style={styles.fields}>
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
                    autoComplete="password"
                    error={errors.password?.message}
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
              Entrar
            </Button>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Não tem conta? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
                <Text style={styles.signupLink}>Criar conta</Text>
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
  tagline: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
    marginTop: 2,
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
  panelImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: Spacing.five,
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
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
  signupLink: {
    fontSize: FontSize.sm,
    color: Colors.primary600,
    fontWeight: FontWeight.semibold,
  },
});
