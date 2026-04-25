import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import GameBoard from './src/components/GameBoard';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import HowToPlayScreen from './src/screens/HowToPlayScreen';
import GameModeSelectionScreen from './src/screens/GameModeSelectionScreen';
import TimeAttackScreen from './src/screens/TimeAttackScreen';
import LimitedMovesScreen from './src/screens/LimitedMovesScreen';
import DailyChallengeScreen from './src/screens/DailyChallengeScreen';
import { UserProvider } from './src/contexts/UserContext';
import { AdProvider } from './src/contexts/AdContext';
import { PowerUpsProvider } from './src/contexts/PowerUpsContext';
import { BoardThemeProvider } from './src/contexts/BoardThemeContext';
import {
  requestNotificationPermissions,
  scheduleNotificationAtTime,
  cancelAllNotifications,
} from './src/utils/notifications';
import {
  loadNotificationsEnabled,
  updateLastOpenedDate,
  resetNotificationCounter,
  getNotificationsSentToday,
  getLastNotificationSentTime,
  hasPlayedToday,
  getStreakCount,
  getHoursSince,
  isFromToday,
  getLastOpenedDate,
} from './src/utils/notificationStorage';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Update last opened date
      await updateLastOpenedDate();
      
      // Reset notification counter for new day
      await resetNotificationCounter();
      
      // Check if notifications are enabled
      const notificationsEnabled = await loadNotificationsEnabled();
      
      if (!notificationsEnabled) {
        // Cancel all notifications if disabled
        await cancelAllNotifications();
        return;
      }
      
      // Request permissions
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        return;
      }
      
      // Check how many notifications have been sent today
      const sentToday = await getNotificationsSentToday();
      const remaining = 3 - sentToday;
      
      if (remaining <= 0) {
        return; // Already sent max 3 notifications today
      }
      
      // Get current time to determine which notifications to schedule
      const now = new Date();
      const currentHour = now.getHours();
      
      const playedToday = await hasPlayedToday();
      const streak = await getStreakCount();
      
      // Priority 1: Daily Challenge Reminder (9 AM)
      if (currentHour < 9 && remaining > 0) {
        const lastSent = await getLastNotificationSentTime('daily_challenge');
        if (!lastSent || !isFromToday(lastSent)) {
          await scheduleNotificationAtTime('daily_challenge', 9, 0);
        }
      }
      
      // Priority 2: Streak Warning (8 PM) - only if user has streak and hasn't played today
      if (currentHour < 20 && remaining > 1 && streak > 0 && !playedToday) {
        const lastSent = await getLastNotificationSentTime('streak_warning');
        if (!lastSent || !isFromToday(lastSent)) {
          await scheduleNotificationAtTime('streak_warning', 20, 0);
        }
      }
      
      // Priority 3: Engagement Nudge (after 48 hours of inactivity)
      const lastOpened = await getLastOpenedDate();
      if (lastOpened && remaining > 2) {
        const lastOpenedDate = new Date(lastOpened);
        const hoursSinceOpened = getHoursSince(lastOpenedDate.getTime());
        
        if (hoursSinceOpened >= 48) {
          const lastSent = await getLastNotificationSentTime('engagement');
          if (!lastSent || !isFromToday(lastSent)) {
            // Schedule engagement notification for noon if it's been 48+ hours
            if (currentHour < 12) {
              await scheduleNotificationAtTime('engagement', 12, 0);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AdProvider>
        <UserProvider>
          <BoardThemeProvider>
          <PowerUpsProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Game" component={GameBoard} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
                <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
                <Stack.Screen name="GameModeSelection" component={GameModeSelectionScreen} />
                <Stack.Screen name="TimeAttack" component={TimeAttackScreen} />
                <Stack.Screen name="LimitedMoves" component={LimitedMovesScreen} />
                <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </PowerUpsProvider>
          </BoardThemeProvider>
        </UserProvider>
      </AdProvider>
    </SafeAreaProvider>
  );
}
