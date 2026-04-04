"""
Supabase SQL migration for the plans table.

Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    request JSONB NOT NULL,
    calculated_metrics JSONB NOT NULL,
    plan_data JSONB NOT NULL
);

-- Index for listing plans by date
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans (created_at DESC);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and reads (for development)
CREATE POLICY "Allow anonymous access" ON plans
    FOR ALL USING (true) WITH CHECK (true);
"""
