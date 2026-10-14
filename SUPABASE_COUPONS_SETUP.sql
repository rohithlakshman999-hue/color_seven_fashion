-- =======================================================
-- COLOUR SEVEN FASHION - DYNAMIC DISCOUNT COUPONS SETUP
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xruuhhtxnhtaqzdyzimf/sql
-- =======================================================

-- 1. Create discount_coupons table
CREATE TABLE IF NOT EXISTS discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  original_price DECIMAL(10, 2) NOT NULL,
  desired_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) NOT NULL,
  applies_to VARCHAR(50) NOT NULL DEFAULT 'entire_order',
  product_id VARCHAR(255),
  product_name VARCHAR(255),
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  max_uses_per_customer INTEGER DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create coupon_usages table for tracking redemptions
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES discount_coupons(id) ON DELETE CASCADE,
  coupon_code VARCHAR(50) NOT NULL,
  order_id VARCHAR(100),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  original_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for fast lookup & validation
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_active ON discount_coupons(is_active, expiry_date);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id ON coupon_usages(order_id);

-- 4. Enable Row Level Security
ALTER TABLE discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow select on active discount_coupons" ON discount_coupons;
DROP POLICY IF EXISTS "Allow all on discount_coupons" ON discount_coupons;
DROP POLICY IF EXISTS "Allow all on coupon_usages" ON coupon_usages;

-- Public can check coupons
CREATE POLICY "Allow select on active discount_coupons" 
  ON discount_coupons FOR SELECT 
  USING (true);

-- Admin & Service Role full access
CREATE POLICY "Allow all on discount_coupons" 
  ON discount_coupons FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on coupon_usages" 
  ON coupon_usages FOR ALL 
  USING (true) WITH CHECK (true);

GRANT ALL PRIVILEGES ON TABLE discount_coupons TO authenticated, anon;
GRANT ALL PRIVILEGES ON TABLE coupon_usages TO authenticated, anon;

-- 5. Safe Atomic Increment Function
CREATE OR REPLACE FUNCTION increment_coupon_usage(c_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE discount_coupons
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = c_id;
END;
$$;
