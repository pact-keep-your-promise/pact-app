export const colors = {
  background: '#0A0A0F',
  backgroundSecondary: '#14141C',
  backgroundTertiary: '#1E1E2A',

  primary: '#7C5CFC',
  primaryLight: '#9B82FC',
  primaryDark: '#5A3DD6',

  accent1: '#FF6B6B',
  accent2: '#4ECDC4',
  accent3: '#FFE66D',
  accent4: '#95E1D3',
  accent5: '#F38181',
  accent6: '#6C63FF',

  streakFire: '#FF9500',
  streakGold: '#FFD700',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',

  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textTertiary: '#6B6B80',
  textInverse: '#0A0A0F',

  border: '#2A2A3C',
  borderLight: '#3A3A4C',

  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const typography = {
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};
