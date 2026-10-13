"use client";

import { CatalogProvider } from "@/context/CatalogContext";
import { ProductProvider } from "@/context/ProductContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { ContactInfoProvider } from "@/context/ContactInfoContext";
import { HomepageContentProvider } from "@/context/HomepageContentContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CatalogProvider>
      <ProductProvider>
        <SiteSettingsProvider>
          <ContactInfoProvider>
            <HomepageContentProvider>
              <CartProvider>{children}</CartProvider>
            </HomepageContentProvider>
          </ContactInfoProvider>
        </SiteSettingsProvider>
      </ProductProvider>
    </CatalogProvider>
  );
}
