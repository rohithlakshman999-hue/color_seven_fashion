"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brand, Category, Product, ProductImage } from "@/types/database";
import {
  ArrowLeft,
  Heart,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";

type ProductDetail = Product & {
  brands?: Brand | null;
  categories?: Category | null;
  product_images?: ProductImage[];
};

export default function SupabaseProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!supabase) {
        setError("Product details require Supabase configuration");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error: productError } = await supabase
          .from("products")
          .select("*, brands(*), categories(*), product_images(*)")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (productError) throw productError;
        setProduct({
          ...data,
          product_images: [...(data.product_images || [])].sort(
            (a: ProductImage, b: ProductImage) => a.display_order - b.display_order
          ),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-white">
        <div>
          <h1 className="mb-3 text-2xl font-black text-[#c9a227]">Product not found</h1>
          <p className="mb-6 text-sm text-zinc-500">{error}</p>
          <Link href="/shop" className="text-sm font-bold text-[#c9a227] hover:text-white">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.product_images || [];
  const active = images[activeImage] || images[0];

  return (
    <div className="min-h-screen bg-black pb-24 pt-20 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex items-center text-xs uppercase tracking-widest text-zinc-500">
          <Link href="/shop" className="flex items-center gap-2 font-bold hover:text-[#c9a227]">
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
          <span className="mx-3">/</span>
          <span>{product.categories?.name}</span>
          <span className="mx-3">/</span>
          <span className="text-zinc-300">{product.brands?.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-950 md:w-full ${
                      activeImage === index
                        ? "border-[#c9a227]"
                        : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <img
                      src={image.thumbnail_url || image.image_url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="aspect-square flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
              {active ? (
                <img
                  src={active.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-700">
                  <ShoppingBag className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {product.featured && (
              <span className="mb-4 w-max rounded bg-[#c9a227] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                Featured
              </span>
            )}
            <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#c9a227]">
              {product.brands?.name}
            </p>
            <h1 className="mb-4 text-3xl font-black uppercase leading-tight tracking-wider md:text-5xl">
              {product.name}
            </h1>
            <p className="mb-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
              {product.categories?.name} {product.product_type ? `/ ${product.product_type}` : ""}
            </p>

            <div className="mb-8 flex items-end gap-3">
              <span className="text-3xl font-black text-[#c9a227]">
                Rs. {Number(product.discount_price).toLocaleString("en-IN")}
              </span>
              {product.original_price !== product.discount_price && (
                <span className="pb-1 text-sm text-zinc-500 line-through">
                  Rs. {Number(product.original_price).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <p className="mb-8 text-sm leading-7 text-zinc-400">
              {product.full_description || product.short_description}
            </p>

            {product.tags?.length ? (
              <div className="mb-8 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a227] text-xs font-black uppercase tracking-widest text-black hover:bg-white">
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </button>
              <button className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-[#070707] text-zinc-400 hover:border-white/30 hover:text-white sm:w-12">
                <Heart className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-center text-[10px] font-bold tracking-wider text-zinc-400 md:text-xs">
              <div className="rounded-xl border border-white/5 bg-[#070707] p-3">
                <Truck className="mx-auto mb-2 h-4 w-4 text-[#c9a227]" />
                FREE DELIVERY
              </div>
              <div className="rounded-xl border border-white/5 bg-[#070707] p-3">
                <RefreshCw className="mx-auto mb-2 h-4 w-4 text-[#c9a227]" />
                7 DAYS RETURN
              </div>
              <div className="rounded-xl border border-white/5 bg-[#070707] p-3">
                <ShieldCheck className="mx-auto mb-2 h-4 w-4 text-[#c9a227]" />
                SECURE CHECKOUT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
