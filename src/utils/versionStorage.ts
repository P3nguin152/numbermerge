import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SHOWN_VERSION_KEY = '@last_shown_version';

export async function getLastShownVersion(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SHOWN_VERSION_KEY);
  } catch (error) {
    console.error('Failed to get last shown version:', error);
    return null;
  }
}

export async function setLastShownVersion(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_VERSION_KEY, version);
  } catch (error) {
    console.error('Failed to set last shown version:', error);
  }
}

export async function clearLastShownVersion(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_SHOWN_VERSION_KEY);
  } catch (error) {
    console.error('Failed to clear last shown version:', error);
  }
}
