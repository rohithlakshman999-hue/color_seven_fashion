-- ============================================================
-- 004_create_website_analytics.sql
-- Table: website_visits
-- Stores real-time website traffic, page views, and visitor metrics.
-- ============================================================

CREATE TABLE IF NOT EXISTS website_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  pathname VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  device_type VARCHAR(32) DEFAULT 'desktop',
  browser VARCHAR(64),
  os VARCHAR(64),
  ip_hash VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal query speed across dates, visitors, and pages
CREATE INDEX IF NOT EXISTS idx_website_visits_created_at ON website_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_visits_visitor_id ON website_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_website_visits_pathname ON website_visits(pathname);
CREATE INDEX IF NOT EXISTS idx_website_visits_visitor_created ON website_visits(visitor_id, created_at);

-- Row Level Security (RLS)
ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (e.g. from analytics ingestion)
CREATE POLICY "Allow insert on website_visits" ON website_visits
  FOR INSERT WITH CHECK (true);

-- Allow full access for service_role (used by server actions and API routes with supabaseAdmin)
CREATE POLICY "Allow service role full access on website_visits" ON website_visits
  FOR ALL USING (auth.role() = 'service_role');
