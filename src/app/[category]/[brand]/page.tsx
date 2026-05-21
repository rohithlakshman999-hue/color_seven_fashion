"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category, Brand, Product, ProductImage } from "@/types/database";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";

interface BrandPageProps {
  params: {
    category: string;
    brand: string;
  };
}

export default function BrandPage({ params }: BrandPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, ProductImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    fetchData();
  }, [params.category, params.brand]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch category
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", params.category)
        .single();

      if (catError) throw catError;
      setCategory(catData);

      // Fetch brand
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .select("*")
        .eq("slug", params.brand)
        .eq("category_id", catData.id)
        .single();

      if (brandError) throw brandError;
      setBrand(brandData);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("brand_id", brandData.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch images for all products
      if (productsData && productsData.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from("product_images")
          .select("*")
          .in(
            "product_id",
            productsData.map((p) => p.id)
          );

        if (!imagesError) {
          const imagesByProduct: Record<string, ProductImage[]> = {};
          imagesData?.forEach((img) => {
            if (!imagesByProduct[img.product_id]) {
              imagesByProduct[img.product_id] = [];
            }
            imagesByProduct[img.product_id].push(img);
          });
          setProductImages(imagesByProduct);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) => p.discount_price >= priceFilter[0] && p.discount_price <= priceFilter[1]
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {

    switch (sortBy) {
      case "price-low":
        return a.discount_price - b.discount_price;
      case "price-high":
        return b.discount_price - a.discount_price;
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );

  if (error || !brand || !category)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-zinc-500">{error || "Brand not found"}</p>
          <Link
            href="/shop"
            className="inline-block mt-4 px-6 py-2 border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-black transition-all"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24">
      {/* Hero Section with Brand Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 md:h-96 overflow-hidden mb-16"
      >
        {brand.banner && (
          <Image
            src={brand.banner}
            alt={brand.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end gap-6">
              {brand.logo && (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-lg p-2 backdrop-blur">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="mb-2">
                <p className="text-[#c9a227] text-sm tracking-widest uppercase font-black mb-2">
                  {category.name} Brand
                </p>
                <h1 className="text-5xl md:text-6xl font-bold">{brand.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Brand Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 md:px-8 mb-12"
      >
        <p className="text-lg text-zinc-400 max-w-2xl">{brand.description}</p>
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-[#c9a227] hover:text-[#d4b239] transition-colors"
          >
            Visit Brand Website
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </motion.div>

      {/* Filters & Sorting */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-zinc-900 border border-white/10 rounded text-white text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-zinc-500">
            Showing {sortedProducts.length} products
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product, idx) => {
              const mainImage = productImages[product.id]?.[0];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <Link href={`/products/${product.slug}`} className="group block h-full">
                    <div className="bg-zinc-900 border border-white/5 rounded-lg overflow-hidden hover:border-[#c9a227]/40 transition-all duration-500 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-64 bg-black/50 overflow-hidden">
                        {mainImage ? (
                          <Image
                            src={mainImage.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-zinc-700" />
                          </div>
                        )}
                        {product.offer_percentage > 0 && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            -{product.offer_percentage}%
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[#c9a227] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-500 mb-3">{product.sku}</p>
                        <p className="text-sm text-zinc-400 flex-1 line-clamp-2 mb-3">
                          {product.short_description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-[#c9a227]">
                            ${product.discount_price}
                          </span>
                          {product.original_price !== product.discount_price && (
                            <span className="text-sm text-zinc-500 line-through">
                              ${product.original_price}
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <button className="w-full px-4 py-2 bg-[#c9a227]/10 border border-[#c9a227] text-[#c9a227] rounded text-sm font-bold hover:bg-[#c9a227] hover:text-black transition-all flex items-center justify-center gap-2 group/btn">
                          <ShoppingBag className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Products Available</h3>
            <p className="text-zinc-500">This brand doesn't have any products yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
