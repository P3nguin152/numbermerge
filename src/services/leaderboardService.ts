import { supabase } from '../config/supabase';
import { LeaderboardEntry, PlayerProfile } from '../types/game';
import { 
  scoreSubmissionLimiter, 
  leaderboardFetchLimiter, 
  usernameCheckLimiter, 
  profileFetchLimiter,
  withRateLimit 
} from '../utils/rateLimiter';
import { sanitizeUsername, validateScore, validateTileValue } from '../utils/inputValidation';

export const leaderboardService = {
  // Submit score to leaderboard (only updates if score is higher than existing)
  async submitScore(
    username: string,
    score: number,
    bestTile: number,
    gamesPlayed: number
  ): Promise<{ success: boolean; error?: string }> {
    // Sanitize and validate inputs
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername) {
      return { success: false, error: 'Invalid username' };
    }

    const validatedScore = validateScore(score);
    const validatedBestTile = validateTileValue(bestTile);
    const validatedGamesPlayed = Math.max(0, Math.min(parseInt(gamesPlayed as any) || 0, 10000));

    // Apply rate limiting
    const rateLimitResult = await withRateLimit(
      scoreSubmissionLimiter,
      `score:${sanitizedUsername}`,
      async () => {
        // First, check if user already exists on leaderboard
        const { data: existingEntry, error: fetchError } = await supabase
          .from('leaderboard')
          .select('score')
          .eq('username', sanitizedUsername)
          .single();

        // If user exists and new score is not higher, don't update
        if (!fetchError && existingEntry && validatedScore <= existingEntry.score) {
          return { success: true }; // Return success but don't update
        }

        // Insert or update only if score is higher (or user doesn't exist)
        const { error } = await supabase
          .from('leaderboard')
          .upsert(
            {
              username: sanitizedUsername,
              score: validatedScore,
              best_tile: validatedBestTile,
              games_played: validatedGamesPlayed,
            },
            {
              onConflict: 'username',
            }
          );

        if (error) throw error;
        return { success: true };
      }
    );

    return rateLimitResult.success 
      ? { success: true }
      : { success: false, error: rateLimitResult.error };
  },

  // Get top 100 players from leaderboard
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const validatedLimit = Math.max(1, Math.min(limit, 100));

    const result = await withRateLimit(
      leaderboardFetchLimiter,
      'global:leaderboard',
      async () => {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(validatedLimit);

        if (error) throw error;

        return data.map((entry: any) => ({
          id: entry.id,
          username: entry.username,
          score: entry.score,
          bestTile: entry.best_tile,
          gamesPlayed: entry.games_played,
          createdAt: entry.created_at,
        }));
      }
    );

    return result.success ? (result.data || []) : [];
  },

  // Get player's rank and profile
  async getPlayerProfile(username: string): Promise<PlayerProfile | null> {
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername) {
      return null;
    }

    const result = await withRateLimit(
      profileFetchLimiter,
      `profile:${sanitizedUsername}`,
      async () => {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('username', sanitizedUsername)
          .single();

        if (error) throw error;

        return {
          username: data.username,
          highScore: data.score,
          bestTile: data.best_tile,
          gamesPlayed: data.games_played,
        };
      }
    );

    return result.success ? (result.data || null) : null;
  },

  // Get player's rank
  async getPlayerRank(username: string): Promise<number | null> {
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername) {
      return null;
    }

    const result = await withRateLimit(
      profileFetchLimiter,
      `rank:${sanitizedUsername}`,
      async () => {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('username')
          .order('score', { ascending: false });

        if (error) throw error;

        const rank = data.findIndex((entry: any) => entry.username === sanitizedUsername);
        return rank >= 0 ? rank + 1 : null;
      }
    );

    return result.success ? (result.data || null) : null;
  },

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername) {
      return false;
    }

    const result = await withRateLimit(
      usernameCheckLimiter,
      `check:${sanitizedUsername}`,
      async () => {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('username')
          .eq('username', sanitizedUsername)
          .single();

        if (error && error.code === 'PGRST116') {
          // No rows returned, username is available
          return true;
        }

        return !data;
      }
    );

    return result.success ? (result.data || false) : false;
  },
};
