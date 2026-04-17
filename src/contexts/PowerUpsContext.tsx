import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { GameState } from '../types/game';
import { createEmptyGrid, GRID_ROWS, GRID_COLS } from '../utils/mergeLogic';
import { soundManager } from '../utils/soundManager';
import { loadDailyPowerups, saveDailyPowerups } from '../utils/powerupsStorage';

interface PowerUpsContextType {
  // Undo system
  moveHistory: GameState[];
  undoCount: number;
  handleUndo: () => void;
  saveStateForUndo: (state: GameState) => void;
  
  // Power-ups
  shuffleCount: number;
  removeTilesCount: number;
  doublePointsCount: number;
  doublePointsActive: boolean;
  
  handleShuffle: (currentGrid: GameState['grid'], setGameState: (state: GameState | ((prev: GameState) => GameState)) => void) => void;
  handleRemoveTiles: (currentGrid: GameState['grid'], setGameState: (state: GameState | ((prev: GameState) => GameState)) => void) => void;
  handleDoublePoints: () => void;
  resetDoublePoints: () => void;
}

const PowerUpsContext = createContext<PowerUpsContextType | undefined>(undefined);

const MAX_HISTORY = 5;

export function PowerUpsProvider({ children }: { children: ReactNode }) {
  // Undo system
  const [moveHistory, setMoveHistory] = useState<GameState[]>([]);
  const [undoCount, setUndoCount] = useState(1);
  
  // Power-ups - initialized from daily storage
  const [shuffleCount, setShuffleCount] = useState(1);
  const [removeTilesCount, setRemoveTilesCount] = useState(1);
  const [doublePointsCount, setDoublePointsCount] = useState(1);
  const [doublePointsActive, setDoublePointsActive] = useState(false);

  // Load daily powerups on mount
  useEffect(() => {
    loadDailyPowerups().then(dailyUsage => {
      setUndoCount(dailyUsage.undoCount);
      setShuffleCount(dailyUsage.shuffleCount);
      setRemoveTilesCount(dailyUsage.removeTilesCount);
      setDoublePointsCount(dailyUsage.doublePointsCount);
    });
  }, []);

  // Undo handlers
  const saveStateForUndo = useCallback((state: GameState) => {
    setMoveHistory(prev => {
      // Deep clone the grid to prevent reference sharing
      const clonedGrid = state.grid.map(row => row.map(tile => tile ? { ...tile } : null));
      const newHistory = [...prev, { ...state, grid: clonedGrid }];
      return newHistory.slice(-MAX_HISTORY);
    });
  }, []);

  const handleUndo = useCallback(async () => {
    if (moveHistory.length === 0 || undoCount <= 0) return null;

    const previousState = moveHistory[moveHistory.length - 1];
    setMoveHistory(prev => prev.slice(0, -1));
    const newCount = undoCount - 1;
    setUndoCount(newCount);
    
    // Save to daily storage
    await saveDailyPowerups({
      date: new Date().toISOString().split('T')[0],
      undoCount: newCount,
      shuffleCount,
      removeTilesCount,
      doublePointsCount,
    });
    
    soundManager.playSound('drop');
    
    return previousState;
  }, [moveHistory, undoCount, shuffleCount, removeTilesCount, doublePointsCount]);

  // Power-up: Shuffle board
  const handleShuffle = useCallback(async (currentGrid: GameState['grid'], setGameState: (state: GameState | ((prev: GameState) => GameState)) => void) => {
    if (shuffleCount <= 0) return;

    // Collect all tiles
    const tiles: any[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (currentGrid[row][col]) {
          tiles.push(currentGrid[row][col]);
        }
      }
    }

    // Shuffle tiles
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Create new grid with shuffled tiles
    const newGrid = createEmptyGrid();
    let tileIndex = 0;
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (tileIndex < tiles.length) {
          newGrid[row][col] = { ...tiles[tileIndex], row, col, isFalling: true };
          tileIndex++;
        }
      }
    }

    setGameState(prev => ({ ...prev, grid: newGrid }));
    const newCount = shuffleCount - 1;
    setShuffleCount(newCount);
    
    // Save to daily storage
    await saveDailyPowerups({
      date: new Date().toISOString().split('T')[0],
      undoCount,
      shuffleCount: newCount,
      removeTilesCount,
      doublePointsCount,
    });
    
    soundManager.playSound('merge');
  }, [shuffleCount, removeTilesCount, doublePointsCount]);

  // Power-up: Remove tiles (removes lowest value tiles)
  const handleRemoveTiles = useCallback(async (currentGrid: GameState['grid'], setGameState: (state: GameState | ((prev: GameState) => GameState)) => void) => {
    if (removeTilesCount <= 0) return;

    // Find lowest value tiles
    let minValue = Infinity;
    const newGrid = currentGrid.map(row => [...row]);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const tile = newGrid[row][col];
        if (tile && tile.value < minValue) {
          minValue = tile.value;
        }
      }
    }

    // Remove all tiles with the lowest value
    let removedCount = 0;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const tile = newGrid[row][col];
        if (tile && tile.value === minValue && removedCount < 3) {
          newGrid[row][col] = null;
          removedCount++;
        }
      }
    }

    // Apply gravity after removal
    for (let col = 0; col < GRID_COLS; col++) {
      const column = newGrid.map(row => row[col]);
      const tiles = column.filter(t => t !== null) as any[];
      const empty = Array(GRID_ROWS - tiles.length).fill(null);
      const settled = [...empty, ...tiles];
      for (let row = 0; row < GRID_ROWS; row++) {
        newGrid[row][col] = settled[row] ? { ...settled[row], row, col } : null;
      }
    }

    setGameState(prev => ({ ...prev, grid: newGrid }));
    const newCount = removeTilesCount - 1;
    setRemoveTilesCount(newCount);
    
    // Save to daily storage
    await saveDailyPowerups({
      date: new Date().toISOString().split('T')[0],
      undoCount,
      shuffleCount,
      removeTilesCount: newCount,
      doublePointsCount,
    });
    
    soundManager.playSound('merge');
  }, [shuffleCount, removeTilesCount, doublePointsCount]);

  // Power-up: Double points
  const handleDoublePoints = useCallback(async () => {
    if (doublePointsCount <= 0 || doublePointsActive) return;

    setDoublePointsActive(true);
    const newCount = doublePointsCount - 1;
    setDoublePointsCount(newCount);
    
    // Save to daily storage (but don't deactivate - it stays active for the rest of the game)
    await saveDailyPowerups({
      date: new Date().toISOString().split('T')[0],
      undoCount,
      shuffleCount,
      removeTilesCount,
      doublePointsCount: newCount,
    });
    
    soundManager.playSound('merge');
  }, [shuffleCount, removeTilesCount, doublePointsCount, doublePointsActive, undoCount]);

  // Reset double points active state (called when starting a new game)
  const resetDoublePoints = useCallback(() => {
    setDoublePointsActive(false);
  }, []);

  const value: PowerUpsContextType = {
    moveHistory,
    undoCount,
    handleUndo,
    saveStateForUndo,
    shuffleCount,
    removeTilesCount,
    doublePointsCount,
    doublePointsActive,
    handleShuffle,
    handleRemoveTiles,
    handleDoublePoints,
    resetDoublePoints,
  };

  return (
    <PowerUpsContext.Provider value={value}>
      {children}
    </PowerUpsContext.Provider>
  );
}

export function usePowerUps() {
  const context = useContext(PowerUpsContext);
  if (context === undefined) {
    throw new Error('usePowerUps must be used within a PowerUpsProvider');
  }
  return context;
}
