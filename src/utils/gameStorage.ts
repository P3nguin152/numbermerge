import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types/game';

type GameMode = 'classic' | 'timeAttack' | 'limitedMoves';

function getStorageKeys(mode: GameMode) {
  return {
    GAME_STATE_KEY: `@game_state_${mode}`,
    MERGES_KEY: `@game_merges_${mode}`,
    BEST_TILE_KEY: `@game_best_tile_${mode}`,
    TIME_REMAINING_KEY: mode === 'timeAttack' ? `@time_remaining_${mode}` : null,
    MOVES_REMAINING_KEY: mode === 'limitedMoves' ? `@moves_remaining_${mode}` : null,
  };
}

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
  bestTile: number,
  mode: GameMode = 'classic',
  timeRemaining?: number,
  movesRemaining?: number
): Promise<void> {
  try {
    const keys = getStorageKeys(mode);
    await AsyncStorage.setItem(keys.GAME_STATE_KEY, JSON.stringify(gameState));
    await AsyncStorage.setItem(keys.MERGES_KEY, merges.toString());
    await AsyncStorage.setItem(keys.BEST_TILE_KEY, bestTile.toString());
    
    if (keys.TIME_REMAINING_KEY && timeRemaining !== undefined) {
      await AsyncStorage.setItem(keys.TIME_REMAINING_KEY, timeRemaining.toString());
    }
    
    if (keys.MOVES_REMAINING_KEY && movesRemaining !== undefined) {
      await AsyncStorage.setItem(keys.MOVES_REMAINING_KEY, movesRemaining.toString());
    }
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export async function loadGameState(
  mode: GameMode = 'classic'
): Promise<{
  gameState: GameState | null;
  merges: number;
  bestTile: number;
  timeRemaining?: number;
  movesRemaining?: number;
}> {
  try {
    const keys = getStorageKeys(mode);
    const gameStateJson = await AsyncStorage.getItem(keys.GAME_STATE_KEY);
    const mergesStr = await AsyncStorage.getItem(keys.MERGES_KEY);
    const bestTileStr = await AsyncStorage.getItem(keys.BEST_TILE_KEY);

    const parsedGameState = gameStateJson ? JSON.parse(gameStateJson) : null;
    
    // Validate grid dimensions match current config
    let gameState = null;
    if (parsedGameState && isValidGameState(parsedGameState)) {
      const grid = parsedGameState.grid;
      if (grid && grid.length === 5 && grid[0]?.length === 5) {
        gameState = parsedGameState;
      } else {
        // Clear invalid grid state
        await clearGameState(mode);
      }
    }

    const parsedMerges = mergesStr ? parseInt(mergesStr, 10) : 0;
    const merges = Number.isFinite(parsedMerges) ? parsedMerges : 0;

    const parsedBestTile = bestTileStr ? parseInt(bestTileStr, 10) : 2;
    const bestTile = Number.isFinite(parsedBestTile) ? parsedBestTile : 2;

    let timeRemaining: number | undefined;
    if (keys.TIME_REMAINING_KEY) {
      const timeStr = await AsyncStorage.getItem(keys.TIME_REMAINING_KEY);
      const parsedTime = timeStr ? parseInt(timeStr, 10) : undefined;
      timeRemaining = Number.isFinite(parsedTime) ? parsedTime : undefined;
    }

    let movesRemaining: number | undefined;
    if (keys.MOVES_REMAINING_KEY) {
      const movesStr = await AsyncStorage.getItem(keys.MOVES_REMAINING_KEY);
      const parsedMoves = movesStr ? parseInt(movesStr, 10) : undefined;
      movesRemaining = Number.isFinite(parsedMoves) ? parsedMoves : undefined;
    }

    return { gameState, merges, bestTile, timeRemaining, movesRemaining };
  } catch (error) {
    console.error('Failed to load game state:', error);
    return { gameState: null, merges: 0, bestTile: 2 };
  }
}

export async function clearGameState(mode: GameMode = 'classic'): Promise<void> {
  try {
    const keys = getStorageKeys(mode);
    await AsyncStorage.removeItem(keys.GAME_STATE_KEY);
    await AsyncStorage.removeItem(keys.MERGES_KEY);
    await AsyncStorage.removeItem(keys.BEST_TILE_KEY);
    if (keys.TIME_REMAINING_KEY) {
      await AsyncStorage.removeItem(keys.TIME_REMAINING_KEY);
    }
    if (keys.MOVES_REMAINING_KEY) {
      await AsyncStorage.removeItem(keys.MOVES_REMAINING_KEY);
    }
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

export async function hasSavedGame(mode: GameMode = 'classic'): Promise<boolean> {
  try {
    const keys = getStorageKeys(mode);
    const gameStateJson = await AsyncStorage.getItem(keys.GAME_STATE_KEY);
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
