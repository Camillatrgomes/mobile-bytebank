import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { Shield } from 'lucide-react-native';

interface AuthSidePanelProps {
  heading: string;
  subtext?: string;
}

export function AuthSidePanel({ heading, subtext }: AuthSidePanelProps) {
  const { width, height } = useWindowDimensions();

  // Se a tela for muito pequena (ex: celular em portrait), podemos apenas não exibir o AuthSidePanel
  // Mas como a Landing Page deve mostrar isso no mobile também (se for o background do topo),
  // adaptamos para ocupar a área necessária.

  return (
    <View style={styles.container}>
      {/* Background Shapes / Blobs simulated with absolute views */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <View style={styles.content}>
                    <View style={styles.brand}>
            <Image source={require('@/assets/images/bblogo.png')} style={styles.logo} />
              <Text style={styles.appName}><Text style={{fontWeight: '300'}}>byte</Text><Text style={{fontWeight: 'bold'}}>bank</Text></Text>
</View>

        <View style={styles.textContainer}>
          <View style={styles.divider} />
          <Text style={styles.heading}>{heading}</Text>
          {subtext && <Text style={styles.subtext}>{subtext}</Text>}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 ByteBank — Planner Financeiro</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4A6520',
    position: 'relative',
    margin:0,

  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(143, 174, 74, 0.22)',
    top: -200,
    right: 0,
  },
  blob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(169, 201, 107, 0.14)',
    bottom: -50,
    left: -50,
  },
  blob3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(199, 149, 0, 0.16)',
    top: '50%',
    left: '70%',
  },
  appName: {
    fontSize: 32,
    color: '#fff',
    letterSpacing: -0.5,
  },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    logo: {
      width: 77,
      height: 77,
    },
  content: {
    flex: 1,
    zIndex: 10,
    padding: 32,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
  },
  textContainer: {
    marginTop: 40,
  },
  divider: {
    width: 36,
    height: 3,
    backgroundColor: 'rgb(199, 149, 0)',
    borderRadius: 2,
    marginBottom: 20,
  },
  heading: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 38,
  },
  subtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
  }
});
