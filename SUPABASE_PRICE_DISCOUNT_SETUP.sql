-- ==============================================================================
-- COLOUR SEVEN / SACRED TAMIL GALLERY - PRODUCT PRICING & DISCOUNT SCHEMA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xruuhhtxnhtaqzdyzimf/sql
-- ==============================================================================

-- 1. Ensure price and discount columns exist on the products table
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

-- 2. Allow discount_price to be NULL when a product has no discount
-- (The application also supports discount_price = original_price as regular price)
ALTER TABLE products ALTER COLUMN discount_price DROP NOT NULL;

-- 3. Set default values
ALTER TABLE products ALTER COLUMN offer_percentage SET DEFAULT 0;

-- 4. Create an index for price queries and filters
CREATE INDEX IF NOT EXISTS idx_products_pricing ON products (original_price, discount_price);

-- 5. Optional data cleanup: Synchronize any existing products that have discount_price = 0
-- If discount_price is 0 or NULL, set discount_price = original_price and offer_percentage = 0
UPDATE products
SET 
  discount_price = original_price,
  offer_percentage = 0
WHERE (discount_price IS NULL OR discount_price <= 0) AND original_price > 0;

-- Recalculate offer_percentage for any active discounted products
UPDATE products
SET offer_percentage = ROUND(((original_price - discount_price) / original_price) * 100)
WHERE discount_price IS NOT NULL 
  AND original_price > 0 
  AND discount_price < original_price;

-- Verification query: check products pricing
SELECT id, name, original_price, discount_price, offer_percentage 
FROM products 
LIMIT 10;
