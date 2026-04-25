-- Create ad_impressions table for tracking test ad revenue
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ad_type TEXT NOT NULL CHECK (ad_type IN ('interstitial', 'rewarded', 'banner')),
  estimated_revenue DECIMAL(10, 4) NOT NULL,
  device_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ad_impressions_timestamp ON ad_impressions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_device_id ON ad_impressions(device_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_session_id ON ad_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_type ON ad_impressions(ad_type);

-- Enable Row Level Security
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert ad_impressions" ON ad_impressions;
DROP POLICY IF EXISTS "Allow public select ad_impressions" ON ad_impressions;

-- Create policies for public access (for testing purposes)
CREATE POLICY "Allow public insert ad_impressions" ON ad_impressions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select ad_impressions" ON ad_impressions
  FOR SELECT USING (true);
