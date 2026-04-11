import {
  createEmptyGrid,
  generateNextValue,
  canDropInColumn,
  isGameOver,
  dropTile,
  GRID_ROWS,
  GRID_COLS,
} from '../mergeLogic';

describe('mergeLogic', () => {
  describe('createEmptyGrid', () => {
    it('should create a grid with correct dimensions', () => {
      const grid = createEmptyGrid();
      expect(grid).toHaveLength(GRID_ROWS);
      expect(grid[0]).toHaveLength(GRID_COLS);
    });

    it('should create a grid filled with null', () => {
      const grid = createEmptyGrid();
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          expect(grid[row][col]).toBeNull();
        }
      }
    });
  });

  describe('generateNextValue', () => {
    it('should generate a value from the allowed pool', () => {
      const allowedValues = [2, 4, 8, 16];
      for (let i = 0; i < 100; i++) {
        const value = generateNextValue();
        expect(allowedValues).toContain(value);
      }
    });
  });

  describe('canDropInColumn', () => {
    it('should return true for empty column', () => {
      const grid = createEmptyGrid();
      expect(canDropInColumn(grid, 0)).toBe(true);
    });

    it('should return true for partially filled column', () => {
      const grid = createEmptyGrid();
      grid[GRID_ROWS - 1][0] = { id: '1', value: 2, row: GRID_ROWS - 1, col: 0, isFalling: false, isMerged: false };
      expect(canDropInColumn(grid, 0)).toBe(true);
    });

    it('should return false for full column', () => {
      const grid = createEmptyGrid();
      for (let row = 0; row < GRID_ROWS; row++) {
        grid[row][0] = { id: `${row}`, value: 2, row, col: 0, isFalling: false, isMerged: false };
      }
      expect(canDropInColumn(grid, 0)).toBe(false);
    });
  });

  describe('isGameOver', () => {
    it('should return false for empty grid', () => {
      const grid = createEmptyGrid();
      expect(isGameOver(grid)).toBe(false);
    });

    it('should return false when at least one column has space', () => {
      const grid = createEmptyGrid();
      // Fill all columns except one
      for (let col = 0; col < GRID_COLS - 1; col++) {
        for (let row = 0; row < GRID_ROWS; row++) {
          grid[row][col] = { id: `${row}-${col}`, value: 2, row, col, isFalling: false, isMerged: false };
        }
      }
      expect(isGameOver(grid)).toBe(false);
    });

    it('should return true when all columns are full', () => {
      const grid = createEmptyGrid();
      for (let col = 0; col < GRID_COLS; col++) {
        for (let row = 0; row < GRID_ROWS; row++) {
          grid[row][col] = { id: `${row}-${col}`, value: 2, row, col, isFalling: false, isMerged: false };
        }
      }
      expect(isGameOver(grid)).toBe(true);
    });
  });

  describe('dropTile', () => {
    it('should place a tile at the top of the column', () => {
      const grid = createEmptyGrid();
      const result = dropTile(grid, 2, 4);
      
      expect(result.grid[0][2]).not.toBeNull();
      expect(result.grid[0][2]?.value).toBe(4);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should not place tile in full column', () => {
      const grid = createEmptyGrid();
      // Fill the column
      for (let row = 0; row < GRID_ROWS; row++) {
        grid[row][0] = { id: `${row}`, value: 2, row, col: 0, isFalling: false, isMerged: false };
      }
      
      const result = dropTile(grid, 0, 4);
      expect(result.score).toBe(0);
      expect(result.grid).toEqual(grid);
    });

    it('should apply gravity to stack tiles at bottom', () => {
      const grid = createEmptyGrid();
      // Drop multiple tiles
      let result = dropTile(grid, 0, 2);
      result = dropTile(result.grid, 0, 2);
      
      // Check that tiles are at the bottom
      expect(result.grid[GRID_ROWS - 1][0]).not.toBeNull();
      expect(result.grid[GRID_ROWS - 2][0]).not.toBeNull();
    });

    it('should merge matching tiles vertically', () => {
      const grid = createEmptyGrid();
      // Create a column with two matching tiles
      grid[GRID_ROWS - 1][0] = { id: '1', value: 2, row: GRID_ROWS - 1, col: 0, isFalling: false, isMerged: false };
      grid[GRID_ROWS - 2][0] = { id: '2', value: 2, row: GRID_ROWS - 2, col: 0, isFalling: false, isMerged: false };
      
      const result = dropTile(grid, 0, 2);
      
      // Should have merged and created a higher value tile
      const mergedTile = result.grid[GRID_ROWS - 1][0];
      expect(mergedTile?.value).toBeGreaterThan(2);
      expect(result.score).toBeGreaterThan(2);
    });

    it('should return a new grid without mutating the original', () => {
      const grid = createEmptyGrid();
      const originalGrid = JSON.parse(JSON.stringify(grid));
      
      dropTile(grid, 0, 2);
      
      expect(grid).toEqual(originalGrid);
    });
  });
});
