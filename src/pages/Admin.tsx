import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Order } from '../types';
import { toast } from 'react-hot-toast';
import { Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const Admin = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin-token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('admin-token', data.token);
        toast.success('Logged in successfully');
        fetchOrders();
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
      });
      toast.success('Order deleted');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-stone-900">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <Button type="submit" className="w-full" isLoading={loading}>
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
            onClick={() => {
              setToken(null);
              localStorage.removeItem('admin-token');
            }}
          >
            Logout
          </Button>
        </div>

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-900">{order.id}</h3>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      order.order_status === 'New' && "bg-blue-100 text-blue-700",
                      order.order_status === 'Completed' && "bg-green-100 text-green-700",
                      order.order_status === 'Cancelled' && "bg-red-100 text-red-700",
                    )}>
                      {order.order_status}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">
                    {new Date(order.created_at).toLocaleString()} • {order.order_type}
                  </p>
                  <p className="mt-1 font-medium text-stone-900">{order.customer_name} ({order.mobile_number})</p>
                  {order.order_type === 'Delivery' && (
                    <p className="text-sm text-stone-500">{order.address}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-xl font-bold text-stone-900">₹{order.total_amount}</div>
                  <div className="flex gap-2">
                    {order.order_status !== 'Completed' && (
                      <Button size="sm" onClick={() => updateStatus(order.id, 'Completed')} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-1 h-4 w-4" /> Complete
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => deleteOrder(order.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-stone-100 pt-4">
                <h4 className="mb-2 text-sm font-bold text-stone-700">Order Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm text-stone-600">
                      <span>{item.quantity}x {item.product_name} ({item.variant})</span>
                      <span>₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-12 text-center text-stone-500">
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
