-- ==========================================
-- COMPLETE SUPABASE DATABASE SETUP SQL
-- Copy and paste ALL of this into Supabase SQL Editor
-- ==========================================

-- 1. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR,
  icon VARCHAR,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. BRANDS TABLE
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  logo VARCHAR,
  banner VARCHAR,
  description TEXT,
  website VARCHAR,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  short_description TEXT,
  full_description TEXT,
  sku VARCHAR NOT NULL UNIQUE,
  tags TEXT[],
  original_price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2) NOT NULL,
  offer_percentage INTEGER DEFAULT 0,
  tax DECIMAL(5, 2) DEFAULT 0,
  gender VARCHAR,
  product_type VARCHAR,
  collection VARCHAR,
  featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  thumbnail_url VARCHAR,
  hover_image_url VARCHAR,
  video_url VARCHAR,
  display_order INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS TABLE
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR,
  color VARCHAR,
  strap_type VARCHAR,
  material VARCHAR,
  dial_color VARCHAR,
  sku VARCHAR NOT NULL UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  stock_status VARCHAR DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. INVENTORY TABLE
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL,
  low_stock_threshold INTEGER DEFAULT 10,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR DEFAULT 'customer',
  permissions TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  payment_status VARCHAR DEFAULT 'unpaid',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR,
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. WISHLIST TABLE
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 12. CART TABLE
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. HOMEPAGE CONTENT TABLE
CREATE TABLE homepage_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. SITE SETTINGS TABLE
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- 15. CONTACT INFO TABLE
CREATE TABLE contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  social_media JSONB DEFAULT '{}',
  business_hours JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. COLLECTIONS TABLE
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  banner_image TEXT,
  featured_image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. COLLECTION PRODUCTS JUNCTION TABLE
CREATE TABLE collection_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, product_id)
);

-- Indexes for content tables
CREATE INDEX idx_homepage_content_section ON homepage_content(section_name);
CREATE INDEX idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_active ON collections(is_active);
CREATE INDEX idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX idx_collection_products_product ON collection_products(product_id);

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
  ('site_name', '{"value": "Colour Seven Fashion"}', 'Site name'),
  ('announcement_bar', '{"text": "FREE SHIPPING ON ORDERS ABOVE ₹999", "enabled": true}', 'Announcement bar text'),
  ('seo_metadata', '{"title": "COLOUR SEVEN FASHION", "description": "Premium modern streetwear, watches, shoes & accessories — Colour Seven Fashion."}', 'SEO metadata'),
  ('social_links', '{"instagram": "", "twitter": "", "facebook": ""}', 'Social media links')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default homepage content
INSERT INTO homepage_content (section_name, content) VALUES
  ('hero', '{"left_image": "/images/0816a53b-7f43-45cb-a73e-7d2bd6ef8278.jpg", "right_image": "/images/0a479a6e-62c8-434f-9312-7d03855c149b.jpg", "title": "LEGENDS. STYLE. YOU.", "subtitle": "CLOTHES | SHOES | ACCESSORIES | WATCHES"}'),
  ('categories', '{"enabled": true, "title": "EXPLORE CATEGORIES"}'),
  ('trending', '{"enabled": true, "title": "TRENDING NOW"}'),
  ('brand_pillars', '{"enabled": true}')
ON CONFLICT (section_name) DO NOTHING;

-- Insert default contact info
INSERT INTO contact_info (whatsapp_number, phone_number, email, address, city, state, postal_code, social_media) VALUES
  ('+919876543210', '+919876543210', 'contact@colourseven.com', '123 Fashion Street', 'Mumbai', 'Maharashtra', '400001', '{"instagram": "", "twitter": "", "facebook": ""}')
ON CONFLICT DO NOTHING;

-- ==========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY POLICIES (PUBLIC ACCESS)
-- ==========================================

-- Categories Policies
CREATE POLICY "Allow select on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow insert on categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow delete on categories" ON categories FOR DELETE USING (true);

