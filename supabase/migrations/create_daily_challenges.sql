-- Create daily_challenges table to store daily challenge configurations
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('target_score', 'tile_mastery')),
  target_value INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('classic', 'limitedMoves', 'timeAttack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_challenge_attempts table to store user attempts
CREATE TABLE IF NOT EXISTS daily_challenge_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  date DATE NOT NULL,
  score INTEGER NOT NULL,
  best_tile INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  attempts_used INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_attempts_username ON daily_challenge_attempts(username);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_attempts_date ON daily_challenge_attempts(date);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_attempts_username_date ON daily_challenge_attempts(username, date);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "No one can insert daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "No one can update daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "No one can delete daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Anyone can view challenge attempts" ON daily_challenge_attempts;
DROP POLICY IF EXISTS "Anyone can insert challenge attempts" ON daily_challenge_attempts;
DROP POLICY IF EXISTS "Anyone can update challenge attempts" ON daily_challenge_attempts;
DROP POLICY IF EXISTS "No one can delete challenge attempts" ON daily_challenge_attempts;

-- Policies for daily_challenges (read-only for public)
CREATE POLICY "Anyone can view daily challenges" ON daily_challenges
  FOR SELECT USING (true);

CREATE POLICY "No one can insert daily challenges" ON daily_challenges
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No one can update daily challenges" ON daily_challenges
  FOR UPDATE WITH CHECK (false);

CREATE POLICY "No one can delete daily challenges" ON daily_challenges
  FOR DELETE USING (false);

-- Policies for daily_challenge_attempts
CREATE POLICY "Anyone can view challenge attempts" ON daily_challenge_attempts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert challenge attempts" ON daily_challenge_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update challenge attempts" ON daily_challenge_attempts
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "No one can delete challenge attempts" ON daily_challenge_attempts
  FOR DELETE USING (false);
