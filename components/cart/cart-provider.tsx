"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AddCartItemInput, CartItem } from "@/types/cart";
import { CART_STORAGE_KEY, createCartItem, getCartCount, getCartSubtotal } from "@/lib/cart";
import { priceCartItem } from "@/lib/order-pricing";

/**
 * Applies the shared pricing rules to a cart line.
 *
 * The same function decides the charge on the server, so pricing every line
 * through it here keeps the cart showing exactly what checkout will charge.
 * A line it cannot price is left as is; checkout refuses it with the reason.
 */
function reprice(item: CartItem): CartItem {
  const priced = priceCartItem(item);
  return "error" in priced ? item : { ...item, ...priced };
}

type CartContextType = {
  items: CartItem[];
  addItem: (item: AddCartItemInput) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return;
    try {
      // Repriced on load, so a cart saved before a price change shows today's price.
      setItems((JSON.parse(saved) as CartItem[]).map(reprice));
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(input: AddCartItemInput) {
    const created = createCartItem(input);
    // Lines with a size breakdown are never merged: adding the quantities
    // would double the count while the sizes still described one batch.
    const newItem = reprice(
      created.details.Sizes
        ? { ...created, cartItemId: `${created.cartItemId}-${Date.now()}` }
        : created
    );
    setItems((prev) => {
      const existing = prev.find((c) => c.cartItemId === newItem.cartItemId);
      if (existing) {
        return prev.map((c) =>
          c.cartItemId === newItem.cartItemId
            ? reprice({ ...c, quantity: existing.quantity + newItem.quantity })
            : c
        );
      }
      return [...prev, newItem];
    });
  }

  function removeItem(cartItemId: string) {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }

  function updateQuantity(cartItemId: string, quantity: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        // A size breakdown fixes the quantity. Changing one without the other
        // sent the shop "10 polos" alongside sizes for 5.
        if (item.details.Sizes) return item;
        const safeQty = Math.max(item.minQty, Math.floor(quantity) || item.minQty);
        return reprice({ ...item, quantity: safeQty });
      })
    );
  }

  function clearCart() {
    setItems([]);
  }

  const cartCount = useMemo(() => getCartCount(items), [items]);
  const subtotal  = useMemo(() => getCartSubtotal(items), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
