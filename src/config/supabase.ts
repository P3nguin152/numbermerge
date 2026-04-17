import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

// Supabase project credentials - try multiple sources for compatibility
const supabaseUrl = process.env.SUPABASE_URL || Constants.expoConfig?.extra?.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env file or app.config.js.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table schema (run this in your Supabase SQL editor):
/*
-- Step 1: Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  best_tile INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for faster score-based queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON leaderboard;
DROP POLICY IF EXISTS "Allow users to insert" ON leaderboard;
DROP POLICY IF EXISTS "Allow users to update own score" ON leaderboard;

-- Step 5: Create policies
CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Allow users to insert" ON leaderboard
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own score" ON leaderboard
  FOR UPDATE USING (true);

-- Step 6: Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
*/
