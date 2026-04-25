export type DailyChallengeType = 'target_score' | 'tile_mastery' | 'combo' | 'clear_board' | 'speed_run';
export type DailyChallengeMode = 'classic' | 'limitedMoves' | 'timeAttack';

export interface DailyChallenge {
  date: string; // ISO date string (YYYY-MM-DD)
  type: DailyChallengeType;
  targetValue: number; // Target score for target_score/speed_run, target tile for tile_mastery
  mode: DailyChallengeMode;
  attemptsRemaining: number;
  completed: boolean;
  streak: number;
  comboTarget?: number; // Consecutive merges needed for combo challenge
  timeLimit?: number; // Time limit in seconds for speed run challenge
}

export interface DailyChallengeEntry {
  id: string;
  date: string;
  challenge_type: DailyChallengeType;
  target_value: number;
  mode: DailyChallengeMode;
  created_at: string;
}

export interface DailyChallengeAttempt {
  id: string;
  username: string;
  date: string;
  score: number;
  best_tile: number;
  completed: boolean;
  attempts_used: number;
  streak_count: number;
  created_at: string;
}

export interface UserChallengeStatus {
  completed: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  bestScore: number;
  bestTile: number;
  streak: number;
  lastPlayedDate: string | null;
}
