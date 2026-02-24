import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: 'Half' | 'Full') => void;
  removeFromCart: (productId: number, variant: 'Half' | 'Full') => void;
  updateQuantity: (productId: number, variant: 'Half' | 'Full', quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('momo-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('momo-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, variant: 'Half' | 'Full') => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id && item.variant === variant);
      const price = variant === 'Half' ? product.price_half : product.price_full;

      if (existingItem) {
        toast.success(`Updated quantity for ${product.name} (${variant})`);
        return prev.map(item => 
          item.id === product.id && item.variant === variant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      toast.success(`Added ${product.name} (${variant}) to cart`);
      return [...prev, { ...product, variant, quantity: 1, price }];
    });
  };

  const removeFromCart = (productId: number, variant: 'Half' | 'Full') => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.variant === variant)));
    toast.error('Removed item from cart');
  };

  const updateQuantity = (productId: number, variant: 'Half' | 'Full', quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, variant);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId && item.variant === variant
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('momo-cart');
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
