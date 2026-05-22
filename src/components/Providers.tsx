"use client";

import { CatalogProvider } from "@/context/CatalogContext";
import { ProductProvider } from "@/context/ProductContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { ContactInfoProvider } from "@/context/ContactInfoContext";
import { HomepageContentProvider } from "@/context/HomepageContentContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CatalogProvider>
      <ProductProvider>
        <SiteSettingsProvider>
          <ContactInfoProvider>
            <HomepageContentProvider>{children}</HomepageContentProvider>
          </ContactInfoProvider>
        </SiteSettingsProvider>
      </ProductProvider>
    </CatalogProvider>
  );
}
