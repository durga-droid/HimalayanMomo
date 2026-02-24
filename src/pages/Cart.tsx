import React from 'react';
import { useCart } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-4 text-center">
          <div className="mb-4 rounded-full bg-stone-100 p-6">
            <Trash2 className="h-12 w-12 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Your cart is empty</h2>
          <p className="mt-2 text-stone-500">Looks like you haven't added any momos yet.</p>
          <Link to="/" className="mt-8">
            <Button size="lg">Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Navbar />
      
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-stone-900">Your Cart</h1>
        
        <div className="space-y-4">
          {cart.map((item) => (
            <motion.div 
              key={`${item.id}-${item.variant}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-stone-100">
                  <img 
                    src={item.image_url || `https://picsum.photos/seed/${item.id}/100/100`} 
                    alt={item.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{item.name}</h3>
                  <p className="text-sm text-stone-500">{item.variant} Plate (₹{item.price})</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg bg-stone-100 p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                    className="rounded-md p-1 hover:bg-white hover:shadow-sm"
                  >
                    <Minus className="h-4 w-4 text-stone-600" />
                  </button>
                  <span className="w-8 text-center font-bold text-stone-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                    className="rounded-md p-1 hover:bg-white hover:shadow-sm"
                  >
                    <Plus className="h-4 w-4 text-stone-600" />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id, item.variant)}
                  className="text-stone-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between text-lg font-medium text-stone-600">
            <span>Subtotal</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="mt-4 flex justify-between text-xl font-bold text-stone-900">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
          
          <Link to="/checkout" className="mt-8 block w-full">
            <Button size="lg" className="w-full">
              Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
