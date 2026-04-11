import { Tile } from '../types/game';

export const GRID_ROWS = 6;
export const GRID_COLS = 6;

export interface MergeResult {
  grid: (Tile | null)[][];
  score: number;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function makeTile(value: number, row: number, col: number, opts: Partial<Tile> = {}): Tile {
  return { id: makeId(), value, row, col, isFalling: false, isMerged: false, ...opts };
}

/** Create a blank GRID_ROWS × GRID_COLS grid */
export function createEmptyGrid(): (Tile | null)[][] {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
}

/** Pick a random starting tile value (2, 4, 8, or 16) */
export function generateNextValue(): number {
  const pool = [2, 4, 8, 16];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function canDropInColumn(grid: (Tile | null)[][], col: number): boolean {
  // A column can accept a drop if it has fewer than GRID_ROWS tiles
  let tileCount = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    if (grid[row][col] !== null) {
      tileCount++;
    }
  }
  return tileCount < GRID_ROWS;
}

export function isGameOver(grid: (Tile | null)[][]): boolean {
  // Game is over when any column is full
  for (let col = 0; col < GRID_COLS; col++) {
    if (!canDropInColumn(grid, col)) return true;
  }
  return false;
}

/**
 * Apply gravity to a single column:
 * compact all non-null tiles to the bottom, preserve order.
 */
function applyGravityToColumn(col: (Tile | null)[]): (Tile | null)[] {
  const tiles = col.filter(t => t !== null) as Tile[];
  const empty: null[] = Array(GRID_ROWS - tiles.length).fill(null);
  
  // Track original positions for animation
  tiles.forEach((tile, index) => {
    if (!tile.fromRow && tile.row !== GRID_ROWS - 1 - (tiles.length - 1 - index)) {
      tile.fromRow = tile.row;
    }
  });
  
  return [...empty, ...tiles];
}

/** Extract a column from the grid */
function getColumn(grid: (Tile | null)[][], col: number): (Tile | null)[] {
  return grid.map(row => row[col]);
}

/** Write a column back into the grid (mutates) */
function setColumn(grid: (Tile | null)[][], col: number, column: (Tile | null)[]): void {
  for (let row = 0; row < GRID_ROWS; row++) {
    grid[row][col] = column[row] ? { ...column[row]!, row, col } : null;
  }
}

/** Apply gravity to every column in the whole grid */
function applyGravityToGrid(grid: (Tile | null)[][]): void {
  for (let col = 0; col < GRID_COLS; col++) {
    const settled = applyGravityToColumn(getColumn(grid, col));
    setColumn(grid, col, settled);
  }
}

/**
 * Scan every row for adjacent horizontal pairs with the same value.
 * Also checks for 3-in-a-row merges.
 * Merge each pair into the right cell, clear the left cell.
 * Returns { scoreGained, didMerge }
 */
function mergeHorizontal(grid: (Tile | null)[][]): { scoreGained: number; didMerge: boolean } {
  let scoreGained = 0;
  let didMerge = false;

  for (let row = GRID_ROWS - 1; row >= 0; row--) {
    let col = 0;
    while (col < GRID_COLS) {
      // Check for 3-in-a-row
      if (col + 2 < GRID_COLS) {
        const t1 = grid[row][col];
        const t2 = grid[row][col + 1];
        const t3 = grid[row][col + 2];

        if (t1 && t2 && t3 && t1.value === t2.value && t2.value === t3.value) {
          const mergeValue = t1.value * 2;
          scoreGained += mergeValue;

          const merged = makeTile(mergeValue, row, col + 2, { isMerged: true, fromCol: col, isMoving: true });
          grid[row][col + 2] = merged;
          grid[row][col] = null;
          grid[row][col + 1] = null;
          didMerge = true;
          col += 3;
          continue;
        }
      }

      // Check for 2-in-a-row
      if (col + 1 < GRID_COLS) {
        const left = grid[row][col];
        const right = grid[row][col + 1];

        if (left && right && left.value === right.value) {
          const mergeValue = left.value * 2;
          scoreGained += mergeValue;

          const merged = makeTile(mergeValue, row, col + 1, { isMerged: true, fromCol: col, isMoving: true });
          grid[row][col + 1] = merged;
          grid[row][col] = null;
          didMerge = true;
          col += 2;
          continue;
        }
      }
      col++;
    }
  }

  return { scoreGained, didMerge };
}

/**
 * Scan every column for vertically adjacent equal pairs (bottom-up).
 * Returns { scoreGained, didMerge }
 */
function mergeVertical(grid: (Tile | null)[][]): { scoreGained: number; didMerge: boolean } {
  let scoreGained = 0;
  let didMerge = false;

  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = GRID_ROWS - 1; row > 0; row--) {
      const bottom = grid[row][col];
      const above  = grid[row - 1][col];

      // Check for 3-in-a-column merge
      if (row > 1) {
        const top = grid[row - 2][col];

        if (bottom && above && top && bottom.value === above.value && above.value === top.value) {
          const mergeValue = bottom.value * 2;
          scoreGained += mergeValue;

          const merged = makeTile(mergeValue, row, col, { isMerged: true });
          grid[row][col] = merged;
          grid[row - 1][col] = null;
          grid[row - 2][col] = null;
          didMerge = true;
          row -= 2;
          continue;
        }
      }


      // Regular vertical merge (2-in-a-column)
      if (bottom && above && bottom.value === above.value) {
        const mergeValue = bottom.value * 2;
        scoreGained += mergeValue;

        const merged = makeTile(mergeValue, row, col, { isMerged: true });
        grid[row][col] = merged;
        grid[row - 1][col] = null;
        didMerge = true;
        row--;
      }
    }
  }

  return { scoreGained, didMerge };
}

/**
 * Fully settle the grid:
 *   gravity → vertical merges → gravity → horizontal merges → repeat until stable.
 */
function settleGrid(grid: (Tile | null)[][]): { score: number } {
  let totalScore = 0;

  for (let pass = 0; pass < 32; pass++) { // 32 passes is more than enough for any realistic chain
    applyGravityToGrid(grid);

    const v = mergeVertical(grid);
    totalScore += v.scoreGained;

    applyGravityToGrid(grid);

    const h = mergeHorizontal(grid);
    totalScore += h.scoreGained;

    if (!v.didMerge && !h.didMerge) break; // fully stable
  }

  // Final gravity to close any remaining gaps
  applyGravityToGrid(grid);

  return { score: totalScore };
}

/**
 * Drop a tile of `value` into `col`, then fully settle the grid.
 * Returns a new grid and score gained.
 */
export function dropTile(
  grid: (Tile | null)[][],
  value: number,
  col: number
): MergeResult {
  if (!canDropInColumn(grid, col)) {
    return { grid, score: 0 };
  }

  // Deep-copy the grid
  const newGrid: (Tile | null)[][] = grid.map(row => row.map(cell => cell ? { ...cell } : null));

  // Place new tile at row 0 of the target column with animation tracking
  newGrid[0][col] = makeTile(value, 0, col, { isFalling: true, fromRow: -1, fromCol: col });

  // Settle: gravity + vertical merges + horizontal merges, chained until stable
  const { score: mergeScore } = settleGrid(newGrid);

  // Add base score for dropping a tile
  const dropScore = value;

  return { grid: newGrid, score: mergeScore + dropScore };
}
