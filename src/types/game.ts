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

export interface TileWithPosition extends Tile {
  row: number;
  col: number;
}

export interface GameState {
  grid: (Tile | null)[][];
  score: number;
  gameOver: boolean;
  nextTile: number;
  lastMergeValue?: number;
}

export interface GameStats {
  highScore: number;
  gamesPlayed: number;
  totalMerges: number;
  bestTile: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  bestTile: number;
  gamesPlayed: number;
  createdAt: string;
}

export interface PlayerProfile {
  username: string;
  highScore: number;
  bestTile: number;
  gamesPlayed: number;
}
