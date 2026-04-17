import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_COMPLETED_KEY = '@tutorial_completed';
const TIME_ATTACK_TUTORIAL_COMPLETED_KEY = '@time_attack_tutorial_completed';

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

export async function hasCompletedTimeAttackTutorial(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(TIME_ATTACK_TUTORIAL_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('Failed to check time attack tutorial status:', error);
    return false;
  }
}

export async function markTimeAttackTutorialCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(TIME_ATTACK_TUTORIAL_COMPLETED_KEY, 'true');
  } catch (error) {
    console.warn('Failed to mark time attack tutorial as completed:', error);
  }
}

export async function resetTimeAttackTutorial(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TIME_ATTACK_TUTORIAL_COMPLETED_KEY);
  } catch (error) {
    console.warn('Failed to reset time attack tutorial:', error);
  }
}
