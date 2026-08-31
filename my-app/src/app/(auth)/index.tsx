import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms/Button';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header like Web */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('@/assets/images/bblogo.png')} style={styles.logo} />
            <View>
              <Text style={styles.appName}><Text style={{fontWeight: '300'}}>byte</Text><Text style={{fontWeight: 'bold'}}>bank</Text></Text>
              <Text style={styles.tagline}>PLANNER FINANCEIRO</Text>
            </View>
          </View>
        </View>

        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.heroHeading}>
            Experimente mais liberdade no controle da sua vida financeira. Crie sua conta com a gente!
          </Text>
          <Image 
            source={require('@/assets/images/welcome.png')} 
            style={[styles.heroImage, { height: width * 0.6 }]} 
            resizeMode="contain"
          />
        </View>

        {/* Vantagens */}
        <View style={styles.vantagens}>
          <Text style={styles.vantagensTitle}>Vantagens do nosso banco:</Text>
          <View style={styles.featuresList}>
            {[
              { img: require('@/assets/images/gift.png'), title: 'Conta e cartão gratuitos', desc: 'Isso mesmo, nossa conta é digital, sem custo fixo e mais que isso: sem tarifa de manutenção.' },
              { img: require('@/assets/images/wallet.png'), title: 'Saques sem custo', desc: 'Você pode sacar gratuitamente 4x por mês de qualquer Banco 24h.' },
              { img: require('@/assets/images/star.png'), title: 'Programa de pontos', desc: 'Você pode acumular pontos com suas compras no crédito sem pagar mensalidade!' },
              { img: require('@/assets/images/pc.png'), title: 'Seguro dispositivos', desc: 'Seus dispositivos móveis (computador e laptop) protegidos por uma mensalidade simbólica.' },
            ].map((v, i) => (
              <View key={i} style={styles.featureItem}>
                <Image source={v.img} style={styles.featureIcon} />
                <Text style={styles.featureTitle}>{v.title}</Text>
                <Text style={styles.featureDesc}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctas}>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onPress={() => router.push('/(auth)/register')}
          >
            Abrir minha conta
          </Button>
          <Button
            variant="outline"
            fullWidth
            size="lg"
            onPress={() => router.push('/(auth)/login')}
          >
            Já tenho conta
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.credits}>© 2026 ByteBank — Planner Financeiro</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: Spacing.eight,
  },
  header: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    backgroundColor: '#6B8E23',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  logo: {
    width: 44,
    height: 44,
  },
  appName: {
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
    marginTop: 2,
  },
  hero: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.eight,
    paddingBottom: Spacing.six,
    backgroundColor: '#F3F0E3', // closest to hero-bg if it's light grey
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#b8860b', // Golden
    lineHeight: 32,
    marginBottom: Spacing.six,
  },
  heroImage: {
    width: '100%',
  },
  vantagens: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.eight,
    backgroundColor: '#F3F0E3',
  },
  vantagensTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28292b',
    textAlign: 'center',
    marginBottom: Spacing.six,
  },
  featuresList: {
    gap: Spacing.six,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Spacing.five,
    borderRadius: BorderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  featureIcon: {
    width: 64,
    height: 64,
    marginBottom: Spacing.three,
    resizeMode: 'contain',
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#b8860b',
    marginBottom: Spacing.two,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctas: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  footer: {
    paddingVertical: Spacing.seven,
    alignItems: 'center',
    backgroundColor: '#6B8E23',
  },
  credits: {
    fontSize: 12,
    color: '#fff',

  },
});
