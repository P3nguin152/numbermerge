import {
  generateSpecialTile,
  applyBombEffect,
  hasAnyBomb,
  hasAnyRainbow,
  calculateMergeValue,
  calculateScoreWithMultipliers,
  applySpecialTileToMerged,
  GRID_ROWS,
  GRID_COLS,
} from '../specialTiles';
import { Tile } from '../../types/game';

describe('specialTiles', () => {
  describe('generateSpecialTile', () => {
    it('should return null for low value tiles most of the time', () => {
      let nullCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (generateSpecialTile(2) === null) nullCount++;
      }
      expect(nullCount).toBeGreaterThan(900);
    });

    it('should have higher chance for high value tiles', () => {
      let specialCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (generateSpecialTile(2048) !== null) specialCount++;
      }
      expect(specialCount).toBeGreaterThan(50);
    });

    it('should return valid special tile type when not null', () => {
      const validTypes = ['bomb', 'rainbow', 'multiplier'];
      for (let i = 0; i < 1000; i++) {
        const result = generateSpecialTile(512);
        if (result !== null) {
          expect(validTypes).toContain(result);
        }
      }
    });
  });

  describe('applyBombEffect', () => {
    it('should clear 3x3 area around tile', () => {
      const grid: (Tile | null)[][] = Array.from({ length: GRID_ROWS }, () =>
        Array(GRID_COLS).fill(null)
      );
      
      // Place tiles in a 3x3 area
      for (let r = 1; r <= 3; r++) {
        for (let c = 1; c <= 3; c++) {
          grid[r][c] = {
            id: `${r}-${c}`,
            value: 2,
            row: r,
            col: c,
            isFalling: false,
            isMerged: false,
          };
        }
      }
      
      applyBombEffect(grid, 2, 2);
      
      // Check 3x3 area is cleared
      for (let r = 1; r <= 3; r++) {
        for (let c = 1; c <= 3; c++) {
          expect(grid[r][c]).toBeNull();
        }
      }
    });

    it('should not affect tiles outside 3x3 area', () => {
      const grid: (Tile | null)[][] = Array.from({ length: GRID_ROWS }, () =>
        Array(GRID_COLS).fill(null)
      );
      
      // Place tiles
      grid[0][0] = { id: '0-0', value: 2, row: 0, col: 0, isFalling: false, isMerged: false };
      grid[5][5] = { id: '5-5', value: 2, row: 5, col: 5, isFalling: false, isMerged: false };
      
      applyBombEffect(grid, 2, 2);
      
      expect(grid[0][0]).not.toBeNull();
      expect(grid[5][5]).not.toBeNull();
    });

    it('should handle edge of grid', () => {
      const grid: (Tile | null)[][] = Array.from({ length: GRID_ROWS }, () =>
        Array(GRID_COLS).fill(null)
      );
      
      grid[0][0] = { id: '0-0', value: 2, row: 0, col: 0, isFalling: false, isMerged: false };
      grid[0][1] = { id: '0-1', value: 2, row: 0, col: 1, isFalling: false, isMerged: false };
      
      applyBombEffect(grid, 0, 0);
      
      expect(grid[0][0]).toBeNull();
      expect(grid[0][1]).toBeNull();
    });
  });

  describe('hasAnyBomb', () => {
    it('should return true when bomb tile is present', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 2, row: 0, col: 0, isFalling: false, isMerged: false, specialType: 'bomb' },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(hasAnyBomb(tiles)).toBe(true);
    });

    it('should return false when no bomb tile is present', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 2, row: 0, col: 0, isFalling: false, isMerged: false },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(hasAnyBomb(tiles)).toBe(false);
    });

    it('should handle null tiles', () => {
      const tiles: (Tile | null)[] = [null, null];
      expect(hasAnyBomb(tiles)).toBe(false);
    });
  });

  describe('hasAnyRainbow', () => {
    it('should return true when rainbow tile is present', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 2, row: 0, col: 0, isFalling: false, isMerged: false, specialType: 'rainbow' },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(hasAnyRainbow(tiles)).toBe(true);
    });

    it('should return false when no rainbow tile is present', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 2, row: 0, col: 0, isFalling: false, isMerged: false },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(hasAnyRainbow(tiles)).toBe(false);
    });
  });

  describe('calculateMergeValue', () => {
    it('should double the base value when no rainbow', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 4, row: 0, col: 0, isFalling: false, isMerged: false },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(calculateMergeValue(tiles, 4)).toBe(8);
    });

    it('should use max value when rainbow is present', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 4, row: 0, col: 0, isFalling: false, isMerged: false, specialType: 'rainbow' },
        { id: '2', value: 8, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(calculateMergeValue(tiles, 4)).toBe(16);
    });

    it('should handle multiple tiles with different values', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 2, row: 0, col: 0, isFalling: false, isMerged: false },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
        { id: '3', value: 8, row: 2, col: 0, isFalling: false, isMerged: false, specialType: 'rainbow' },
      ];
      expect(calculateMergeValue(tiles, 2)).toBe(16);
    });
  });

  describe('calculateScoreWithMultipliers', () => {
    it('should return base score when no multipliers', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 4, row: 0, col: 0, isFalling: false, isMerged: false },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(calculateScoreWithMultipliers(8, tiles)).toBe(8);
    });

    it('should multiply score when multiplier is present', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 4, row: 0, col: 0, isFalling: false, isMerged: false, multiplierValue: 2 },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false },
      ];
      expect(calculateScoreWithMultipliers(8, tiles)).toBe(16);
    });

    it('should multiply by multiple multipliers', () => {
      const tiles: (Tile | null)[] = [
        { id: '1', value: 4, row: 0, col: 0, isFalling: false, isMerged: false, multiplierValue: 2 },
        { id: '2', value: 4, row: 1, col: 0, isFalling: false, isMerged: false, multiplierValue: 3 },
      ];
      expect(calculateScoreWithMultipliers(8, tiles)).toBe(48);
    });

    it('should handle null tiles', () => {
      const tiles: (Tile | null)[] = [null, null];
      expect(calculateScoreWithMultipliers(8, tiles)).toBe(8);
    });
  });

  describe('applySpecialTileToMerged', () => {
    it('should return tile unchanged when no special type', () => {
      const tile: Tile = {
        id: '1',
        value: 8,
        row: 0,
        col: 0,
        isFalling: false,
        isMerged: true,
      };
      const result = applySpecialTileToMerged(tile, null);
      expect(result.specialType).toBeUndefined();
    });

    it('should add bomb special type', () => {
      const tile: Tile = {
        id: '1',
        value: 8,
        row: 0,
        col: 0,
        isFalling: false,
        isMerged: true,
      };
      const result = applySpecialTileToMerged(tile, 'bomb');
      expect(result.specialType).toBe('bomb');
    });

    it('should add multiplier special type with multiplierValue', () => {
      const tile: Tile = {
        id: '1',
        value: 8,
        row: 0,
        col: 0,
        isFalling: false,
        isMerged: true,
      };
      const result = applySpecialTileToMerged(tile, 'multiplier');
      expect(result.specialType).toBe('multiplier');
      expect(result.multiplierValue).toBe(2);
    });

    it('should add rainbow special type', () => {
      const tile: Tile = {
        id: '1',
        value: 8,
        row: 0,
        col: 0,
        isFalling: false,
        isMerged: true,
      };
      const result = applySpecialTileToMerged(tile, 'rainbow');
      expect(result.specialType).toBe('rainbow');
    });
  });
});
