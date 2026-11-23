import { Platform } from 'react-native';

// Aparelho físico usa o IP da máquina (EXPO_PUBLIC_DEV_HOST); o emulador Android acessa o host por 10.0.2.2.
export const DEV_HOST =
  process.env.EXPO_PUBLIC_DEV_HOST || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
