import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuCardProps {
  product: Product;
}

export const MenuCard: React.FC<MenuCardProps> = ({ product }) => {
  const { addToCart, cart, updateQuantity } = useCart();
  const [variant, setVariant] = React.useState<'Half' | 'Full'>('Half');

  const cartItem = cart.find(item => item.id === product.id && item.variant === variant);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(product, variant);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, variant, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, variant, quantity - 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="aspect-video w-full overflow-hidden bg-stone-100">
        <img
          src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2">
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${product.category === 'VEG' ? 'bg-green-600' : 'bg-red-600'}`}>
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-stone-900">{product.name}</h3>
        <p className="text-sm text-stone-500">{product.type} Momos</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg bg-stone-100 p-1">
            <button
              onClick={() => setVariant('Half')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${variant === 'Half' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Half (6pcs)
            </button>
            <button
              onClick={() => setVariant('Full')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${variant === 'Full' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Full (12pcs)
            </button>
          </div>
          <div className="text-lg font-bold text-orange-600">
            ₹{variant === 'Half' ? product.price_half : product.price_full}
          </div>
        </div>

        <div className="mt-4">
          {quantity === 0 ? (
            <Button onClick={handleAdd} className="w-full" size="sm">
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-1">
              <Button variant="ghost" size="icon" onClick={handleDecrement} className="h-8 w-8">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold text-stone-900">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={handleIncrement} className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
