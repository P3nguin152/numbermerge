import { supabase } from '../config/supabase';
import { LeaderboardEntry, PlayerProfile } from '../types/game';

export const leaderboardService = {
  // Submit score to leaderboard
  async submitScore(
    username: string,
    score: number,
    bestTile: number,
    gamesPlayed: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .upsert(
          {
            username,
            score,
            best_tile: bestTile,
            games_played: gamesPlayed,
          },
          {
            onConflict: 'username',
          }
        );

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error submitting score:', error);
      return { success: false, error: error.message };
    }
  },

  // Get top 100 players from leaderboard
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((entry: any) => ({
        id: entry.id,
        username: entry.username,
        score: entry.score,
        bestTile: entry.best_tile,
        gamesPlayed: entry.games_played,
        createdAt: entry.created_at,
      }));
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Get player's rank and profile
  async getPlayerProfile(username: string): Promise<PlayerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      return {
        username: data.username,
        highScore: data.score,
        bestTile: data.best_tile,
        gamesPlayed: data.games_played,
      };
    } catch (error: any) {
      console.error('Error fetching player profile:', error);
      return null;
    }
  },

  // Get player's rank
  async getPlayerRank(username: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('username')
        .order('score', { ascending: false });

      if (error) throw error;

      const rank = data.findIndex((entry: any) => entry.username === username);
      return rank >= 0 ? rank + 1 : null;
    } catch (error: any) {
      console.error('Error fetching player rank:', error);
      return null;
    }
  },

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        return true;
      }

      return !data;
    } catch (error: any) {
      console.error('Error checking username availability:', error);
      return false;
    }
  },
};
