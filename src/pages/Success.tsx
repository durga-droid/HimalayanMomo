import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export const Success = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'Unknown';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-4 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6 rounded-full bg-green-100 p-6"
      >
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </motion.div>
      
      <h1 className="text-3xl font-bold text-stone-900">Order Confirmed!</h1>
      <p className="mt-2 text-stone-500">Thank you for your order. We've received it.</p>
      
      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-500">Order ID</p>
        <p className="text-xl font-bold text-stone-900">{orderId}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link to="/">
          <Button size="lg" variant="outline">Order More</Button>
        </Link>
        <a 
          href={`https://wa.me/?text=I just ordered delicious momos from HimalayanMomo! Order ID: ${orderId}. Order here: https://himalayanmomo-4.onrender.com`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Share on WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
};
