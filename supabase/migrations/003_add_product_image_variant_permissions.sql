-- Add explicit RLS policies and table privileges for nested product child tables
-- This ensures product_images and product_variants support SELECT/INSERT/UPDATE/DELETE
-- for anon and authenticated roles when RLS is enabled.

ALTER TABLE IF EXISTS product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on product_images" ON product_images;
DROP POLICY IF EXISTS "Allow insert on product_images" ON product_images;
DROP POLICY IF EXISTS "Allow update on product_images" ON product_images;
DROP POLICY IF EXISTS "Allow delete on product_images" ON product_images;

DROP POLICY IF EXISTS "Allow select on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow insert on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow update on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow delete on product_variants" ON product_variants;

CREATE POLICY "Allow select on product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow insert on product_images" ON product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on product_images" ON product_images FOR UPDATE USING (true);
CREATE POLICY "Allow delete on product_images" ON product_images FOR DELETE USING (true);

CREATE POLICY "Allow select on product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow insert on product_variants" ON product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on product_variants" ON product_variants FOR UPDATE USING (true);
CREATE POLICY "Allow delete on product_variants" ON product_variants FOR DELETE USING (true);

GRANT ALL PRIVILEGES ON TABLE product_images TO authenticated, anon;
GRANT ALL PRIVILEGES ON TABLE product_variants TO authenticated, anon;
