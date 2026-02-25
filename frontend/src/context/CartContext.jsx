import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);   // full cart object from API
  const [loading, setLoading] = useState(false);

  // Fetch cart from server whenever auth changes
  const fetchCart = useCallback(async () => {
    if (!accessToken) { setCart(null); return; }
    try {
      setLoading(true);
      const res = await api.getCart(accessToken);
      setCart(res.data?.cart ?? null);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setCart(null);
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (medicine, qty = 1) => {
    if (!accessToken) return;
    const res = await api.addToCart({ medicineId: medicine.id, quantity: qty }, accessToken);
    setCart(res.data?.cart ?? null);
  }, [accessToken]);

  const updateQty = useCallback(async (medicineId, newQty) => {
    if (!accessToken) return;
    if (newQty <= 0) {
      const res = await api.removeCartItem(medicineId, accessToken);
      setCart(res.data?.cart ?? null);
    } else {
      const res = await api.updateCartItem(medicineId, { quantity: newQty }, accessToken);
      setCart(res.data?.cart ?? null);
    }
  }, [accessToken]);

  const removeFromCart = useCallback(async (medicineId) => {
    if (!accessToken) return;
    const res = await api.removeCartItem(medicineId, accessToken);
    setCart(res.data?.cart ?? null);
  }, [accessToken]);

  const clearCart = useCallback(async () => {
    if (!accessToken) return;
    await api.clearCart(accessToken);
    setCart(null);
  }, [accessToken]);

  const items = cart?.items ?? [];
  const totalItems = cart?.totalQuantity ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const tax = cart?.tax ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const grandTotal = cart?.grandTotal ?? 0;
  const requiresPrescription = cart?.requiresPrescription ?? false;
  const freeDeliveryThreshold = cart?.freeDeliveryThreshold ?? 1000;

  const value = {
    items,
    totalItems,
    subtotal,
    tax,
    deliveryFee,
    grandTotal,
    requiresPrescription,
    freeDeliveryThreshold,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    fetchCart,
    loading,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
