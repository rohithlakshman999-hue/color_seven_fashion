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

export interface AppliedCouponInfo {
  id: string;
  code: string;
  name: string;
  discount_amount: number;
  discount_percentage: number;
  applies_to: string;
  product_id?: string | null;
  product_name?: string | null;
  original_price?: number;
  desired_price?: number;
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
  // Coupon integration
  appliedCoupon: AppliedCouponInfo | null;
  discountAmount: number;
  finalTotal: number;
  couponLoading: boolean;
  couponError: string | null;
  couponSuccessMessage: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "colour_seven_cart_v1";
const COUPON_STORAGE_KEY = "colour_seven_applied_coupon_v1";

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

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);

  // Initialize cart & saved coupon from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        const parsedCoupon = JSON.parse(storedCoupon);
        if (parsedCoupon?.code) {
          setAppliedCoupon(parsedCoupon);
        }
      }
    } catch (err) {
      console.warn("Failed to read cart from localStorage:", err);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to write cart to localStorage:", err);
    }
  }, [items, hasHydrated]);

  // Save coupon to localStorage
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Failed to write coupon to localStorage:", err);
    }
  }, [appliedCoupon, hasHydrated]);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Apply Coupon via backend validation
  const applyCoupon = useCallback(
    async (code: string): Promise<{ success: boolean; message?: string; error?: string }> => {
      setCouponLoading(true);
      setCouponError(null);
      setCouponSuccessMessage(null);

      try {
        if (!code || !code.trim()) {
          const err = "Please enter a coupon code.";
          setCouponError(err);
          return { success: false, error: err };
        }

        if (items.length === 0) {
          const err = "Your shopping bag is empty.";
          setCouponError(err);
          return { success: false, error: err };
        }

        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code.trim(),
            items: items.map((i) => ({
              productId: i.productId,
              price: i.price,
              quantity: i.quantity,
              name: i.name,
            })),
          }),
        });

        const json = await res.json();

        if (!res.ok || !json.success || !json.valid) {
          const err = json.error || "Failed to apply coupon.";
          setCouponError(err);
          setAppliedCoupon(null);
          setDiscountAmount(0);
          return { success: false, error: err };
        }

        setAppliedCoupon(json.coupon);
        setDiscountAmount(json.discountAmount);
        setCouponSuccessMessage(json.message || `Coupon '${json.coupon.code}' applied!`);
        return { success: true, message: json.message };
      } catch (err: any) {
        const msg = err?.message || "Error validating coupon. Please try again.";
        setCouponError(msg);
        return { success: false, error: msg };
      } finally {
        setCouponLoading(false);
      }
    },
    [items]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
    setCouponSuccessMessage(null);
  }, []);

  // Revalidate coupon whenever items change
  useEffect(() => {
    if (!appliedCoupon || items.length === 0) {
      if (items.length === 0 && appliedCoupon) {
        removeCoupon();
      }
      return;
    }

    let isMounted = true;
    async function revalidate() {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: appliedCoupon!.code,
            items: items.map((i) => ({
              productId: i.productId,
              price: i.price,
              quantity: i.quantity,
              name: i.name,
            })),
          }),
        });
        const json = await res.json();
        if (isMounted) {
          if (json.success && json.valid) {
            setDiscountAmount(json.discountAmount);
            setCouponError(null);
          } else {
            setCouponError(json.error || "Coupon is no longer valid for updated cart items.");
            setAppliedCoupon(null);
            setDiscountAmount(0);
          }
        }
      } catch {
        // keep current discount in case of temporary network glitch
      }
    }

    revalidate();

    return () => {
      isMounted = false;
    };
  }, [items, appliedCoupon?.code, removeCoupon]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addToCart = useCallback((input: AddToCartInput) => {
    const id = generateItemId(input.productId, input.size, input.color);
    const quantity = input.quantity ?? 1;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartItem = {
        id,
        productId: input.productId,
        name: input.name,
        brand: input.brand,
        price: input.price,
        originalPrice: input.originalPrice,
        image: input.image,
        size: input.size ?? null,
        color: input.color ?? null,
        quantity,
        slug: input.slug,
      };
      return [...prev, newItem];
    });

    const addedItem: CartItem = {
      id,
      productId: input.productId,
      name: input.name,
      brand: input.brand,
      price: input.price,
      originalPrice: input.originalPrice,
      image: input.image,
      size: input.size ?? null,
      color: input.color ?? null,
      quantity,
      slug: input.slug,
    };
    setLastAddedItem(addedItem);

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
    removeCoupon();
  }, [removeCoupon]);

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
      appliedCoupon,
      discountAmount,
      finalTotal,
      couponLoading,
      couponError,
      couponSuccessMessage,
      applyCoupon,
      removeCoupon,
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
      appliedCoupon,
      discountAmount,
      finalTotal,
      couponLoading,
      couponError,
      couponSuccessMessage,
      applyCoupon,
      removeCoupon,
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