-- Brands Policies
CREATE POLICY "Allow select on brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow insert on brands" ON brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on brands" ON brands FOR UPDATE USING (true);
CREATE POLICY "Allow delete on brands" ON brands FOR DELETE USING (true);

-- Products Policies
CREATE POLICY "Allow select on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow insert on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow delete on products" ON products FOR DELETE USING (true);

-- Product Images Policies
CREATE POLICY "Allow select on product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow insert on product_images" ON product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on product_images" ON product_images FOR UPDATE USING (true);
CREATE POLICY "Allow delete on product_images" ON product_images FOR DELETE USING (true);

-- Product Variants Policies
CREATE POLICY "Allow select on product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow insert on product_variants" ON product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on product_variants" ON product_variants FOR UPDATE USING (true);
CREATE POLICY "Allow delete on product_variants" ON product_variants FOR DELETE USING (true);

GRANT ALL PRIVILEGES ON TABLE product_images TO authenticated, anon;
GRANT ALL PRIVILEGES ON TABLE product_variants TO authenticated, anon;

-- Inventory Policies
CREATE POLICY "Allow select on inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow insert on inventory" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on inventory" ON inventory FOR UPDATE USING (true);
CREATE POLICY "Allow delete on inventory" ON inventory FOR DELETE USING (true);

-- Users Policies
CREATE POLICY "Allow select on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow delete on users" ON users FOR DELETE USING (true);

-- Orders Policies
CREATE POLICY "Allow select on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow delete on orders" ON orders FOR DELETE USING (true);

-- Order Items Policies
CREATE POLICY "Allow select on order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow insert on order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on order_items" ON order_items FOR UPDATE USING (true);
CREATE POLICY "Allow delete on order_items" ON order_items FOR DELETE USING (true);

-- Reviews Policies
CREATE POLICY "Allow select on reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert on reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Allow delete on reviews" ON reviews FOR DELETE USING (true);

-- Wishlist Policies
CREATE POLICY "Allow select on wishlist" ON wishlist FOR SELECT USING (true);
CREATE POLICY "Allow insert on wishlist" ON wishlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on wishlist" ON wishlist FOR UPDATE USING (true);
CREATE POLICY "Allow delete on wishlist" ON wishlist FOR DELETE USING (true);

-- Cart Policies
CREATE POLICY "Allow select on cart" ON cart FOR SELECT USING (true);
CREATE POLICY "Allow insert on cart" ON cart FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on cart" ON cart FOR UPDATE USING (true);
CREATE POLICY "Allow delete on cart" ON cart FOR DELETE USING (true);

-- Homepage Content Policies
CREATE POLICY "Allow select on homepage_content" ON homepage_content FOR SELECT USING (true);
CREATE POLICY "Allow insert on homepage_content" ON homepage_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on homepage_content" ON homepage_content FOR UPDATE USING (true);
CREATE POLICY "Allow delete on homepage_content" ON homepage_content FOR DELETE USING (true);

-- Site Settings Policies
CREATE POLICY "Allow select on site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow insert on site_settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on site_settings" ON site_settings FOR UPDATE USING (true);
CREATE POLICY "Allow delete on site_settings" ON site_settings FOR DELETE USING (true);

-- Contact Info Policies
CREATE POLICY "Allow select on contact_info" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Allow insert on contact_info" ON contact_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on contact_info" ON contact_info FOR UPDATE USING (true);
CREATE POLICY "Allow delete on contact_info" ON contact_info FOR DELETE USING (true);

-- Collections Policies
CREATE POLICY "Allow select on collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Allow insert on collections" ON collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on collections" ON collections FOR UPDATE USING (true);
CREATE POLICY "Allow delete on collections" ON collections FOR DELETE USING (true);

-- Collection Products Policies
CREATE POLICY "Allow select on collection_products" ON collection_products FOR SELECT USING (true);
CREATE POLICY "Allow insert on collection_products" ON collection_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on collection_products" ON collection_products FOR UPDATE USING (true);
CREATE POLICY "Allow delete on collection_products" ON collection_products FOR DELETE USING (true);

