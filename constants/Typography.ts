import { Platform } from 'react-native';

export const Typography = {
  fontFamily: {
    regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'Inter, sans-serif' }),
    medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'Inter, sans-serif' }),
    bold: Platform.select({ ios: 'System', android: 'sans-serif-bold', default: 'Space Grotesk, sans-serif' }),
    mono: Platform.select({ ios: 'Courier', android: 'monospace', default: 'Space Grotesk, monospace' }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    huge: 32,
    cinematic: 44,
  },
  lineHeight: {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
    xxl: 34,
    huge: 42,
  }
};
