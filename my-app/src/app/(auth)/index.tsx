import React, { useRef, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  useWindowDimensions, 
  TouchableOpacity, 
  Modal, 
  Pressable 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms/Button';
import { Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { Menu, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef({ hero: 0, services: 0 });

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const scrollToSection = (section: 'hero' | 'services') => {
    setMenuOpen(false);
    scrollViewRef.current?.scrollTo({
      y: sectionOffsets.current[section],
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* --- MENU LATERAL (MODAL) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuOpen}
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalCloseArea} onPress={toggleMenu} />
          <View style={[styles.drawerContainer, { width: width * 0.82 }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.appNameDrawer}>
                <Text style={{ fontWeight: '300' }}>byte</Text>
                <Text style={{ fontWeight: '700' }}>bank</Text>
              </Text>
              <TouchableOpacity onPress={toggleMenu}>
                <X color="#6B8E23" size={32} />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerContent}>
              <TouchableOpacity style={styles.drawerItem} onPress={() => scrollToSection('hero')}>
                <Text style={styles.drawerLink}>Sobre</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => scrollToSection('services')}>
                <Text style={styles.drawerLink}>Serviços</Text>
              </TouchableOpacity>

              <View style={styles.drawerFooter}>
                <Button variant="primary" fullWidth onPress={() => navigateTo('/(auth)/register')}>
                  Criar conta
                </Button>
                <Button variant="outline" fullWidth style={{ marginTop: Spacing.two }} onPress={() => navigateTo('/(auth)/login')}>
                  Já tenho conta
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <Image source={require('@/assets/images/bblogo.png')} style={styles.logo} />
              <View>
                <Text style={styles.appName}>
                  <Text style={{ fontWeight: '300' }}>byte</Text>
                  <Text style={{ fontWeight: '700' }}>bank</Text>
                </Text>
                <Text style={styles.tagline}>PLANNER FINANCEIRO</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuIconButton}>
              <Menu color="#fff" size={32} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContentSection}>
          
          <LinearGradient
            colors={['#fcfcfc', '#eccf89']}
            style={StyleSheet.absoluteFill}
          />

          <Image 
            source={require('@/assets/images/Background.png')} 
            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
            resizeMode="cover"
          />

          <View style={styles.overlayContent}>
            
            {/* Hero */}
            <View
              style={styles.heroBox}
              onLayout={({ nativeEvent }) => {
                sectionOffsets.current.hero = nativeEvent.layout.y;
              }}
            >
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
            <View
              style={styles.vantagensBox}
              onLayout={({ nativeEvent }) => {
                sectionOffsets.current.services = nativeEvent.layout.y;
              }}
            >
              <Text style={styles.vantagensTitle}>Vantagens do nosso banco:</Text>
              <View style={styles.featuresList}>
                {[
                  { img: require('@/assets/images/gift.png'), title: 'Conta e cartão gratuitos', desc: 'Isso mesmo, nossa conta é digital, sem custo fixo e sem tarifa de manutenção.' },
                  { img: require('@/assets/images/wallet.png'), title: 'Saques sem custo', desc: 'Você pode sacar gratuitamente 4x por mês de qualquer Banco 24h.' },
                  { img: require('@/assets/images/star.png'), title: 'Programa de pontos', desc: 'Você pode acumular pontos com suas compras no crédito sem pagar mensalidade!' },
                  { img: require('@/assets/images/pc.png'), title: 'Seguro dispositivos', desc: 'Seus dispositivos móveis protegidos por uma mensalidade simbólica.' },
                ].map((v, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Image source={v.img} style={styles.featureIcon} />
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>{v.title}</Text>
                      <Text style={styles.featureDesc}>{v.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* --- FOOTER --- */}
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
    flexGrow: 1,
  },
  // Header
  header: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    backgroundColor: '#6B8E23',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 38,
    height: 38,
  },
  appName: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginTop: 2,
  },
  menuIconButton: {
    padding: 4,
  },
  // Estrutura de Camadas (Background e Conteúdo)
  mainContentSection: {
    position: 'relative',
    width: '100%',
  },
  overlayContent: {
    paddingVertical: Spacing.six,
    zIndex: 2,
  },
  // Hero
  heroBox: {
    paddingHorizontal: Spacing.five,
    marginBottom: Spacing.four,
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#b8860b',
    lineHeight: 32,
    marginBottom: Spacing.four,
  },
  heroImage: {
    width: '100%',
  },
  // Vantagens
  vantagensBox: {
    paddingHorizontal: Spacing.five,
    marginTop: Spacing.six,
  },
  vantagensTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28292b',
    textAlign: 'center',
    marginBottom: Spacing.six,
  },
  featuresList: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  featureIcon: {
    width: 48,
    height: 48,
    marginRight: Spacing.four,
    resizeMode: 'contain',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#b8860b',
    marginBottom: Spacing.one,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: '#374151',
    lineHeight: 18,
  },
  // Menu Lateral
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  modalCloseArea: {
    flex: 1,
  },
  drawerContainer: {
    height: '100%',
    backgroundColor: '#fff',
    padding: Spacing.five,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.eight,
    paddingBottom: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appNameDrawer: {
    fontSize: 22,
    color: '#6B8E23',
  },
  drawerContent: {
    flex: 1,
  },
  drawerItem: {
    paddingVertical: Spacing.five,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  drawerLink: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#28292b',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingBottom: Spacing.eight,
  },
  // Footer
  footer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    backgroundColor: '#6B8E23',
  },
  credits: {
    fontSize: 12,
    color: '#fff',
  },
});