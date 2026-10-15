"use client";

import React from "react";
import { formatInrPrice, calculateDiscount } from "@/lib/pricing";

export interface ProductPriceDisplayProps {
  originalPrice?: number | string | null;
  price?: number | string | null;
  discountPrice?: number | string | null;
  discountPercentage?: number | string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  layout?: "horizontal" | "vertical" | "inline";
  showSavings?: boolean;
  className?: string;
}

export default function ProductPriceDisplay({
  originalPrice: propOriginal,
  price: propPrice,
  discountPrice: propDiscount,
  discountPercentage: propPercent,
  size = "md",
  layout = "vertical",
  showSavings = false,
  className = "",
}: ProductPriceDisplayProps) {
  const details = calculateDiscount(
    propOriginal ?? propPrice,
    propDiscount ?? (propOriginal !== undefined && propOriginal !== propPrice ? propPrice : undefined)
  );

  const percent = Number(propPercent) > 0 ? Number(propPercent) : details.discountPercentage;
  const hasDiscount = details.hasDiscount && percent > 0;

  // Font size styling based on size prop
  const stylesBySize = {
    xs: {
      original: "text-[11px]",
      selling: "text-xs font-bold",
      badge: "text-[10px] font-bold",
    },
    sm: {
      original: "text-xs",
      selling: "text-sm font-black",
      badge: "text-[11px] font-extrabold",
    },
    md: {
      original: "text-xs md:text-sm",
      selling: "text-base md:text-lg font-black",
      badge: "text-xs font-black",
    },
    lg: {
      original: "text-sm md:text-base",
      selling: "text-xl md:text-2xl font-black",
      badge: "text-xs md:text-sm font-black",
    },
    xl: {
      original: "text-lg md:text-2xl font-bold",
      selling: "text-3xl md:text-5xl font-black",
      badge: "text-sm md:text-base font-black",
    },
  }[size];

  if (!hasDiscount) {
    return (
      <div className={`flex items-baseline ${className}`}>
        <span className={`${stylesBySize.selling} text-white`}>
          {formatInrPrice(details.sellingPrice)}
        </span>
      </div>
    );
  }

  if (layout === "inline" || layout === "horizontal") {
    return (
      <div className={`flex flex-wrap items-baseline gap-2 md:gap-3 ${className}`}>
        <span
          className={`${stylesBySize.original} text-zinc-400 line-through decoration-zinc-500 font-semibold`}
          title={`Original MRP: ${formatInrPrice(details.originalPrice)}`}
        >
          {formatInrPrice(details.originalPrice)}
        </span>
        <span className={`${stylesBySize.selling} text-white`}>
          {formatInrPrice(details.sellingPrice)}
        </span>
        <span className={`${stylesBySize.badge} text-emerald-400 uppercase tracking-wider`}>
          {percent}% OFF
        </span>
      </div>
    );
  }

  // Default vertical matching the reference image:
  // Row 1: Strikethrough price + beside it prominent selling price
  // Row 2: Discount percentage badge e.g. "29% OFF" in green
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-baseline flex-wrap gap-2 md:gap-2.5">
        <span
          className={`${stylesBySize.original} text-zinc-400 line-through decoration-zinc-500 font-semibold`}
          title={`Original MRP: ${formatInrPrice(details.originalPrice)}`}
        >
          {formatInrPrice(details.originalPrice)}
        </span>
        <span className={`${stylesBySize.selling} text-white`}>
          {formatInrPrice(details.sellingPrice)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`${stylesBySize.badge} text-emerald-400 uppercase tracking-wider`}>
          {percent}% OFF
        </span>
        {showSavings && details.savings > 0 && (
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            (Save {formatInrPrice(details.savings)})
          </span>
        )}
      </div>
    </div>
  );
}
