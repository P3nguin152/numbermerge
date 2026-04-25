import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationType = 'daily_challenge' | 'streak_warning' | 'engagement';

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Add notification response listener
Notifications.addNotificationResponseReceivedListener((response) => {
  console.log('Notification received:', response.notification.request.content);
  console.log('Notification data:', response.notification.request.content.data);
});

// Notification content for each type
const NOTIFICATION_CONTENT: Record<NotificationType, NotificationContent> = {
  daily_challenge: {
    title: 'Daily Challenge Ready! 🎯',
    body: 'Your daily challenge is waiting. Come play and maintain your streak!',
    data: { type: 'daily_challenge' },
  },
  streak_warning: {
    title: 'Don\'t Break Your Streak! 🔥',
    body: 'You haven\'t played today. Complete the daily challenge to keep your streak alive!',
    data: { type: 'streak_warning' },
  },
  engagement: {
    title: 'Time to Play! 🎮',
    body: 'Beat your high score and climb the leaderboard!',
    data: { type: 'engagement' },
  },
};

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Get current notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error getting notification permission status:', error);
    return 'undetermined' as Notifications.PermissionStatus;
  }
}

/**
 * Schedule a notification
 */
export async function scheduleNotification(
  type: NotificationType,
  delaySeconds: number
): Promise<string | null> {
  try {
    const content = NOTIFICATION_CONTENT[type];
    console.log('Scheduling notification:', type, 'in', delaySeconds, 'seconds');
    
    const trigger = { seconds: delaySeconds };
    console.log('Trigger:', trigger);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger,
    });

    console.log('Notification scheduled with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Schedule a notification for a specific time of day
 */
export async function scheduleNotificationAtTime(
  type: NotificationType,
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const content = NOTIFICATION_CONTENT[type];
    
    const trigger = {
      hour,
      minute,
      repeats: false,
    };
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification at time:', error);
    return null;
  }
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Cancel notifications of a specific type
 */
export async function cancelNotificationsByType(type: NotificationType): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();
    for (const notification of scheduled) {
      if (notification.content.data?.type === type) {
        await cancelNotification(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling notifications by type:', error);
  }
}
