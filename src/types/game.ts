export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isFalling: boolean;
  isMerged: boolean;
  fromRow?: number;
  fromCol?: number;
  isMoving?: boolean;
}

export interface GameState {
  grid: (Tile | null)[][];
  score: number;
  gameOver: boolean;
  nextTile: number;
}

export interface GameStats {
  highScore: number;
  gamesPlayed: number;
  totalMerges: number;
  bestTile: number;
}
