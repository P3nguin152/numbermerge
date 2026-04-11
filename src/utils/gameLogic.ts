import { Tile } from '../types/game';

const GRID_SIZE = 6;
const COLS = 5;

export function createEmptyGrid(): (Tile | null)[][] {
  return Array(GRID_SIZE).fill(null).map(() => Array(COLS).fill(null));
}

export function generateNextTile(): number {
  const tiles = [2, 4, 8, 16];
  return tiles[Math.floor(Math.random() * tiles.length)];
}

export function dropTile(grid: (Tile | null)[][], value: number, col: number): {
  grid: (Tile | null)[][];
  score: number;
  merged: boolean;
} {
  const newGrid = grid.map(row => [...row]);
  let score = 0;
  let merged = false;

  // Find the lowest empty cell in the column
  let targetRow = GRID_SIZE - 1;
  while (targetRow >= 0 && newGrid[targetRow][col] !== null) {
    targetRow--;
  }

  if (targetRow < 0) {
    // Column is full
    return { grid: newGrid, score, merged };
  }

  // Create the new tile
  const newTile: Tile = {
    id: Math.random().toString(36).substr(2, 9),
    value,
    row: targetRow,
    col,
    isFalling: true,
    isMerged: false,
  };
  newGrid[targetRow][col] = newTile;

  // Check for merge with tile below
  if (targetRow < GRID_SIZE - 1) {
    const belowTile = newGrid[targetRow + 1][col];
    if (belowTile && belowTile.value === value) {
      // Merge
      const mergedTile: Tile = {
        id: Math.random().toString(36).substr(2, 9),
        value: value * 2,
        row: targetRow + 1,
        col,
        isFalling: false,
        isMerged: true,
      };
      newGrid[targetRow + 1][col] = mergedTile;
      newGrid[targetRow][col] = null;
      score += mergedTile.value;
      merged = true;

      // Check for chain reaction
      return handleChainReaction(newGrid, targetRow + 1, col, score);
    }
  }

  return { grid: newGrid, score, merged };
}

function handleChainReaction(
  grid: (Tile | null)[][],
  row: number,
  col: number,
  currentScore: number
): { grid: (Tile | null)[][]; score: number; merged: boolean } {
  let newGrid = grid.map(row => row.map(tile => tile ? { ...tile, isMerged: false, isFalling: false } : null));
  let score = currentScore;
  let merged = false;

  const currentTile = newGrid[row][col];
  if (!currentTile) return { grid: newGrid, score, merged };

  // Check below for merge
  if (row < GRID_SIZE - 1) {
    const belowTile = newGrid[row + 1][col];
    if (belowTile && belowTile.value === currentTile.value) {
      const mergedTile: Tile = {
        id: Math.random().toString(36).substr(2, 9),
        value: currentTile.value * 2,
        row: row + 1,
        col,
        isFalling: false,
        isMerged: true,
      };
      newGrid[row + 1][col] = mergedTile;
      newGrid[row][col] = null;
      score += mergedTile.value;
      merged = true;

      // Continue chain reaction
      return handleChainReaction(newGrid, row + 1, col, score);
    }
  }

  return { grid: newGrid, score, merged };
}

export function isGameOver(grid: (Tile | null)[][]): boolean {
  // Check if any column has space
  for (let col = 0; col < COLS; col++) {
    if (grid[0][col] === null) {
      return false;
    }
  }
  return true;
}

export function canDropInColumn(grid: (Tile | null)[][], col: number): boolean {
  return grid[0][col] === null;
}
