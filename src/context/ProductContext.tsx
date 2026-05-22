"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  loadProducts,
  refreshProducts,
  addProduct as storeAddProduct,
  updateProduct as storeUpdateProduct,
  deleteProduct as storeDeleteProduct,
  getProductsSync,
} from "@/lib/productsStore";
import { isSupabaseConfigured } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: "Watches" | "Shoes" | "Clothes" | "Accessories";
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  isNew: boolean;
  isTrending?: boolean;
}

interface ProductContextType {
  products: Product[];
  loaded: boolean;
  syncedToCloud: boolean;
  refresh: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    typeof window !== "undefined" ? getProductsSync() : []
  );
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const data = await refreshProducts();
    setProducts(data);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await loadProducts();
        if (active) setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
        // Fallback to local products if load fails
        const local = getProductsSync();
        if (active && local.length > 0) setProducts(local);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key?.startsWith("colour_seven_products") ||
        e.key === "colour_seven_products_customized"
      ) {
        void refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    const created = await storeAddProduct(product);
    setProducts((prev) => [...prev, created]);
  }, []);

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      await storeUpdateProduct(id, updates);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    await storeDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      loaded,
      syncedToCloud: isSupabaseConfigured,
      refresh,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
    }),
    [
      products,
      loaded,
      refresh,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
    ]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
