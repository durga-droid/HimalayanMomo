import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Order } from '../types';
import { toast } from 'react-hot-toast';
import { Loader2, Trash2, CheckCircle, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getOrders, subscribeToOrders, updateOrderStatus, deleteOrder } from '../services/orderService';

export const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchInitialOrders = async () => {
        try {
          const data = await getOrders();
          setOrders(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialOrders();

      const subscription = subscribeToOrders((data) => {
        setOrders(data);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Logged in successfully');
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const handleStatusUpdate = async (id: string, status: 'NEW' | 'COMPLETED') => {
    try {
      await updateOrderStatus(id, status);
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-stone-900">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Email" 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
            <Button type="submit" className="w-full" isLoading={loginLoading}>
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-stone-900">Order Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <>
              {orders.map(order => (
                <div key={order.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-stone-900">{order.order_number}</h3>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-bold",
                          order.order_status === 'NEW' && "bg-blue-100 text-blue-700",
                          order.order_status === 'COMPLETED' && "bg-green-100 text-green-700",
                        )}>
                          {order.order_status}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="mt-1 font-medium text-stone-900">{order.customer_name} ({order.phone})</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xl font-bold text-stone-900">₹{order.total_amount}</div>
                      <div className="flex gap-2">
                        {order.order_status !== 'COMPLETED' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'COMPLETED')} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-1 h-4 w-4" /> Complete
                          </Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => handleDeleteOrder(order.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-stone-100 pt-4">
                    <h4 className="mb-2 text-sm font-bold text-stone-700">Order Items:</h4>
                    <ul className="space-y-1">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm text-stone-600">
                          <span>{item.quantity}x {item.item_name} ({item.plate_type})</span>
                          <span>₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 text-xs font-medium text-green-600">
                      Payment Status: {order.payment_status}
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="py-12 text-center text-stone-500">
                  No orders found.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
