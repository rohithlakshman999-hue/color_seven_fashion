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

export interface CartItem {
  id: string; // unique key combining productId + size + color
  productId: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  slug?: string;
}

interface AddToCartInput {
  productId: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string | null;
  color?: string | null;
  quantity?: number;
  slug?: string;
  openDrawer?: boolean;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (input: AddToCartInput) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "colour_seven_cart_v1";

function generateItemId(
  productId: string,
  size?: string | null,
  color?: string | null
): string {
  const s = size?.trim() || "default";
  const c = color?.trim() || "default";
  return `${productId}__${s}__${c}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Initialize cart from localStorage on mount (hydration-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (err) {
      console.warn("Failed to read cart from localStorage:", err);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to write cart to localStorage:", err);
    }
  }, [items, hasHydrated]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addToCart = useCallback((input: AddToCartInput) => {
    const qtyToAdd = Math.max(1, input.quantity ?? 1);
    const itemId = generateItemId(input.productId, input.size, input.color);

    const newItem: CartItem = {
      id: itemId,
      productId: input.productId,
      name: input.name,
      brand: input.brand,
      price: Number(input.price) || 0,
      originalPrice: input.originalPrice ? Number(input.originalPrice) : undefined,
      image: input.image || "/images/chrono_watch.png",
      size: input.size || null,
      color: input.color || null,
      quantity: qtyToAdd,
      slug: input.slug,
    };

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd,
        };
        return updated;
      }

      return [newItem, ...prevItems];
    });

    setLastAddedItem(newItem);

    // Auto-open drawer unless explicitly disabled
    if (input.openDrawer !== false) {
      setIsCartOpen(true);
    }
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      totalCount,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      lastAddedItem,
    }),
    [
      items,
      totalCount,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      lastAddedItem,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
