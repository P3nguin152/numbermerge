import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_COMPLETED_KEY = '@tutorial_completed';

export async function hasCompletedTutorial(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('Failed to check tutorial status:', error);
    return false;
  }
}

export async function markTutorialCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
  } catch (error) {
    console.warn('Failed to mark tutorial as completed:', error);
  }
}

export async function resetTutorial(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
  } catch (error) {
    console.warn('Failed to reset tutorial:', error);
  }
}
