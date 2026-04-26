import { supabase } from '../config/supabase';
import { DailyChallenge, DailyChallengeAttempt, UserChallengeStatus } from '../types/dailyChallenge';
import { generateDailyChallenge, isChallengeResetNeeded } from '../utils/dailyChallengeGenerator';
import { sanitizeUsername, validateScore, validateTileValue } from '../utils/inputValidation';

export const dailyChallengeService = {
  /**
   * Get or generate today's challenge
   */
  async getTodayChallenge(): Promise<DailyChallenge> {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // Try to fetch from Supabase first
    const { data: existingChallenge, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', dateString)
      .single();
    
    if (!error && existingChallenge) {
      return {
        date: existingChallenge.date,
        type: existingChallenge.challenge_type,
        targetValue: existingChallenge.target_value,
        mode: existingChallenge.mode,
        attemptsRemaining: 99,
        completed: false,
        streak: 0,
      };
    }
    
    // If not in database, generate and insert
    const generated = generateDailyChallenge(today);
    
    // Insert into database for consistency
    await supabase
      .from('daily_challenges')
      .insert({
        date: generated.date,
        challenge_type: generated.type,
        target_value: generated.targetValue,
        mode: generated.mode,
      });
    
    return generated;
  },

  /**
   * Submit a challenge attempt
   */
  async submitChallengeAttempt(
    username: string,
    challenge: DailyChallenge,
    score: number,
    bestTile: number,
    completed: boolean
  ): Promise<{ success: boolean; error?: string; streak?: number }> {
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername) {
      return { success: false, error: 'Invalid username' };
    }

    const validatedScore = validateScore(score);
    const validatedBestTile = validateTileValue(bestTile);

    // Get current user status to calculate streak
    const currentStatus = await this.getUserChallengeStatus(sanitizedUsername);
    
    // Calculate new streak
    let newStreak = currentStatus?.streak || 0;
    if (completed && !currentStatus?.completed) {
      // If completing for the first time today, increment streak
      newStreak += 1;
    } else if (!completed && currentStatus?.completed) {
      // If already completed, keep current streak
      newStreak = currentStatus.streak;
    }

    const attemptsUsed = (currentStatus?.attemptsUsed || 0) + 1;

    // Upsert the attempt
    const { error } = await supabase
      .from('daily_challenge_attempts')
      .upsert(
        {
          username: sanitizedUsername,
          date: challenge.date,
          score: Math.max(validatedScore, currentStatus?.bestScore || 0),
          best_tile: Math.max(validatedBestTile, currentStatus?.bestTile || 2),
          completed: completed || currentStatus?.completed || false,
          attempts_used: Math.min(attemptsUsed, 5),
          streak_count: newStreak,
        },
        {
          onConflict: 'username,date',
        }
      );

    if (error) {
      console.error('Error submitting challenge attempt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, streak: newStreak };
  },

  /**
   * Get user's challenge status for today
   */
  async getUserChallengeStatus(username: string): Promise<UserChallengeStatus | null> {
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername) {
      return null;
    }

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenge_attempts')
      .select('*')
      .eq('username', sanitizedUsername)
      .eq('date', dateString)
      .single();

    if (error || !data) {
      return {
        completed: false,
        attemptsUsed: 0,
        attemptsRemaining: 5,
        bestScore: 0,
        bestTile: 2,
        streak: 0,
        lastPlayedDate: null,
      };
    }

    return {
      completed: data.completed,
      attemptsUsed: data.attempts_used,
      attemptsRemaining: Math.max(0, 99 - data.attempts_used),
      bestScore: data.score,
      bestTile: data.best_tile,
      streak: data.streak_count,
      lastPlayedDate: data.created_at,
    };
  },

  /**
   * Get leaderboard for today's challenge
   */
  async getTodayLeaderboard(limit: number = 100): Promise<DailyChallengeAttempt[]> {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const validatedLimit = Math.max(1, Math.min(limit, 100));

    const { data, error } = await supabase
      .from('daily_challenge_attempts')
      .select('*')
      .eq('date', dateString)
      .order('score', { ascending: false })
      .limit(validatedLimit);

    if (error || !data) {
      return [];
    }

    return data.map((entry: any) => ({
      id: entry.id,
      username: entry.username,
      date: entry.date,
      score: entry.score,
      best_tile: entry.best_tile,
      completed: entry.completed,
      attempts_used: entry.attempts_used,
      streak_count: entry.streak_count,
      created_at: entry.created_at,
    }));
  },

  /**
   * Check if challenge needs reset for a user
   */
  async checkResetNeeded(username: string): Promise<boolean> {
    const status = await this.getUserChallengeStatus(username);
    if (!status || !status.lastPlayedDate) {
      return true;
    }
    return isChallengeResetNeeded(status.lastPlayedDate);
  },
};
