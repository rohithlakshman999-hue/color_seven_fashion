-- Create storage buckets for images

-- Insert storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Insert storage bucket for homepage images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homepage-images',
  'homepage-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Insert storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Insert storage bucket for collection images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'collection-images',
  'collection-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Insert storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-logos',
  'brand-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public read access
-- Product images
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Upload Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated Update Product Images"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated Delete Product Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Homepage images
CREATE POLICY "Public Read Homepage Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'homepage-images');

CREATE POLICY "Authenticated Upload Homepage Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homepage-images');

CREATE POLICY "Authenticated Update Homepage Images"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'homepage-images');

CREATE POLICY "Authenticated Delete Homepage Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'homepage-images');

-- Category images
CREATE POLICY "Public Read Category Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-images');

CREATE POLICY "Authenticated Upload Category Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Authenticated Update Category Images"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Authenticated Delete Category Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'category-images');

-- Collection images
CREATE POLICY "Public Read Collection Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'collection-images');

CREATE POLICY "Authenticated Upload Collection Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'collection-images');

CREATE POLICY "Authenticated Update Collection Images"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'collection-images');

CREATE POLICY "Authenticated Delete Collection Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'collection-images');

-- Brand logos
CREATE POLICY "Public Read Brand Logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated Upload Brand Logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated Update Brand Logos"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated Delete Brand Logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-logos');
