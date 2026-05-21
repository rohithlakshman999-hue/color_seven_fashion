"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Brand, Category } from "@/types/database";
import {
  loadCatalog,
  refreshCatalog,
  addCategory,
  updateCategory,
  deleteCategory,
  addBrand,
  updateBrand,
  deleteBrand,
  type CatalogData,
} from "@/lib/catalogStore";
import { isSupabaseConfigured } from "@/lib/supabase";

interface CatalogContextType {
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  syncedToCloud: boolean;
  refresh: () => Promise<void>;
  addCategory: typeof addCategory;
  updateCategory: typeof updateCategory;
  deleteCategory: typeof deleteCategory;
  addBrand: typeof addBrand;
  updateBrand: typeof updateBrand;
  deleteBrand: typeof deleteBrand;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogData>({
    categories: [],
    brands: [],
  });
  const [loading, setLoading] = useState(true);

  const applyCatalog = useCallback((data: CatalogData) => {
    setCatalog(data);
  }, []);

  const refresh = useCallback(async () => {
    const data = await refreshCatalog();
    applyCatalog(data);
  }, [applyCatalog]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await loadCatalog(true);
        if (active) applyCatalog(data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applyCatalog]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key?.startsWith("colour_seven_categories") ||
        e.key?.startsWith("colour_seven_brands") ||
        e.key === "colour_seven_catalog_customized"
      ) {
        void refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const value = useMemo(
    () => ({
      categories: catalog.categories,
      brands: catalog.brands,
      loading,
      syncedToCloud: isSupabaseConfigured,
      refresh,
      addCategory,
      updateCategory,
      deleteCategory,
      addBrand,
      updateBrand,
      deleteBrand,
    }),
    [catalog, loading, refresh]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return ctx;
}
