import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, CreditCard, Banknote } from 'lucide-react';

export const Checkout = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    orderType: 'Pickup' as 'Delivery' | 'Pickup',
    paymentMethod: 'UPI' as 'UPI' | 'COD'
  });

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: formData.name,
          mobile_number: formData.mobile,
          address: 'Pickup Order', // Default address for pickup
          order_type: 'Pickup',
          items: cart,
          total_amount: totalAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Simulate Payment Delay
        if (formData.paymentMethod === 'UPI') {
          toast.loading('Redirecting to Payment Gateway...', { duration: 2000 });
          setTimeout(() => {
            clearCart();
            navigate('/success', { state: { orderId: data.orderId } });
          }, 2000);
        } else {
          clearCart();
          navigate('/success', { state: { orderId: data.orderId } });
        }
      } else {
        toast.error('Failed to place order');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Navbar />
      
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-stone-900">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Contact Details</h2>
            <Input 
              label="Full Name" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
            />
            <Input 
              label="Mobile Number" 
              required 
              type="tel"
              value={formData.mobile}
              onChange={e => setFormData({...formData, mobile: e.target.value})}
              placeholder="9876543210"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Payment Method</h2>
            <div className="space-y-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${formData.paymentMethod === 'UPI' ? 'border-orange-600 bg-orange-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="UPI" 
                  checked={formData.paymentMethod === 'UPI'}
                  onChange={() => setFormData({...formData, paymentMethod: 'UPI'})}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <CreditCard className="h-5 w-5 text-stone-600" />
                <div className="flex flex-col">
                  <span className="font-medium text-stone-900">Pay via UPI (GPay/PhonePe)</span>
                  {formData.paymentMethod === 'UPI' && (
                    <span className="text-sm text-stone-500">UPI ID: 8652124114-2@ybl</span>
                  )}
                </div>
              </label>
              
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${formData.paymentMethod === 'COD' ? 'border-orange-600 bg-orange-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="COD" 
                  checked={formData.paymentMethod === 'COD'}
                  onChange={() => setFormData({...formData, paymentMethod: 'COD'})}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <Banknote className="h-5 w-5 text-stone-600" />
                <span className="font-medium text-stone-900">Cash on Delivery</span>
              </label>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-6">
            <div className="flex justify-between text-xl font-bold text-stone-900">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="mt-6 w-full" 
              isLoading={loading}
            >
              {formData.paymentMethod === 'UPI' ? 'Pay Now' : 'Place Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
