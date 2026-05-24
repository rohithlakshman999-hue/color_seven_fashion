"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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
  category: "Watches" | "Shoes" | "Clothing" | "Accessories";
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const data = await refreshProducts();
    if (mountedRef.current) {
      setProducts(data);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await loadProducts(true);
        if (active && mountedRef.current) setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
        // Always set loaded to true even on error to prevent hanging
      } finally {
        if (active && mountedRef.current) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    await storeAddProduct(product);
    // Refresh from store to get latest data including any server-side changes
    const latest = await loadProducts(true);
    if (mountedRef.current) {
      setProducts(latest);
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      await storeUpdateProduct(id, updates);
      // Refresh from store to get latest data including any server-side changes
      const latest = await loadProducts(true);
      if (mountedRef.current) {
        setProducts(latest);
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    await storeDeleteProduct(id);
    // Refresh from store to get latest data including any server-side changes
    const latest = await loadProducts(true);
    if (mountedRef.current) {
      setProducts(latest);
    }
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
