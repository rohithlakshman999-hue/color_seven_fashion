"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applyCatalog = useCallback((data: CatalogData) => {
    if (mountedRef.current) {
      setCatalog(data);
    }
  }, []);

  const refresh = useCallback(async () => {
    const data = await refreshCatalog();
    if (mountedRef.current) {
      applyCatalog(data);
    }
  }, [applyCatalog]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await loadCatalog();
        if (active && mountedRef.current) applyCatalog(data);
      } catch (error) {
        console.error("Failed to load catalog:", error);
        // Always set loading to false even on error to prevent hanging
      } finally {
        if (active && mountedRef.current) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applyCatalog]);

  const addCategoryWithRefresh = useCallback(async (data: Parameters<typeof addCategory>[0]) => {
    const result = await addCategory(data);
    const latest = await loadCatalog(true);
    applyCatalog(latest);
    return result;
  }, [addCategory, applyCatalog]);

  const updateCategoryWithRefresh = useCallback(async (id: string, updates: Parameters<typeof updateCategory>[1]) => {
    await updateCategory(id, updates);
    const latest = await loadCatalog(true);
    applyCatalog(latest);
  }, [updateCategory, applyCatalog]);

  const deleteCategoryWithRefresh = useCallback(async (id: string) => {
    await deleteCategory(id);
    const latest = await loadCatalog(true);
    applyCatalog(latest);
  }, [deleteCategory, applyCatalog]);

  const addBrandWithRefresh = useCallback(async (data: Parameters<typeof addBrand>[0]) => {
    const result = await addBrand(data);
    const latest = await loadCatalog(true);
    applyCatalog(latest);
    return result;
  }, [addBrand, applyCatalog]);

  const updateBrandWithRefresh = useCallback(async (id: string, updates: Parameters<typeof updateBrand>[1]) => {
    await updateBrand(id, updates);
    const latest = await loadCatalog(true);
    applyCatalog(latest);
  }, [updateBrand, applyCatalog]);

  const deleteBrandWithRefresh = useCallback(async (id: string) => {
    await deleteBrand(id);
    const latest = await loadCatalog(true);
    applyCatalog(latest);
  }, [deleteBrand, applyCatalog]);

  const value = useMemo(
    () => ({
      categories: catalog.categories,
      brands: catalog.brands,
      loading,
      syncedToCloud: isSupabaseConfigured,
      refresh,
      addCategory: addCategoryWithRefresh,
      updateCategory: updateCategoryWithRefresh,
      deleteCategory: deleteCategoryWithRefresh,
      addBrand: addBrandWithRefresh,
      updateBrand: updateBrandWithRefresh,
      deleteBrand: deleteBrandWithRefresh,
    }),
    [catalog, loading, refresh, addCategoryWithRefresh, updateCategoryWithRefresh, deleteCategoryWithRefresh, addBrandWithRefresh, updateBrandWithRefresh, deleteBrandWithRefresh]
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
