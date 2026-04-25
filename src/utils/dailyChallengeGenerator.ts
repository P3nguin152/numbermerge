import { DailyChallenge, DailyChallengeType, DailyChallengeMode } from '../types/dailyChallenge';

// Target tile values for tile mastery challenge
const TILE_MASTERY_TARGETS = [128, 256, 512, 1024, 2048];

// Combo challenge targets (consecutive merges)
const COMBO_TARGETS = [3, 4, 5, 6];

// Speed run time limits (seconds)
const SPEED_RUN_TIME_LIMITS = [60, 90, 120];

/**
 * Generate a seeded random number based on date string
 * This ensures the same date always produces the same challenge
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculate an achievable target score based on tile values
 * The target should be mathematically possible with the available tiles
 */
function calculateTargetScore(dateString: string): number {
  const random = seededRandom(dateString + 'score');
  
  // Base scores that are achievable with tile merges
  const baseScores = [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000];
  
  // Add some variation based on the date
  const variation = Math.floor(random * 500);
  const baseIndex = Math.floor(random * baseScores.length);
  
  return baseScores[baseIndex] + variation;
}

/**
 * Get a random tile mastery target value
 */
function getTileMasteryTarget(dateString: string): number {
  const random = seededRandom(dateString + 'tile');
  const index = Math.floor(random * TILE_MASTERY_TARGETS.length);
  return TILE_MASTERY_TARGETS[index];
}

/**
 * Get UK reset time (12pm UK time) for a given date
 * UK is UTC+0 in winter, UTC+1 in summer (BST)
 * For simplicity, we'll use UTC+1 as the base (UK summer time)
 */
export function getUKResetTime(date: Date): Date {
  const resetTime = new Date(date);
  resetTime.setHours(12, 0, 0, 0); // 12:00:00
  resetTime.setTime(resetTime.getTime() + (1 * 60 * 60 * 1000)); // UTC+1
  return resetTime;
}

/**
 * Check if a challenge reset is needed based on last played time
 */
export function isChallengeResetNeeded(lastPlayed: Date | string | null): boolean {
  if (!lastPlayed) return true;
  
  const lastPlayedDate = typeof lastPlayed === 'string' ? new Date(lastPlayed) : lastPlayed;
  const now = new Date();
  const currentReset = getUKResetTime(now);
  
  // Reset is needed if current time is past today's reset time
  // and last played was before today's reset time
  return now.getTime() >= currentReset.getTime() && lastPlayedDate.getTime() < currentReset.getTime();
}

/**
 * Generate a daily challenge for a given date
 * The challenge is deterministic based on the date (same date = same challenge)
 */
export function generateDailyChallenge(date: Date): DailyChallenge {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const random = seededRandom(dateString);
  
  // Randomly choose between all 5 challenge types
  const typeIndex = Math.floor(random * 5);
  const types: DailyChallengeType[] = ['target_score', 'tile_mastery', 'combo', 'clear_board', 'speed_run'];
  const type = types[typeIndex];
  
  let targetValue: number;
  let mode: DailyChallengeMode;
  let comboTarget: number | undefined;
  let timeLimit: number | undefined;
  
  if (type === 'target_score') {
    targetValue = calculateTargetScore(dateString);
    mode = 'classic';
  } else if (type === 'tile_mastery') {
    targetValue = getTileMasteryTarget(dateString);
    mode = 'limitedMoves';
  } else if (type === 'combo') {
    comboTarget = COMBO_TARGETS[Math.floor(seededRandom(dateString + 'combo') * COMBO_TARGETS.length)];
    targetValue = 0; // Not used for combo
    mode = 'classic';
  } else if (type === 'clear_board') {
    targetValue = 0; // Not used for clear board
    mode = 'limitedMoves';
  } else if (type === 'speed_run') {
    targetValue = calculateTargetScore(dateString);
    timeLimit = SPEED_RUN_TIME_LIMITS[Math.floor(seededRandom(dateString + 'time') * SPEED_RUN_TIME_LIMITS.length)];
    mode = 'timeAttack';
  } else {
    // Fallback
    targetValue = calculateTargetScore(dateString);
    mode = 'classic';
  }
  
  return {
    date: dateString,
    type,
    targetValue,
    mode,
    attemptsRemaining: 5,
    completed: false,
    streak: 0,
    comboTarget,
    timeLimit,
  };
}

/**
 * Get today's challenge
 */
export function getTodayChallenge(): DailyChallenge {
  return generateDailyChallenge(new Date());
}
