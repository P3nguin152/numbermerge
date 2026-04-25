import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyChallenge, UserChallengeStatus } from '../types/dailyChallenge';

const STORAGE_KEY = 'daily_challenge_progress';
const STATUS_KEY = 'daily_challenge_status';

/**
 * Save challenge progress to local storage
 */
export async function saveChallengeProgress(challenge: DailyChallenge): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  } catch (error) {
    console.error('Error saving challenge progress:', error);
  }
}

/**
 * Load challenge progress from local storage
 */
export async function loadChallengeProgress(): Promise<DailyChallenge | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading challenge progress:', error);
    return null;
  }
}

/**
 * Clear challenge progress from local storage
 */
export async function clearChallengeProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing challenge progress:', error);
  }
}

/**
 * Save user challenge status to local storage
 */
export async function saveChallengeStatus(status: UserChallengeStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('Error saving challenge status:', error);
  }
}

/**
 * Load user challenge status from local storage
 */
export async function loadChallengeStatus(): Promise<UserChallengeStatus | null> {
  try {
    const data = await AsyncStorage.getItem(STATUS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading challenge status:', error);
    return null;
  }
}

/**
 * Clear user challenge status from local storage
 */
export async function clearChallengeStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STATUS_KEY);
  } catch (error) {
    console.error('Error clearing challenge status:', error);
  }
}
