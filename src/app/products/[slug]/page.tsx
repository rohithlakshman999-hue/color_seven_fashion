"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brand, Category, Product, ProductImage, ProductVariant } from "@/types/database";
import {
  ArrowLeft,
  Heart,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  MessageCircle,
  Check,
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useContactInfo } from "@/context/ContactInfoContext";
import { products as defaultProducts } from "@/data/products";
import { calculateDiscount, formatInrPrice } from "@/lib/pricing";

type ProductDetail = Product & {
  brands?: Brand | null;
  categories?: Category | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export default function SupabaseProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const { contactInfo } = useContactInfo();

  useEffect(() => {
    const fetchProduct = async () => {
      const findLocalFallback = () => {
        const fallback = defaultProducts.find(
          (p) =>
            p.id === slug ||
            (p as unknown as { slug?: string }).slug === slug ||
            p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
        );
        if (fallback) {
          setProduct({
            id: fallback.id,
            name: fallback.name,
            slug: (fallback as unknown as { slug?: string }).slug || slug,
            discount_price: fallback.price,
            original_price: fallback.price,
            short_description: fallback.description,
            full_description: fallback.description,
            featured: fallback.isNew,
            is_active: true,
            brands: { name: fallback.brand } as Brand,
            categories: { name: fallback.category, slug: fallback.category.toLowerCase() } as Category,
            product_images: (fallback.images || []).map((img, i) => ({
              id: `${i}`,
              product_id: fallback.id,
              image_url: img,
              is_primary: i === 0,
              display_order: i,
              created_at: "",
            })),
            product_variants: (fallback.sizes || []).map((s, i) => ({
              id: `${i}`,
              product_id: fallback.id,
              size: s,
              color: fallback.colors?.[0] || "Default",
              stock_quantity: 10,
              sku: "",
              created_at: "",
            })),
          } as unknown as ProductDetail);
          setError("");
          return true;
        }
        return false;
      };

      if (!supabase) {
        if (findLocalFallback()) {
          setLoading(false);
          return;
        }
        setError("Product details require Supabase configuration");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error: productError } = await supabase
          .from("products")
          .select("*, brands(*), categories(*), product_images(*), product_variants(*)")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (productError) {
          if (findLocalFallback()) {
            return;
          }
          throw productError;
        }

        const variants = data.product_variants || [];
        setProduct({
          ...data,
          product_images: [...(data.product_images || [])].sort(
            (a: ProductImage, b: ProductImage) => a.display_order - b.display_order
          ),
        });
      } catch (err) {
        if (!findLocalFallback()) {
          setError(err instanceof Error ? err.message : "Product not found");
        }
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

  const availableSizes = product.product_variants
    ? (Array.from(
        new Set(product.product_variants.map((v) => v.size).filter(Boolean))
      ) as string[])
    : [];

  const availableColors = product.product_variants
    ? (Array.from(
        new Set(product.product_variants.map((v) => v.color).filter(Boolean))
      ) as string[])
    : [];

  const pricing = calculateDiscount(product?.original_price, product?.discount_price);

  const handleAddToCart = () => {
    if (!product) return;

    if (availableSizes.length > 0 && !selectedSize) {
      setValidationError("Please select a size to continue");
      return;
    }

    if (availableColors.length > 0 && !selectedColor) {
      setValidationError("Please select a color to continue");
      return;
    }

    setValidationError(null);

    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brands?.name || "Colour Seven",
      price: pricing.sellingPrice,
      originalPrice: pricing.hasDiscount ? pricing.originalPrice : undefined,
      image: active?.image_url || images[0]?.image_url || "/images/chrono_watch.png",
      size: selectedSize,
      color: selectedColor,
      quantity,
      slug: product.slug,
      openDrawer: true,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const whatsappNumber = (contactInfo?.whatsapp_number || "8122228386").replace(
    /\D/g,
    ""
  );

  const generateInquiryMessage = () => {
    const priceStr = formatInrPrice(pricing.sellingPrice);
    let imageUrl = active?.image_url || "";
    if (imageUrl && !imageUrl.startsWith("http") && typeof window !== "undefined") {
      imageUrl = `${window.location.origin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    let message = "Hello, I'd like to place an order from my cart:\n\n";
    message += `1. *${product.name}*\n`;
    if (selectedSize && selectedSize !== "One Size") message += `   Size: ${selectedSize}\n`;
    if (selectedColor && selectedColor !== "Default") message += `   Color: ${selectedColor}\n`;
    message += `   Quantity: ${quantity}\n`;
    message += `   Price: ${priceStr}\n`;
    if (pricing.hasDiscount) {
      message += `   Original MRP: ${formatInrPrice(pricing.originalPrice)} (${pricing.discountPercentage}% OFF)\n`;
    }
    if (imageUrl) message += `   Image: ${imageUrl}\n`;
    message += `\n`;
    message += `*Order Subtotal: ${formatInrPrice(pricing.sellingPrice * quantity)}*\n\n`;
    message += "Please provide payment and shipping details.";

    return encodeURIComponent(message);
  };

  return (
    <div className="min-h-screen bg-black pb-24 pt-20 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex items-center text-xs uppercase tracking-widest text-zinc-500">
          <Link 
            href={product.categories?.slug ? `/shop/${product.categories.slug}` : "/shop"} 
            className="flex items-center gap-2 font-bold hover:text-[#c9a227]"
          >
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

            {pricing.hasDiscount ? (
              <div className="mb-8 flex flex-col gap-2">
                <div className="flex items-baseline flex-wrap gap-3">
                  <span
                    className="text-xl md:text-2xl font-bold text-zinc-400 line-through decoration-zinc-500"
                    title={`Original MRP: ${formatInrPrice(pricing.originalPrice)}`}
                  >
                    {formatInrPrice(pricing.originalPrice)}
                  </span>
                  <span className="text-3xl md:text-5xl font-black text-white">
                    {formatInrPrice(pricing.sellingPrice)}
                  </span>
                  <span className="text-xs md:text-sm font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md uppercase tracking-wider">
                    {pricing.discountPercentage}% OFF
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold">
                  You save {formatInrPrice(pricing.savings)} ({pricing.discountPercentage}% OFF)
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <span className="text-3xl md:text-5xl font-black text-white">
                  {formatInrPrice(pricing.sellingPrice)}
                </span>
              </div>
            )}

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

            {product.product_variants && product.product_variants.length > 0 && (
              <div className="mb-8 space-y-6">
                {/* Sizes */}
                {Array.from(new Set(product.product_variants.map(v => v.size).filter(Boolean))).length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Size</span>
                    <div className="flex flex-wrap gap-3">
                      {Array.from(new Set(product.product_variants.map(v => v.size).filter(Boolean))).map((size) => (
                        <button
                          key={size as string}
                          onClick={() => setSelectedSize(selectedSize === size ? null : size as string)}
                          className={`flex h-10 min-w-[3rem] items-center justify-center rounded border px-4 text-xs font-bold transition-all ${
                            selectedSize === size
                              ? "border-[#c9a227] bg-[#c9a227] text-black shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                              : "border-white/10 bg-transparent text-zinc-300 hover:border-white/30 hover:bg-white/5"
                          }`}
                        >
                          {size as string}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {Array.from(new Set(product.product_variants.map(v => v.color).filter(Boolean))).length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Color</span>
                    <div className="flex flex-wrap gap-3">
                      {Array.from(new Set(product.product_variants.map(v => v.color).filter(Boolean))).map((color) => (
                        <button
                          key={color as string}
                          onClick={() => setSelectedColor(selectedColor === color ? null : color as string)}
                          className={`flex h-10 items-center justify-center rounded border px-4 text-xs font-bold transition-all ${
                            selectedColor === color
                              ? "border-[#c9a227] bg-[#c9a227] text-black shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                              : "border-white/10 bg-transparent text-zinc-300 hover:border-white/30 hover:bg-white/5"
                          }`}
                        >
                          {color as string}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Validation Banner */}
            {validationError && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="mb-12 space-y-4">
              {/* Quantity bar */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Quantity
                </span>
                <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors rounded-l-xl"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors rounded-r-xl"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex min-h-[3.5rem] flex-1 shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    isAdded
                      ? "bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-[1.01]"
                      : "bg-[#c9a227] text-black hover:bg-white hover:scale-[1.01]"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-5 w-5 stroke-[2.5]" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${generateInquiryMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[3.5rem] flex-1 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-black uppercase tracking-widest text-black hover:brightness-110 transition-all shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Inquiry
                </a>

                <button 
                  type="button"
                  aria-label="Wishlist"
                  className="flex min-h-[3.5rem] w-full shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#070707] text-zinc-400 hover:border-white/30 hover:text-red-400 sm:w-14 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-center text-[10px] font-bold tracking-wider text-zinc-400 md:text-xs">
              <div className="rounded-xl border border-white/5 bg-[#070707] p-3">
                <Truck className="mx-auto mb-2 h-4 w-4 text-[#c9a227]" />
                FAST DELIVERY
              </div>
              <div className="rounded-xl border border-white/5 bg-[#070707] p-3">
                <RefreshCw className="mx-auto mb-2 h-4 w-4 text-[#c9a227]" />
                ALL OVER INDIA DELIVERY
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
