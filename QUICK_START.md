# Project Structure & Quick Start

## Directory Structure

```
src/
├── app/
│   ├── admin/                    # Admin dashboard
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   ├── page.tsx              # Admin dashboard home
│   │   ├── categories/           # Category management
│   │   ├── brands/               # Brand management
│   │   ├── products/             # Product management
│   │   ├── inventory/            # Inventory management
│   │   ├── orders/               # Orders management
│   │   └── users/                # User management
│   ├── [category]/               # Dynamic category pages
│   │   ├── page.tsx              # Category brand list
│   │   └── [brand]/              # Dynamic brand pages
│   │       └── page.tsx          # Brand products list
│   ├── products/
│   │   └── [slug]/               # Individual product pages
│   │       └── page.tsx
│   ├── shop/                     # Main shop page
│   │   └── page.tsx
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── Navbar.tsx                # Navigation bar
│   ├── Footer.tsx                # Footer
│   ├── Logo.tsx                  # Logo component
│   └── ProductCard.tsx           # Product card component
├── data/
│   ├── brands.ts                 # All brands data
│   └── products.ts               # Sample products
├── lib/
│   ├── supabase.ts               # Supabase client config
│   └── seedDatabase.ts           # Database seeding helpers
├── types/
│   └── database.ts               # TypeScript types for DB
└── app/
    └── api/                      # API routes (optional)

public/
├── images/                       # Static images
│   ├── chrono_watch.png
│   ├── nike_air_force.png
│   ├── black_hoodie.png
│   └── colour_seven_logo.png

Root Files
├── .env.example                  # Environment variables template
├── SETUP_GUIDE.md                # Complete setup instructions
├── BRAND_REFERENCE.md            # Brand list and info
├── QUICK_START.md                # This file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.mjs            # PostCSS config
├── next.config.ts                # Next.js config
└── eslint.config.mjs             # ESLint config
```

## Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy `.env.example` to `.env.local`
4. Add your Supabase credentials

### Step 3: Create Database
Run SQL queries from SETUP_GUIDE.md in Supabase SQL Editor

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Access Admin Panel
- Visit http://localhost:3000/admin
- Create a category
- Create brands for that category
- Add products

## Key Features

### 1. Dynamic Categories
- Create unlimited product categories
- Automatic page generation
- Category navigation
- Search within categories

### 2. Dynamic Brands
- Multiple brands per category
- Dedicated brand pages
- Brand logos and banners
- Featured brands section
- Brand descriptions

### 3. Product Management
- Full product CRUD operations
- Multiple images per product
- Product variants (size, color, etc.)
- Inventory tracking
- Pricing and discounts
- SEO metadata

### 4. Admin Dashboard
- Overview statistics
- Category management
- Brand management
- Product management
- Inventory tracking
- Order management
- User management

### 5. Frontend Pages
- Homepage
- Shop category pages
- Brand pages with products
- Individual product pages
- Navigation menu
- Search functionality

## Database Tables

| Table | Purpose |
|-------|---------|
| categories | Product categories |
| brands | Brand information |
| products | Product listings |
| product_images | Product photos and videos |
| product_variants | Size, color, material options |
| inventory | Stock tracking |
| users | User accounts |
| orders | Customer orders |
| order_items | Items in orders |
| reviews | Product reviews |
| wishlist | User wishlists |
| cart | Shopping cart |

## Pre-loaded Data

✓ 8 Categories (Watches, Clothing, Shoes, Accessories, Bags, Perfumes, Sunglasses, Electronics)
✓ 60+ Brands (All watch brands, clothing, accessories, shoes)
✓ Featured brands marked for prominence
✓ Category and brand descriptions

## API Routes

### Products
- GET `/api/products` - List all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (admin)
- PUT `/api/products/:id` - Update product (admin)
- DELETE `/api/products/:id` - Delete product (admin)

### Categories
- GET `/api/categories` - List all categories
- GET `/api/categories/:id` - Get single category

### Brands
- GET `/api/brands` - List all brands
- GET `/api/brands/:categoryId` - Get brands by category

## Admin Features

### Categories
- ✓ Create, read, update, delete
- ✓ Reorder categories
- ✓ Upload category images
- ✓ Toggle active/inactive
- ✓ SEO slug management

### Brands
- ✓ Create, read, update, delete
- ✓ Upload logos and banners
- ✓ Mark as featured
- ✓ Assign to categories
- ✓ Add brand descriptions
- ✓ Brand websites

### Products
- ✓ Create, read, update, delete
- ✓ Duplicate products
- ✓ Upload multiple images
- ✓ Add product variants
- ✓ Inventory tracking
- ✓ Pricing and discounts
- ✓ SEO optimization

### Inventory
- ✓ Track stock levels
- ✓ Low stock alerts
- ✓ Inventory history
- ✓ Stock status management

## Frontend Features

### Product Display
- Multiple image gallery
- Image zoom
- Product specifications
- Price display with discounts
- Stock availability
- Related products
- Product reviews

### Search & Filter
- Search by product name
- Filter by brand
- Filter by category
- Filter by price range
- Filter by color
- Filter by size

### User Experience
- Dark luxury theme
- Smooth animations
- Responsive design
- Mobile optimized
- Accessibility features

## Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Deploy on Vercel dashboard
# Set environment variables
```

### Other Platforms
- Netlify
- AWS
- DigitalOcean
- Custom VPS

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### Issue: Tables not found
**Solution**: Run SQL queries from SETUP_GUIDE.md in Supabase

### Issue: Images not loading
**Solution**: 
1. Check bucket names match
2. Make buckets public in Supabase
3. Check file paths

### Issue: Admin pages blank
**Solution**:
1. Clear browser cache
2. Check environment variables
3. Check Supabase connection

### Issue: Build errors
**Solution**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps

1. ✅ Set up Supabase database
2. ✅ Create your first category
3. ✅ Add brands to category
4. ✅ Upload products
5. ✅ Customize branding
6. ✅ Deploy to production

## Support

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/

## License

MIT License - Free to use and modify
