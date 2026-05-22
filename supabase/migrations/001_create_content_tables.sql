-- Create homepage_content table
CREATE TABLE IF NOT EXISTS homepage_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Create contact_info table
CREATE TABLE IF NOT EXISTS contact_info (
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

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
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

-- Create collection_products junction table
CREATE TABLE IF NOT EXISTS collection_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_homepage_content_section ON homepage_content(section_name);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);

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
