import AsyncStorage from '@react-native-async-storage/async-storage';

const BANNER_KEY = '@user_banner';

export interface BannerOption {
  id: string;
  name: string;
  colors: [string, string, string];
}

const BANNER_OPTIONS: BannerOption[] = [
  { id: 'galaxy', name: 'Galaxy', colors: ['#7C5CFC', '#A78BFA', '#C084FC'] },
  { id: 'sunset', name: 'Sunset', colors: ['#FF6B6B', '#FF8E53', '#FBBF24'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0EA5E9', '#38BDF8', '#2DD4BF'] },
  { id: 'forest', name: 'Forest', colors: ['#166534', '#16A34A', '#86EFAC'] },
  { id: 'neon', name: 'Neon', colors: ['#EC4899', '#8B5CF6', '#06B6D4'] },
  { id: 'cosmic', name: 'Cosmic', colors: ['#1E1B4B', '#7C3AED', '#EC4899'] },
  { id: 'rose', name: 'Rose', colors: ['#BE123C', '#EC4899', '#F472B6'] },
  { id: 'mono', name: 'Mono', colors: ['#1F2937', '#4B5563', '#9CA3AF'] },
];

const DEFAULT_BANNER_ID = 'galaxy';

export async function getBanner(): Promise<string> {
  try {
    const banner = await AsyncStorage.getItem(BANNER_KEY);
    return banner || DEFAULT_BANNER_ID;
  } catch (error) {
    console.warn('Failed to load banner:', error);
    return DEFAULT_BANNER_ID;
  }
}

export async function setBanner(bannerId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(BANNER_KEY, bannerId);
  } catch (error) {
    console.warn('Failed to save banner:', error);
  }
}

export function getBannerOptions(): BannerOption[] {
  return BANNER_OPTIONS;
}

export function getBannerById(id: string): BannerOption {
  return BANNER_OPTIONS.find(b => b.id === id) || BANNER_OPTIONS[0];
}
