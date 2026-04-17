export interface BoardTheme {
  id: string;
  name: string;
  emoji: string;
  boardBg: string;
  boardBorder: string;
  divider: string;
  pattern: 'none' | 'dots' | 'lines';
  patternColor: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    boardBg: '#161B35',
    boardBorder: 'rgba(255,255,255,0.06)',
    divider: 'rgba(255,255,255,0.06)',
    pattern: 'none',
    patternColor: 'rgba(255,255,255,0.04)',
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    boardBg: '#0C1E12',
    boardBorder: 'rgba(52,211,153,0.20)',
    divider: 'rgba(52,211,153,0.12)',
    pattern: 'dots',
    patternColor: 'rgba(52,211,153,0.18)',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    boardBg: '#061628',
    boardBorder: 'rgba(56,189,248,0.20)',
    divider: 'rgba(56,189,248,0.12)',
    pattern: 'lines',
    patternColor: 'rgba(56,189,248,0.10)',
  },
  {
    id: 'ember',
    name: 'Ember',
    emoji: '🔥',
    boardBg: '#1C0800',
    boardBorder: 'rgba(251,146,60,0.20)',
    divider: 'rgba(251,146,60,0.12)',
    pattern: 'dots',
    patternColor: 'rgba(251,146,60,0.16)',
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    emoji: '💜',
    boardBg: '#140A26',
    boardBorder: 'rgba(192,132,252,0.20)',
    divider: 'rgba(192,132,252,0.12)',
    pattern: 'lines',
    patternColor: 'rgba(192,132,252,0.10)',
  },
  {
    id: 'arctic',
    name: 'Arctic',
    emoji: '❄️',
    boardBg: '#E2F0FA',
    boardBorder: 'rgba(56,189,248,0.30)',
    divider: 'rgba(56,189,248,0.18)',
    pattern: 'lines',
    patternColor: 'rgba(56,189,248,0.14)',
  },
  {
    id: 'sand',
    name: 'Sand',
    emoji: '🏖️',
    boardBg: '#F4E6C8',
    boardBorder: 'rgba(180,130,60,0.30)',
    divider: 'rgba(180,130,60,0.18)',
    pattern: 'dots',
    patternColor: 'rgba(180,130,60,0.20)',
  },
  {
    id: 'noir',
    name: 'Noir',
    emoji: '⚫',
    boardBg: '#080808',
    boardBorder: 'rgba(255,255,255,0.14)',
    divider: 'rgba(255,255,255,0.08)',
    pattern: 'lines',
    patternColor: 'rgba(255,255,255,0.07)',
  },
];

export const DEFAULT_BOARD_THEME_ID = 'midnight';

export function getBoardTheme(id: string): BoardTheme {
  return BOARD_THEMES.find(t => t.id === id) ?? BOARD_THEMES[0];
}
