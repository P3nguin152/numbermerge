import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationType } from './notifications';

// Storage keys
const NOTIFICATIONS_ENABLED_KEY = '@numbermerge_notifications_enabled';
const NOTIFICATIONS_SENT_TODAY_KEY = '@numbermerge_notifications_sent_today';
const NOTIFICATION_LAST_SENT_KEY = '@numbermerge_notification_last_sent_';
const LAST_OPENED_DATE_KEY = '@numbermerge_last_opened_date';
const STREAK_COUNT_KEY = '@numbermerge_streak_count';
const LAST_PLAYED_DATE_KEY = '@numbermerge_last_played_date';

/**
 * Save whether notifications are enabled
 */
export async function saveNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.error('Error saving notifications enabled:', error);
  }
}

/**
 * Load whether notifications are enabled
 */
export async function loadNotificationsEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Error loading notifications enabled:', error);
    return false;
  }
}

/**
 * Get the count of notifications sent today
 */
export async function getNotificationsSentToday(): Promise<number> {
  try {
    const today = getTodayDateString();
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_SENT_TODAY_KEY);
    
    if (!stored) {
      return 0;
    }
    
    const data = JSON.parse(stored);
    if (data.date !== today) {
      // Reset counter for new day
      await AsyncStorage.setItem(NOTIFICATIONS_SENT_TODAY_KEY, JSON.stringify({ date: today, count: 0 }));
      return 0;
    }
    
    return data.count;
  } catch (error) {
    console.error('Error getting notifications sent today:', error);
    return 0;
  }
}

/**
 * Record that a notification was sent
 */
export async function recordNotificationSent(type: NotificationType): Promise<void> {
  try {
    const today = getTodayDateString();
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_SENT_TODAY_KEY);
    
    let count = 0;
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        count = data.count;
      }
    }
    
    count++;
    await AsyncStorage.setItem(NOTIFICATIONS_SENT_TODAY_KEY, JSON.stringify({ date: today, count }));
    
    // Also record the last sent time for this specific notification type
    await AsyncStorage.setItem(NOTIFICATION_LAST_SENT_KEY + type, Date.now().toString());
  } catch (error) {
    console.error('Error recording notification sent:', error);
  }
}

/**
 * Get the last time a specific notification type was sent
 */
export async function getLastNotificationSentTime(type: NotificationType): Promise<number | null> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_LAST_SENT_KEY + type);
    return value ? parseInt(value, 10) : null;
  } catch (error) {
    console.error('Error getting last notification sent time:', error);
    return null;
  }
}

/**
 * Get the last date the app was opened
 */
export async function getLastOpenedDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_OPENED_DATE_KEY);
  } catch (error) {
    console.error('Error getting last opened date:', error);
    return null;
  }
}

/**
 * Update the last opened date to today
 */
export async function updateLastOpenedDate(): Promise<void> {
  try {
    const today = getTodayDateString();
    await AsyncStorage.setItem(LAST_OPENED_DATE_KEY, today);
  } catch (error) {
    console.error('Error updating last opened date:', error);
  }
}

/**
 * Get the current streak count
 */
export async function getStreakCount(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STREAK_COUNT_KEY);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting streak count:', error);
    return 0;
  }
}

/**
 * Set the streak count
 */
export async function setStreakCount(count: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STREAK_COUNT_KEY, count.toString());
  } catch (error) {
    console.error('Error setting streak count:', error);
  }
}

/**
 * Get the last date the user played
 */
export async function getLastPlayedDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_PLAYED_DATE_KEY);
  } catch (error) {
    console.error('Error getting last played date:', error);
    return null;
  }
}

/**
 * Update the last played date to today
 */
export async function updateLastPlayedDate(): Promise<void> {
  try {
    const today = getTodayDateString();
    await AsyncStorage.setItem(LAST_PLAYED_DATE_KEY, today);
  } catch (error) {
    console.error('Error updating last played date:', error);
  }
}

/**
 * Check if user played today
 */
export async function hasPlayedToday(): Promise<boolean> {
  try {
    const lastPlayed = await getLastPlayedDate();
    const today = getTodayDateString();
    return lastPlayed === today;
  } catch (error) {
    console.error('Error checking if played today:', error);
    return false;
  }
}

/**
 * Reset notification counter (call at midnight or on app launch for new day)
 */
export async function resetNotificationCounter(): Promise<void> {
  try {
    const today = getTodayDateString();
    await AsyncStorage.setItem(NOTIFICATIONS_SENT_TODAY_KEY, JSON.stringify({ date: today, count: 0 }));
  } catch (error) {
    console.error('Error resetting notification counter:', error);
  }
}

/**
 * Get today's date as a string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Check if a timestamp is from today
 */
export function isFromToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a timestamp is from yesterday
 */
export function isFromYesterday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Get hours difference between now and a timestamp
 */
export function getHoursSince(timestamp: number): number {
  const now = Date.now();
  const diffMs = now - timestamp;
  return diffMs / (1000 * 60 * 60);
}
