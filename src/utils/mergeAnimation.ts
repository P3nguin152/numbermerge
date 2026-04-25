import { Tile } from '../types/game';
import {
  mergeHorizontal,
  mergeVertical,
  mergeLShape,
  applyGravityToGrid,
  GRID_ROWS,
  GRID_COLS,
} from './mergeLogic';

export interface AnimationStep {
  grid: (Tile | null)[][];
  score: number;
  mergeCount: number;
  pass: number;
}

export interface AnimationResult {
  grid: (Tile | null)[][];
  score: number;
  tripleMergeCount: number;
  totalMergeCount: number;
}

/**
 * Settle the grid with step-by-step animation.
 * Calls onStep callback after each merge pass with intermediate state.
 * Adds delay between passes for visual effect.
 */
export async function settleGridWithAnimation(
  grid: (Tile | null)[][],
  dropColumn: number,
  onStep: (step: AnimationStep) => void,
  delayMs: number = 200
): Promise<AnimationResult> {
  let totalScore = 0;
  let tripleMergeCount = 0;
  let totalMergeCount = 0;
  let pass = 0;

  for (pass = 0; pass < 32; pass++) {
    // Apply gravity
    applyGravityToGrid(grid);

    // L-shape merges
    const l = mergeLShape(grid);
    totalScore += l.scoreGained;
    tripleMergeCount += l.tripleMergeCount;
    totalMergeCount += l.mergeCount;

    // Vertical merges
    const v = mergeVertical(grid);
    totalScore += v.scoreGained;
    tripleMergeCount += v.tripleMergeCount;
    totalMergeCount += v.mergeCount;

    // Apply gravity again
    applyGravityToGrid(grid);

    // Horizontal merges
    const h = mergeHorizontal(grid, dropColumn);
    totalScore += h.scoreGained;
    tripleMergeCount += h.tripleMergeCount;
    totalMergeCount += h.mergeCount;

    // Notify caller of this step
    onStep({
      grid: JSON.parse(JSON.stringify(grid)),
      score: totalScore,
      mergeCount: totalMergeCount,
      pass: pass + 1,
    });

    // Check if grid is stable
    if (!v.didMerge && !h.didMerge && !l.didMerge) {
      break;
    }

    // Add delay before next pass
    if (pass < 31) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Final gravity to close any remaining gaps
  applyGravityToGrid(grid);

  return {
    grid,
    score: totalScore,
    tripleMergeCount,
    totalMergeCount,
  };
}

/**
 * Quick check to count potential merges without settling the grid.
 * Used to decide whether to use animation.
 */
export function countPotentialMerges(
  grid: (Tile | null)[][],
  dropColumn: number,
  tileValue: number
): number {
  // Create a copy to test
  const testGrid = grid.map(row => row.map(tile => tile ? { ...tile } : null));
  
  // Place the tile at row 0
  if (testGrid[0]) {
    testGrid[0][dropColumn] = {
      id: 'test',
      value: tileValue,
      row: 0,
      col: dropColumn,
      isFalling: true,
      fromRow: -1,
      fromCol: dropColumn,
      isMerged: false,
    };
  }
  
  let totalMergeCount = 0;
  
  // Run one pass to check for merges
  applyGravityToGrid(testGrid);
  const l = mergeLShape(testGrid);
  totalMergeCount += l.mergeCount;
  const v = mergeVertical(testGrid);
  totalMergeCount += v.mergeCount;
  applyGravityToGrid(testGrid);
  const h = mergeHorizontal(testGrid, dropColumn);
  totalMergeCount += h.mergeCount;
  
  return totalMergeCount;
}
