/**
 * Legacy template hook — updated to return a static theme object
 * compatible with old ThemedText/ThemedView components.
 */

import { Colors } from '@/constants/theme';
import type { ThemeColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const lightTheme: Record<ThemeColor, string> = {
  text: Colors.gray900,
  textSecondary: Colors.gray500,
  background: Colors.secondary300,
  backgroundElement: Colors.gray100,
  backgroundSelected: Colors.primary100,
};

const darkTheme: Record<ThemeColor, string> = {
  text: Colors.white,
  textSecondary: Colors.gray300,
  background: Colors.gray900,
  backgroundElement: Colors.gray800,
  backgroundSelected: Colors.primary700,
};

export function useTheme(): Record<ThemeColor, string> {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
