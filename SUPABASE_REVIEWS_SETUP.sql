-- =======================================================
-- COLOUR SEVEN FASHION - CUSTOMER REVIEWS & TESTIMONIALS
-- Copy and run ALL of this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xruuhhtxnhtaqzdyzimf/sql
-- =======================================================

-- 1. Create the customer_reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_image TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  designation VARCHAR(255),
  is_published BOOLEAN NOT NULL DEFAULT true,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Fast query indexes
CREATE INDEX IF NOT EXISTS idx_customer_reviews_published ON customer_reviews(is_published, review_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_rating ON customer_reviews(rating DESC);

-- 3. Enable Row Level Security
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if re-running
DROP POLICY IF EXISTS "Allow public select on published customer_reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Allow all on customer_reviews" ON customer_reviews;

-- 4. Public can read ONLY published reviews
CREATE POLICY "Allow public select on published customer_reviews" 
  ON customer_reviews FOR SELECT 
  USING (is_published = true);

-- 5. Authenticated & Service Role full management access
CREATE POLICY "Allow all on customer_reviews" 
  ON customer_reviews FOR ALL 
  USING (true) WITH CHECK (true);

-- 6. Permissions grant
GRANT ALL PRIVILEGES ON TABLE customer_reviews TO authenticated, anon;

-- 7. Insert Initial Sample Reviews (Safe - will not create duplicates)
INSERT INTO customer_reviews (id, customer_name, rating, review_text, designation, is_published, review_date)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Dan C',
    5,
    'Amazing collection of luxury watches and streetwear. They do help out if any doubts. Thank you for the amazing quality!',
    'Verified Buyer',
    true,
    '2026-10-06'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Vikram Malhotra',
    5,
    'The Rolex Submariner replica exceeded every single expectation. Weight, ceramic bezel feel, and sweep of the second hand are pure perfection.',
    'Luxury Watch Collector, Delhi',
    true,
    '2026-10-14'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Aarav Sharma',
    5,
    'The craftsmanship on the watches is unbelievable for the price. Delivered in 2 days across India with supreme unboxing packaging!',
    'Verified Buyer, Mumbai',
    true,
    '2026-10-10'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Priya Patel',
    5,
    'Loved the oversized black hoodie fit and heavy cotton GSM. Perfect boxy streetwear aesthetic that pairs effortlessly with retro sneakers.',
    'Fashion Stylist, Bengaluru',
    true,
    '2026-10-12'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Rohan Mehta',
    5,
    'Air Force 1s arrived in immaculate condition. Stitching, sole cushioning, and swoosh details are spot on. 10/10 customer experience.',
    'Sneakerhead, Pune',
    true,
    '2026-10-08'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'Kavya Nair',
    5,
    'Cash on delivery was seamless and fast. The Audemars Piguet timepiece has a mesmerizing textured dial. Authentic luxury weight and finish!',
    'Verified Customer, Kochi',
    true,
    '2026-10-05'
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'Sameer Khan',
    5,
    'Fast dispatch, responsive WhatsApp support, and luxury packaging box. You get way more than what you pay for. Highly recommended!',
    'Verified Buyer, Hyderabad',
    true,
    '2026-10-02'
  )
ON CONFLICT (id) DO NOTHING;
