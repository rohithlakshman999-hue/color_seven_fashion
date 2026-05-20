# Colour Seven - Complete Setup Guide

## Project Overview

This is a comprehensive e-commerce platform built with Next.js, Tailwind CSS, Supabase, and Framer Motion. It includes:

- **Dynamic Category System**: Unlimited product categories
- **Dynamic Brand Management**: Create multiple brands per category
- **Admin Dashboard**: Full-featured admin panel for managing products, brands, and categories
- **Supabase Integration**: Real-time database with authentication
- **Dynamic Pages**: Automatically generated category and brand pages
- **Product Management**: Complete product upload and management system

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free at supabase.com)
- Git

## Installation

### 1. Clone and Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set Up Supabase

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (choose your region)
3. Wait for the project to be initialized
4. Go to project settings to find your credentials:
   - **Project URL**: Copy from Settings > API
   - **Anon Key**: Copy from Settings > API
   - **Service Role Key**: Copy from Settings > API (for server operations)

#### Create Database Tables

Go to your Supabase project > SQL Editor and run these queries:

```sql
-- Categories Table
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

-- Brands Table
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

-- Products Table
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

-- Product Images Table
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

-- Product Variants Table
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

-- Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL,
  low_stock_threshold INTEGER DEFAULT 10,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR DEFAULT 'customer',
  permissions TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
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

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
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

-- Wishlist Table
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Cart Table
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
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
```

#### Configure Storage

1. Go to Storage in Supabase
2. Create these buckets:
   - `product-images` - For product photos
   - `brand-logos` - For brand logos
   - `brand-banners` - For brand banners
   - `category-images` - For category images

3. Make buckets public by clicking on each bucket > Edit

### 3. Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see your store.

## Usage

### Admin Dashboard

Access the admin panel at `http://localhost:3000/admin`

#### 1. Create Categories

1. Go to Admin > Categories
2. Click "Add Category"
3. Fill in:
   - **Name**: e.g., "Watches"
   - **Slug**: auto-generated (e.g., "watches")
   - **Description**: Category description
   - **Image**: Upload category image
   - **Display Order**: Controls menu order
   - **Active**: Toggle visibility

#### 2. Create Brands

1. Go to Admin > Brands
2. Click "Add Brand"
3. Select category
4. Fill in:
   - **Name**: Brand name (e.g., "Rolex")
   - **Description**: Brand description
   - **Logo**: Upload logo image
   - **Banner**: Upload banner image
   - **Website**: Official brand website (optional)
   - **Featured**: Mark as featured brand
   - **Active**: Toggle visibility

#### 3. Add Products

1. Go to Admin > Products
2. Click "Add Product"
3. Fill in basic information:
   - **Name**: Product name
   - **SKU**: Unique product code
   - **Description**: Full description
   - **Short Description**: Preview text
   - **Tags**: Add product tags

4. Set pricing:
   - **Original Price**: Retail price
   - **Discount Price**: Sale price
   - **Offer Percentage**: Auto-calculated
   - **Tax**: Tax amount

5. Add media:
   - Upload main product image
   - Upload multiple images
   - Add thumbnail
   - Add hover image (optional)
   - Add video (optional)

6. Set product variants (size, color, etc.)

7. Configure inventory:
   - Stock quantity
   - Low stock threshold
   - Stock status

### Frontend Features

#### Category Pages

Automatically generated at `/watches`, `/clothing`, `/shoes`, etc.

Features:
- All brands in category displayed as cards
- Brand logos and descriptions
- Search functionality
- Click to view brand products

#### Brand Pages

Automatically generated at `/watches/rolex`, `/clothing/gucci`, etc.

Features:
- Brand banner and logo
- All brand products
- Product filtering
- Price sorting
- Add to cart

#### Product Pages

Individual product pages with:
- Multiple image gallery
- Zoom functionality
- Product specifications
- Price information
- Stock status
- Related products

## Database Structure

### Categories
- id, name, slug, description, image, icon, display_order, is_active

### Brands
- id, category_id, name, slug, logo, banner, description, website, display_order, is_active, featured

### Products
- id, category_id, brand_id, name, slug, description, sku, tags, original_price, discount_price, offer_percentage, tax, gender, product_type, collection, featured, is_active

### Product Images
- id, product_id, image_url, thumbnail_url, hover_image_url, video_url, display_order, is_main

### Product Variants
- id, product_id, size, color, strap_type, material, dial_color, sku, stock_quantity, stock_status

### Inventory
- id, product_id, variant_id, stock_quantity, low_stock_threshold

## Pre-loaded Brands

The system comes with 60+ brands pre-configured:

**Watches**: Rolex, Casio, G-Shock, Armani, Fossil, Tissot, Tag Heuer, Omega, Hublot, Richard Mille, Cartier, Patek Philippe, Seiko, Rado, Breitling, Longines, Gucci, Versace, Tommy Hilfiger, Michael Kors, Diesel, Ferrari, Citizen, Audemars Piguet, Maserati, Movado, Oris, Calvin Klein, Hugo Boss, Mont Blanc, Bvlgari, DW

**Clothing**: Armani, Calvin Klein, Tommy Hilfiger, Hugo Boss, Diesel, Versace, Gucci, Bvlgari, Ferrari, Burberry

**Accessories**: Gucci, Cartier, Versace, Bvlgari, Mont Blanc, Diesel, Tommy Hilfiger

**Shoes**: Nike, Adidas, Gucci, Versace, Diesel

## API Endpoints (Optional)

You can create API routes for mobile app integration:

```
POST   /api/products - Create product
GET    /api/products - List all products
GET    /api/products/:id - Get single product
PUT    /api/products/:id - Update product
DELETE /api/products/:id - Delete product

GET    /api/categories - List categories
GET    /api/brands - List brands
GET    /api/brands/:categoryId - Brands by category
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

### Deploy to Other Platforms

- Netlify
- AWS
- DigitalOcean
- Heroku

## Troubleshooting

### Supabase Connection Issues

- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
- Ensure RLS policies are configured

### Images Not Loading

- Check bucket names in Supabase Storage
- Verify bucket is public
- Check image paths are correct

### Admin Features Not Working

- Clear browser cache and cookies
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors
- Verify all tables exist in Supabase

## Support & Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## License

This project is licensed under the MIT License.
