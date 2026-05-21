"use client";

import { CatalogProvider } from "@/context/CatalogContext";
import { ProductProvider } from "@/context/ProductContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CatalogProvider>
      <ProductProvider>{children}</ProductProvider>
    </CatalogProvider>
  );
}
