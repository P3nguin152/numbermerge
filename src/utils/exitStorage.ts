import AsyncStorage from '@react-native-async-storage/async-storage';

const EXIT_COUNT_KEY = '@game_exit_count';

export async function getExitCount(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(EXIT_COUNT_KEY);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.warn('Failed to get exit count:', error);
    return 0;
  }
}

export async function incrementExitCount(): Promise<number> {
  try {
    const currentCount = await getExitCount();
    const newCount = currentCount + 1;
    await AsyncStorage.setItem(EXIT_COUNT_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.warn('Failed to increment exit count:', error);
    return 0;
  }
}

export async function resetExitCount(): Promise<void> {
  try {
    await AsyncStorage.setItem(EXIT_COUNT_KEY, '0');
  } catch (error) {
    console.warn('Failed to reset exit count:', error);
  }
}
