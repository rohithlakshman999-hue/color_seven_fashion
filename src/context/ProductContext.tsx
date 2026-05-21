"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { products as defaultProducts } from "@/data/products";

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
}

interface ProductContextType {
  products: Product[];
  loaded: boolean;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = "colour_seven_products";

function readProductsFromStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored) as Product[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  const withBrand: Product[] = defaultProducts.map((p) => ({
    ...p,
    brand: p.brand || "Colour Seven",
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(withBrand));
  return withBrand;
}

function writeProductsToStorage(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getInitialProducts(): Product[] {
  if (typeof window === "undefined") return [];
  return readProductsFromStorage();
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined");
  const skipNextSave = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProducts(readProductsFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    writeProductsToStorage(products);
  }, [products, loaded]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Product[];
          if (Array.isArray(parsed)) {
            skipNextSave.current = true;
            setProducts(parsed);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const deleteProduct = useCallback((id: string) => {
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
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
    }),
    [products, loaded, addProduct, updateProduct, deleteProduct, getProductById]
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
