import { createContext, useCallback, useContext, useState } from 'react';
import { getCart, setCartQuantity, removeCartItem } from '../services/shopService';
import { getToken } from '../services/authService';

const CartContext = createContext();

const EMPTY_CART = { items: [], total: 0, itemCount: 0 };

// The cart lives on the server (one per user), so it survives refreshes and other devices.
export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!getToken()) {
      setCart(EMPTY_CART);
      return;
    }
    try {
      setCart(await getCart());
    } catch {
      setCart(EMPTY_CART);
    }
  }, []);

  // Throws an error (e.g. "Only 2 left in stock") for the caller to show
  const addToCart = async (product) => {
    const existing = cart.items.find((item) => item.productId === product.id);
    setCart(await setCartQuantity(product.id, (existing?.quantity || 0) + 1));
    setIsCartOpen(true); // Open cart to show user it was added
  };

  const changeQuantity = async (productId, quantity) => {
    setCart(quantity < 1 ? await removeCartItem(productId) : await setCartQuantity(productId, quantity));
  };

  const removeFromCart = async (productId) => {
    setCart(await removeCartItem(productId));
  };

  // after logout or a placed order
  const resetCart = () => setCart(EMPTY_CART);

  const toggleCart = () => setIsCartOpen((open) => !open);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{ cart, refreshCart, addToCart, changeQuantity, removeFromCart, resetCart, isCartOpen, toggleCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}
