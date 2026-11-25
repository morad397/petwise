// shopService.js
// Products, cart and orders from the FastAPI backend.

import { apiRequest } from './api';
import shopShampoo from '../assets/shop-shampoo.png';
import shopToy from '../assets/shop-toy.png';
import shopFood from '../assets/shop-food.png';
import shopClothes from '../assets/shop-clothes.png';
import shopBed from '../assets/shop-bed.png';

// The starter products use images bundled with the app ("asset:shop-toy" etc.)
const BUNDLED_IMAGES = {
  'asset:shop-shampoo': shopShampoo,
  'asset:shop-toy': shopToy,
  'asset:shop-food': shopFood,
  'asset:shop-clothes': shopClothes,
  'asset:shop-bed': shopBed,
};
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80';

export const productImage = (imageUrl) => BUNDLED_IMAGES[imageUrl] || imageUrl || FALLBACK_IMAGE;

export const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

// --- products ---
export const getProducts = ({ includeHidden = false } = {}) =>
  apiRequest(`/products${includeHidden ? '?include_hidden=true' : ''}`, { auth: false });
export const createProduct = (data) => apiRequest('/products', { method: 'POST', body: data });
export const updateProduct = (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: data });
export const deleteProduct = (id) => apiRequest(`/products/${id}`, { method: 'DELETE' });

// --- cart (one per user, saved on the server) ---
// returns { items: [{ productId, name, imageUrl, unitPrice, quantity, subtotal, inStock }], total, itemCount }
export const getCart = () => apiRequest('/cart');
export const setCartQuantity = (productId, quantity) =>
  apiRequest(`/cart/items/${productId}`, { method: 'PUT', body: { quantity } });
export const removeCartItem = (productId) => apiRequest(`/cart/items/${productId}`, { method: 'DELETE' });

// --- orders ---
export const placeOrder = (shippingAddress, paymentMethod) =>
  apiRequest('/orders', { method: 'POST', body: { shippingAddress, paymentMethod } });
export const getOrders = () => apiRequest('/orders');
export const cancelOrder = (id) => apiRequest(`/orders/${id}/cancel`, { method: 'POST' });
export const setOrderStatus = (id, status) => apiRequest(`/orders/${id}/status`, { method: 'POST', body: { status } });
