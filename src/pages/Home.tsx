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

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialMenu = async () => {
      try {
        const data = await getMenu();
        setProducts(data);
        if (data.length === 0) {
          try {
            await seedMenu();
            const freshData = await getMenu();
            setProducts(freshData);
          } catch (seedErr: any) {
            console.warn('Seeding failed (likely due to RLS):', seedErr.message);
            if (data.length === 0) {
              setError('Menu is empty. Please add items via the Admin panel or run the SQL setup script in Supabase.');
            }
          }
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        if (err.message?.includes('relation "public.menu" does not exist')) {
          setError('Database tables not found. Please run the SQL setup script in your Supabase SQL Editor.');
        } else {
          setError('Failed to connect to Supabase. Please check your environment variables.');
        }
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

        {error ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 text-center">
            <p className="font-medium text-orange-800">{error}</p>
            <p className="mt-2 text-sm text-orange-600">
              Make sure you have followed the SQL setup instructions and set your environment variables.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (
              <MenuCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
