import { Tile } from '../types/game';

export const GRID_ROWS = 5;
export const GRID_COLS = 5;

export interface MergeResult {
  grid: (Tile | null)[][];
  score: number;
  tripleMergeCount: number;
  totalMergeCount: number;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function makeTile(value: number, row: number, col: number, opts: Partial<Tile> = {}): Tile {
  const safeOpts = opts && typeof opts === 'object' ? opts : {};
  return { id: makeId(), value, row, col, isFalling: false, isMerged: false, ...safeOpts };
}

/** Create a blank GRID_ROWS × GRID_COLS grid */
export function createEmptyGrid(): (Tile | null)[][] {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
}

/** Pick a random starting tile value (2, 4, 8, 16, or 32) */
export function generateNextValue(rng?: any): number {
  const pool = [2, 4, 8, 16, 32];
  if (rng) {
    return rng.nextItem(pool);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function canDropInColumn(grid: (Tile | null)[][], col: number): boolean {
  // A column can accept a drop if it has fewer than GRID_ROWS tiles
  let tileCount = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    if (grid[row]?.[col] !== null && grid[row]?.[col] !== undefined) {
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
  if (!col || !Array.isArray(col)) return Array(GRID_ROWS).fill(null);
  const tiles = col.filter(t => t !== null && typeof t === 'object') as Tile[];
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
  if (!grid || !Array.isArray(grid)) return;
  for (let row = 0; row < GRID_ROWS; row++) {
    if (!grid[row]) {
      grid[row] = Array(GRID_COLS).fill(null);
    }
    const tile = column[row];
    grid[row][col] = tile && typeof tile === 'object' ? { ...tile, row, col } : null;
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
 * Returns { scoreGained, didMerge }
 */
function mergeHorizontal(grid: (Tile | null)[][], dropColumn: number): { scoreGained: number; didMerge: boolean; tripleMergeCount: number; mergeCount: number } {
  let scoreGained = 0;
  let didMerge = false;
  let tripleMergeCount = 0;
  let mergeCount = 0;

  for (let row = GRID_ROWS - 1; row >= 0; row--) {
    if (!grid[row] || !Array.isArray(grid[row])) continue;

    let col = 0;
    while (col < GRID_COLS) {
      // Check for 3-in-a-row
      if (col + 2 < GRID_COLS) {
        const t1 = grid[row][col];
        const t2 = grid[row][col + 1];
        const t3 = grid[row][col + 2];

        if (t1 && t2 && t3 && t1.value === t2.value && t2.value === t3.value) {
          const mergeValue = t1.value * 4;
          scoreGained += mergeValue;

          // If drop column is to the right of center, merge right; if left, merge left
          let mergeCol = col + 1; // default to center
          if (dropColumn < col + 1) {
            mergeCol = col; // drop column is left, merge left
          } else if (dropColumn > col + 1) {
            mergeCol = col + 2; // drop column is right, merge right
          }

          const fromCol = (mergeCol === col) ? col + 2 : col;
          const merged = makeTile(mergeValue, row, mergeCol, { isMerged: true, fromCol, isMoving: true });
          grid[row][col] = mergeCol === col ? merged : null;
          grid[row][col + 1] = mergeCol === col + 1 ? merged : null;
          grid[row][col + 2] = mergeCol === col + 2 ? merged : null;
          didMerge = true;
          tripleMergeCount++;
          mergeCount++;
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

          // Merge towards the drop column
          const mergeCol = dropColumn > col ? col + 1 : col;
          const fromCol = mergeCol === col ? col + 1 : col;
          const merged = makeTile(mergeValue, row, mergeCol, { isMerged: true, fromCol, isMoving: true });
          grid[row][col] = mergeCol === col ? merged : null;
          grid[row][col + 1] = mergeCol === col + 1 ? merged : null;
          didMerge = true;
          mergeCount++;
          col += 2;
          continue;
        }
      }
      col++;
    }
  }

  return { scoreGained, didMerge, tripleMergeCount, mergeCount };
}

/**
 * Scan for L-shaped (right-angled) merges where 3 tiles of same value form an L.
 * Returns { scoreGained, didMerge }
 */
function mergeLShape(grid: (Tile | null)[][]): { scoreGained: number; didMerge: boolean; tripleMergeCount: number; mergeCount: number } {
  let scoreGained = 0;
  let didMerge = false;
  let tripleMergeCount = 0;
  let mergeCount = 0;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const center = grid[row]?.[col];
      if (!center) continue;

      // Check all 4 possible L-shape orientations from this center
      // Pattern 1: center, right, down
      if (col + 1 < GRID_COLS && row + 1 < GRID_ROWS) {
        const right = grid[row][col + 1];
        const down = grid[row + 1][col];
        
        if (right && down && 
            center.value === right.value && 
            center.value === down.value) {
          const mergeValue = center.value * 4;
          scoreGained += mergeValue;
          const merged = makeTile(mergeValue, row, col, { isMerged: true });
          grid[row][col] = merged;
          grid[row][col + 1] = null;
          grid[row + 1][col] = null;
          didMerge = true;
          tripleMergeCount++;
          mergeCount++;
          continue;
        }
      }

      // Pattern 2: center, right, up
      if (col + 1 < GRID_COLS && row - 1 >= 0) {
        const right = grid[row][col + 1];
        const up = grid[row - 1][col];
        
        if (right && up && 
            center.value === right.value && 
            center.value === up.value) {
          const mergeValue = center.value * 4;
          scoreGained += mergeValue;
          const merged = makeTile(mergeValue, row, col, { isMerged: true });
          grid[row][col] = merged;
          grid[row][col + 1] = null;
          grid[row - 1][col] = null;
          didMerge = true;
          tripleMergeCount++;
          continue;
        }
      }

      // Pattern 3: center, left, down
      if (col - 1 >= 0 && row + 1 < GRID_ROWS) {
        const left = grid[row][col - 1];
        const down = grid[row + 1][col];
        
        if (left && down && 
            center.value === left.value && 
            center.value === down.value) {
          const mergeValue = center.value * 4;
          scoreGained += mergeValue;
          const merged = makeTile(mergeValue, row, col, { isMerged: true });
          grid[row][col] = merged;
          grid[row][col - 1] = null;
          grid[row + 1][col] = null;
          didMerge = true;
          tripleMergeCount++;
          continue;
        }
      }

      // Pattern 4: center, left, up
      if (col - 1 >= 0 && row - 1 >= 0) {
        const left = grid[row][col - 1];
        const up = grid[row - 1][col];
        
        if (left && up && 
            center.value === left.value && 
            center.value === up.value) {
          const mergeValue = center.value * 4;
          scoreGained += mergeValue;
          const merged = makeTile(mergeValue, row, col, { isMerged: true });
          grid[row][col] = merged;
          grid[row][col - 1] = null;
          grid[row - 1][col] = null;
          didMerge = true;
          tripleMergeCount++;
          continue;
        }
      }
    }
  }

  return { scoreGained, didMerge, tripleMergeCount, mergeCount };
}

/**
 * Scan every column for vertically adjacent equal pairs (bottom-up).
 * Returns { scoreGained, didMerge }
 */
function mergeVertical(grid: (Tile | null)[][]): { scoreGained: number; didMerge: boolean; tripleMergeCount: number; mergeCount: number } {
  let scoreGained = 0;
  let didMerge = false;
  let tripleMergeCount = 0;
  let mergeCount = 0;

  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = GRID_ROWS - 1; row > 0; row--) {
      if (!grid[row] || !grid[row - 1]) continue;
      const bottom = grid[row][col];
      const above  = grid[row - 1][col];

      // Check for 3-in-a-column merge
      if (row > 1) {
        if (!grid[row - 2]) continue;
        const top = grid[row - 2][col];

        if (bottom && above && top && bottom.value === above.value && above.value === top.value) {
          const mergeValue = bottom.value * 4;
          scoreGained += mergeValue;

          const merged = makeTile(mergeValue, row, col, { isMerged: true });
          grid[row][col] = merged;
          grid[row - 1][col] = null;
          grid[row - 2][col] = null;
          didMerge = true;
          tripleMergeCount++;
          mergeCount++;
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
        mergeCount++; // Add this line
        row--;
      }
    }
  }

  return { scoreGained, didMerge, tripleMergeCount, mergeCount };
}

/**
 * Fully settle the grid:
 *   gravity → L-shape merges → vertical merges → gravity → horizontal merges → repeat until stable.
 */
function settleGrid(grid: (Tile | null)[][], dropColumn: number): { score: number; tripleMergeCount: number; totalMergeCount: number } {
  let totalScore = 0;
  let tripleMergeCount = 0;
  let totalMergeCount = 0;

  for (let pass = 0; pass < 32; pass++) { // 32 passes is more than enough for any realistic chain
    applyGravityToGrid(grid);

    const l = mergeLShape(grid);
    totalScore += l.scoreGained;
    tripleMergeCount += l.tripleMergeCount;
    totalMergeCount += l.mergeCount;

    const v = mergeVertical(grid);
    totalScore += v.scoreGained;
    tripleMergeCount += v.tripleMergeCount;
    totalMergeCount += v.mergeCount;

    applyGravityToGrid(grid);

    const h = mergeHorizontal(grid, dropColumn);
    totalScore += h.scoreGained;
    tripleMergeCount += h.tripleMergeCount;
    totalMergeCount += h.mergeCount;

    if (!v.didMerge && !h.didMerge && !l.didMerge) break; // fully stable
  }

  // Final gravity to close any remaining gaps
  applyGravityToGrid(grid);

  return { score: totalScore, tripleMergeCount, totalMergeCount };
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
  if (!grid || !Array.isArray(grid) || !canDropInColumn(grid, col)) {
    return { grid: grid || createEmptyGrid(), score: 0, tripleMergeCount: 0, totalMergeCount: 0 };
  }

  // Deep-copy the grid, resetting isMerged flag on existing tiles
  const newGrid: (Tile | null)[][] = Array.from({ length: GRID_ROWS }, (_, rowIndex) => {
    const sourceRow = Array.isArray(grid[rowIndex]) ? grid[rowIndex] : [];
    return Array.from({ length: GRID_COLS }, (_, colIndex) => {
      const cell = sourceRow[colIndex];
      return cell && typeof cell === 'object' ? { ...cell, isMerged: false } : null;
    });
  });

  // Place new tile at row 0 of the target column with animation tracking
  if (newGrid[0] && Array.isArray(newGrid[0])) {
    newGrid[0][col] = makeTile(value, 0, col, { isFalling: true, fromRow: -1, fromCol: col });
  }

  // Settle: gravity + vertical merges + horizontal merges, chained until stable
  const { score: mergeScore, tripleMergeCount, totalMergeCount } = settleGrid(newGrid, col);

  // Add base score for dropping a tile
  const dropScore = value;

  return { grid: newGrid, score: mergeScore + dropScore, tripleMergeCount, totalMergeCount };
}
