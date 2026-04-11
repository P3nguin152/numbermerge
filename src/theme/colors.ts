// ─── Number Merge – Design System ───────────────────────────────────────
// A premium dark-mode palette inspired by glass-morphism & modern mobile games

export const Colors = {
  // Backgrounds
  bg: '#0A0E21',
  bgLight: '#111632',
  surface: '#161B35',
  card: '#1C2240',
  cardBorder: 'rgba(255,255,255,0.06)',
  cardHighlight: 'rgba(255,255,255,0.03)',

  // Accent colours
  primary: '#7C5CFC',
  primaryLight: '#A78BFA',
  primaryDim: 'rgba(124,92,252,0.15)',

  accent: '#FF6B6B',
  accentLight: '#FF8E53',
  accentDim: 'rgba(255,107,107,0.15)',

  success: '#34D399',
  successDim: 'rgba(52,211,153,0.15)',

  warning: '#FBBF24',
  warningDim: 'rgba(251,191,36,0.15)',

  info: '#38BDF8',
  infoDim: 'rgba(56,189,248,0.15)',

  danger: '#F43F5E',
  dangerDim: 'rgba(244,63,94,0.15)',

  gold: '#FFD700',
  goldDim: 'rgba(255,215,0,0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B95B8',
  textMuted: '#5A6380',
  textInverse: '#0A0E21',

  // Misc
  overlay: 'rgba(5,7,18,0.85)',
  divider: 'rgba(255,255,255,0.06)',
  glass: 'rgba(255,255,255,0.04)',
} as const;

export const TileColors: Record<number, { bg: string; text: string; glow: string }> = {
  2:    { bg: '#FF6B9D', text: '#fff', glow: 'rgba(255,107,157,0.35)' },
  4:    { bg: '#51CF66', text: '#fff', glow: 'rgba(81,207,102,0.35)' },
  8:    { bg: '#38BDF8', text: '#fff', glow: 'rgba(56,189,248,0.35)' },
  16:   { bg: '#7C5CFC', text: '#fff', glow: 'rgba(124,92,252,0.35)' },
  32:   { bg: '#FF6B6B', text: '#fff', glow: 'rgba(255,107,107,0.35)' },
  64:   { bg: '#C084FC', text: '#fff', glow: 'rgba(192,132,252,0.35)' },
  128:  { bg: '#FB923C', text: '#fff', glow: 'rgba(251,146,60,0.35)' },
  256:  { bg: '#F43F5E', text: '#fff', glow: 'rgba(244,63,94,0.35)' },
  512:  { bg: '#FBBF24', text: '#fff', glow: 'rgba(251,191,36,0.35)' },
  1024: { bg: '#2DD4BF', text: '#fff', glow: 'rgba(45,212,191,0.35)' },
  2048: { bg: '#EC4899', text: '#fff', glow: 'rgba(236,72,153,0.35)' },
};

export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
