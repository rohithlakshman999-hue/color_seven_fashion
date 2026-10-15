-- ==============================================================================
-- COLOUR SEVEN / SACRED TAMIL GALLERY - SUPABASE SETUP
-- Copy and run ALL of this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xruuhhtxnhtaqzdyzimf/sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: PRODUCT PRICING & DISCOUNT FIELDS
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
  -- Add original_price column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2) NOT NULL DEFAULT 0.00;
  END IF;

  -- Add discount_price column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'discount_price'
  ) THEN
    ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);
  END IF;

  -- Add offer_percentage column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'offer_percentage'
  ) THEN
    ALTER TABLE products ADD COLUMN offer_percentage INTEGER DEFAULT 0;
  END IF;
END $$;

-- Allow discount_price to be NULL when a product has no discount
ALTER TABLE products ALTER COLUMN discount_price DROP NOT NULL;

-- Set default offer percentage to 0
ALTER TABLE products ALTER COLUMN offer_percentage SET DEFAULT 0;

-- Fast index for price and discount queries
CREATE INDEX IF NOT EXISTS idx_products_pricing ON products (original_price, discount_price);

-- Sync any existing products without discount (sets discount_price = original_price)
UPDATE products
SET 
  discount_price = original_price,
  offer_percentage = 0
WHERE (discount_price IS NULL OR discount_price <= 0) AND original_price > 0;

-- Recalculate discount percentage for active discounted products
UPDATE products
SET offer_percentage = ROUND(((original_price - discount_price) / original_price) * 100)
WHERE discount_price IS NOT NULL 
  AND original_price > 0 
  AND discount_price < original_price;


-- ------------------------------------------------------------------------------
-- PART 2: DELIVERY & SHIPPING CONFIGURATION
-- ------------------------------------------------------------------------------

-- Ensure site_settings table exists
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
DROP POLICY IF EXISTS "Allow public read on site_settings" ON site_settings;
CREATE POLICY "Allow public read on site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Allow full access for anon/authenticated (admin)
DROP POLICY IF EXISTS "Allow full access on site_settings" ON site_settings;
CREATE POLICY "Allow full access on site_settings"
  ON site_settings FOR ALL
  USING (true) WITH CHECK (true);

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE site_settings TO authenticated, anon;

-- Insert default shipping configuration (if not already present)
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'shipping_settings',
  '{"delivery_charge": 0, "free_delivery_threshold": 0, "delivery_label": "Pan-India Delivery"}'::jsonb,
  'Storewide delivery and shipping charge configuration'
)
ON CONFLICT (setting_key) DO NOTHING;


-- ------------------------------------------------------------------------------
-- PART 3: VERIFICATION QUERIES
-- ------------------------------------------------------------------------------

-- 1. Check product pricing
SELECT id, name, original_price, discount_price, offer_percentage 
FROM products 
LIMIT 5;

-- 2. Check shipping settings
SELECT setting_key, setting_value, updated_at 
FROM site_settings 
WHERE setting_key = 'shipping_settings';
