
// ByteBank Design System — Color Palette and Spacing
export const Colors = {
  // Primary (Green)
  primary100: 'rgb(169, 201, 107)',
  primary300: 'rgb(143, 174, 74)',
  primary600: 'rgb(107, 142, 35)',
  primary700: 'rgb(86, 114, 29)',

  // Secondary (Beige)
  secondary100: 'rgb(255, 255, 242)',
  secondary300: 'rgb(250, 249, 232)',
  secondary600: 'rgb(245, 245, 220)',

  // Auth sidebar dark green
  authPanel: '#4A6520',

  // Accent (Golden)
  golden600: 'rgb(199, 149, 0)',

  // Semantic
  income: '#15803d',
  expense: '#b91c1c',
  investmentDark: '#4d6418',

  // Grays
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Chart colors
  chartColors: [
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#2563EB',
    '#EC4899',
    '#14B8A6',
    '#F97316',
    '#6366F1',
  ],

  // Base
  white: '#FFFFFF',
  black: '#000000',
  background: 'rgb(245, 245, 220)',
  surface: '#FFFFFF',

  // Shadows
  shadowLight: 'rgba(0,0,0,0.05)',
  shadowStrong: 'rgba(0,0,0,0.12)',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};


export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

