import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'lpa_cart';

const loadCart = () => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    // Also set as cookie for compatibility
    if (stored) {
      document.cookie = `${CART_KEY}=${encodeURIComponent(stored)};path=/;max-age=86400`;
    }
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  const json = JSON.stringify(items);
  localStorage.setItem(CART_KEY, json);
  // Also save to cookie
  document.cookie = `${CART_KEY}=${encodeURIComponent(json)};path=/;max-age=86400`;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.lpa_stock_ID === product.lpa_stock_ID);
      if (existing) {
        return prev.map(i =>
          i.lpa_stock_ID === product.lpa_stock_ID
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        lpa_stock_ID: product.lpa_stock_ID,
        lpa_stock_name: product.lpa_stock_name,
        lpa_stock_price: product.lpa_stock_price,
        lpa_stock_image: product.lpa_stock_image,
        quantity: 1
      }];
    });
  }, []);

  const removeFromCart = useCallback((stockId) => {
    setItems(prev => prev.filter(i => i.lpa_stock_ID !== stockId));
  }, []);

  const updateQuantity = useCallback((stockId, quantity) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(i =>
        i.lpa_stock_ID === stockId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
    document.cookie = `${CART_KEY}=;path=/;max-age=0`;
  }, []);

  const cartTotal = items.reduce((sum, i) => sum + i.lpa_stock_price * i.quantity, 0);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
