import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats } from '../types/game';

const STATS_KEY = '@game_stats';

const DEFAULT_STATS: GameStats = {
  highScore: 0,
  gamesPlayed: 0,
  totalMerges: 0,
  bestTile: 2,
};

export async function loadStats(): Promise<GameStats> {
  try {
    const statsJson = await AsyncStorage.getItem(STATS_KEY);
    if (statsJson) {
      return JSON.parse(statsJson) as GameStats;
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Failed to load stats:', error);
    return DEFAULT_STATS;
  }
}

export async function saveStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

export async function updateStats(
  score: number,
  merges: number,
  bestTileInGame: number
): Promise<GameStats> {
  const currentStats = await loadStats();
  
  const newStats: GameStats = {
    highScore: Math.max(currentStats.highScore, score),
    gamesPlayed: currentStats.gamesPlayed + 1,
    totalMerges: currentStats.totalMerges + merges,
    bestTile: Math.max(currentStats.bestTile, bestTileInGame),
  };
  
  await saveStats(newStats);
  return newStats;
}
