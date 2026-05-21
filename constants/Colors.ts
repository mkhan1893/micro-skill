export const Colors = {
  dark: {
    background: '#03001e',
    cardBg: 'rgba(15, 23, 42, 0.45)', // Sleek semi-transparent glass
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#ffffff',
    textMuted: '#94a3b8',
    primary: '#00f2fe', // Electric Cyan
    secondary: '#7f00ff', // Neon Purple
    accent: '#ff007f', // Hot Pink for gamification elements
    success: '#10b981', // Emerald green
    warning: '#f59e0b', // Amber yellow
    error: '#ef4444', // Crimson red
    glassGlow: 'rgba(0, 242, 254, 0.15)',
    auroraStart: '#03001e',
    auroraMiddle: '#7303c0',
    auroraEnd: '#ec38bc',
  },
  light: {
    background: '#f8fafc',
    cardBg: 'rgba(255, 255, 255, 0.75)',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#0e7490', // Cyan 700
    secondary: '#6d28d9', // Purple 700
    accent: '#be185d',
    success: '#047857',
    warning: '#b45309',
    error: '#b91c1c',
    glassGlow: 'rgba(14, 116, 144, 0.08)',
    auroraStart: '#f8fafc',
    auroraMiddle: '#e0f2fe',
    auroraEnd: '#f3e8ff',
  }
};

export type ThemeType = 'dark' | 'light';
