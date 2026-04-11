import { Tile, SpecialTileType } from '../types/game';

export const GRID_ROWS = 6;
export const GRID_COLS = 6;

/**
 * Generate a special tile type based on tile value and rarity system
 * Higher value tiles have higher chance of being special
 */
export function generateSpecialTile(value: number): SpecialTileType | null {
  const rand = Math.random();
  
  // Higher value tiles have higher chance of being special
  const rarityBonus = Math.min(value / 2048, 0.15);
  
  if (rand < 0.02 + rarityBonus) return 'bomb';
  if (rand < 0.04 + rarityBonus) return 'rainbow';
  if (rand < 0.06 + rarityBonus) return 'multiplier';
  
  return null;
}

/**
 * Apply bomb effect: clears 3x3 area around the tile
 */
export function applyBombEffect(grid: (Tile | null)[][], row: number, col: number): void {
  for (let r = Math.max(0, row - 1); r <= Math.min(GRID_ROWS - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(GRID_COLS - 1, col + 1); c++) {
      grid[r][c] = null;
    }
  }
}

/**
 * Apply multiplier effect: boosts score of next merge
 */
export function applyMultiplierEffect(tile: Tile): Tile {
  return { ...tile, multiplierValue: tile.multiplierValue ? tile.multiplierValue + 1 : 2 };
}

/**
 * Check if a tile has a bomb special type
 */
export function hasBombTile(tile: Tile | null): boolean {
  return tile?.specialType === 'bomb';
}

/**
 * Check if a tile has a rainbow special type
 */
export function hasRainbowTile(tile: Tile | null): boolean {
  return tile?.specialType === 'rainbow';
}

/**
 * Check if any tile in an array has a bomb special type
 */
export function hasAnyBomb(tiles: (Tile | null)[]): boolean {
  return tiles.some(tile => tile?.specialType === 'bomb');
}

/**
 * Check if any tile in an array has a rainbow special type
 */
export function hasAnyRainbow(tiles: (Tile | null)[]): boolean {
  return tiles.some(tile => tile?.specialType === 'rainbow');
}

/**
 * Check if a merge can happen with rainbow tiles involved
 * Rainbow tiles can merge with any tile of the same value
 */
export function canRainbowMerge(tiles: (Tile | null)[]): boolean {
  return tiles.some(tile => tile?.specialType === 'rainbow') && tiles.filter(t => t !== null).length >= 2;
}

/**
 * Calculate merge value considering rainbow tiles
 */
export function calculateMergeValue(tiles: (Tile | null)[], defaultValue: number): number {
  const hasRainbow = tiles.some(tile => tile?.specialType === 'rainbow');
  if (hasRainbow) {
    const maxValue = Math.max(...tiles.filter(t => t !== null).map(t => t!.value));
    return maxValue * 2;
  }
  return defaultValue * 2;
}

/**
 * Calculate final score with multipliers
 */
export function calculateScoreWithMultipliers(baseScore: number, tiles: (Tile | null)[]): number {
  let finalScore = baseScore;
  for (const tile of tiles) {
    if (tile?.multiplierValue) {
      finalScore *= tile.multiplierValue;
    }
  }
  return finalScore;
}

/**
 * Apply special tile effects to a merged tile
 */
export function applySpecialTileToMerged(
  tile: Tile,
  specialType: SpecialTileType | null
): Tile {
  if (!specialType) return tile;
  
  const merged = { ...tile, specialType };
  if (specialType === 'multiplier') {
    merged.multiplierValue = 2;
  }
  return merged;
}
