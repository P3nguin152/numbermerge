import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types/game';

const GAME_STATE_KEY = '@game_state';
const MERGES_KEY = '@game_merges';
const BEST_TILE_KEY = '@game_best_tile';

function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as GameState;

  return (
    Array.isArray(candidate.grid) &&
    candidate.grid.every(row => Array.isArray(row)) &&
    typeof candidate.score === 'number' &&
    typeof candidate.gameOver === 'boolean' &&
    typeof candidate.nextTile === 'number'
  );
}

export async function saveGameState(
  gameState: GameState,
  merges: number,
  bestTile: number
): Promise<void> {
  try {
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    await AsyncStorage.setItem(MERGES_KEY, merges.toString());
    await AsyncStorage.setItem(BEST_TILE_KEY, bestTile.toString());
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export async function loadGameState(): Promise<{
  gameState: GameState | null;
  merges: number;
  bestTile: number;
}> {
  try {
    const gameStateJson = await AsyncStorage.getItem(GAME_STATE_KEY);
    const mergesStr = await AsyncStorage.getItem(MERGES_KEY);
    const bestTileStr = await AsyncStorage.getItem(BEST_TILE_KEY);

    const parsedGameState = gameStateJson ? JSON.parse(gameStateJson) : null;
    
    // Validate grid dimensions match current config
    let gameState = null;
    if (parsedGameState && isValidGameState(parsedGameState)) {
      const grid = parsedGameState.grid;
      if (grid && grid.length === 5 && grid[0]?.length === 5) {
        gameState = parsedGameState;
      } else {
        // Clear invalid grid state
        await clearGameState();
      }
    }

    const parsedMerges = mergesStr ? parseInt(mergesStr, 10) : 0;
    const merges = Number.isFinite(parsedMerges) ? parsedMerges : 0;

    const parsedBestTile = bestTileStr ? parseInt(bestTileStr, 10) : 2;
    const bestTile = Number.isFinite(parsedBestTile) ? parsedBestTile : 2;

    return { gameState, merges, bestTile };
  } catch (error) {
    console.error('Failed to load game state:', error);
    return { gameState: null, merges: 0, bestTile: 2 };
  }
}

export async function clearGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GAME_STATE_KEY);
    await AsyncStorage.removeItem(MERGES_KEY);
    await AsyncStorage.removeItem(BEST_TILE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

export async function hasSavedGame(): Promise<boolean> {
  try {
    const gameStateJson = await AsyncStorage.getItem(GAME_STATE_KEY);
    return gameStateJson !== null;
  } catch (error) {
    console.error('Failed to check saved game:', error);
    return false;
  }
}

// Daily challenge completion tracking
const DAILY_COMPLETED_KEY = '@daily_completed';

export async function setDailyCompleted(score: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.stringify({ date: today, score });
    await AsyncStorage.setItem(DAILY_COMPLETED_KEY, data);
  } catch (error) {
    console.error('Failed to save daily completion:', error);
  }
}

export async function getDailyCompletion(): Promise<{ date: string; score: number } | null> {
  try {
    const data = await AsyncStorage.getItem(DAILY_COMPLETED_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load daily completion:', error);
    return null;
  }
}

export async function isDailyCompletedToday(): Promise<boolean> {
  try {
    const completion = await getDailyCompletion();
    if (!completion) return false;
    const today = new Date().toISOString().split('T')[0];
    return completion.date === today;
  } catch (error) {
    console.error('Failed to check daily completion:', error);
    return false;
  }
}
