import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@game_settings';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
  boardTheme: string;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
  boardTheme: 'midnight',
};

export async function loadSettings(): Promise<GameSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

export async function updateSetting<K extends keyof GameSettings>(
  key: K,
  value: GameSettings[K]
): Promise<void> {
  const settings = await loadSettings();
  settings[key] = value;
  await saveSettings(settings);
}
