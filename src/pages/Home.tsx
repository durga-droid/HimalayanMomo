import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MenuCard } from '../components/MenuCard';
import { Product } from '../types';
import { getMenu, subscribeToMenu, seedMenu } from '../services/menuService';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'VEG' | 'NON-VEG'>('ALL');

  useEffect(() => {
    const fetchInitialMenu = async () => {
      try {
        const data = await getMenu();
        setProducts(data);
        if (data.length === 0) {
          await seedMenu();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMenu();

    const subscription = subscribeToMenu((data) => {
      setProducts(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredProducts = products.filter(p => filter === 'ALL' || p.category === filter);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Navbar />
      
      <div className="bg-stone-900 py-12 text-center text-white">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight md:text-6xl"
        >
          Craving Momos?
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-stone-400"
        >
          Best steam, fried & crispy momos in town.
        </motion.p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center gap-2">
          {['ALL', 'VEG', 'NON-VEG'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                filter === cat 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <MenuCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
