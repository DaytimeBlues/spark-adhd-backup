import { TextStyle, ViewStyle } from 'react-native';

// Metro Design Language (MDL) Theme Tokens
// Principles: Typography-first, Content over Chrome, Authentic Digitally

export const MetroPalette = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#767676',
  darkGray: '#1D1D1D', // Surface alternative
  lightGray: '#D0D0D0',
  
  // Classic Metro Accents
  blue: '#2D89EF',    // Windows Blue
  green: '#00A300',   // Xbox Green
  lime: '#99B433',
  teal: '#00ABA9',
  magenta: '#FF0097',
  purple: '#7E3878',
  orange: '#E3A21A',
  red: '#EE1111',
  cobalt: '#0050EF',
};

export const MetroSpacing = {
  unit: 4,
  s: 8,
  m: 16,
  l: 24,    // Standard page margin
  xl: 32,
  xxl: 48,
  gutter: 12, // Between tiles
};

export const MetroTypography = {
  fontFamily: 'System', // Relies on SF Pro (iOS) / Roboto (Android)
  weights: {
    light: '300' as const,
    regular: '400' as const,
    bold: '700' as const,
  },
  sizes: {
    display: 48, // Page titles
    h1: 34,      // Section headers
    h2: 24,      // Subsections
    h3: 20,      // Important body
    body: 15,    // Standard reading
    caption: 12, // Auxiliary
  },
  letterSpacing: {
    display: -1.0, // Tighter for large text
    header: -0.5,
    body: 0,
    uppercase: 1.5, // Spaced out caps
  }
};

export type MetroThemeType = {
  colors: typeof MetroPalette;
  spacing: typeof MetroSpacing;
  type: typeof MetroTypography;
};

export const metroTheme: MetroThemeType = {
  colors: MetroPalette,
  spacing: MetroSpacing,
  type: MetroTypography,
};
