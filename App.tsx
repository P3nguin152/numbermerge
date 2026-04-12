import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
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
      </UserProvider>
    </SafeAreaProvider>
  );
}
