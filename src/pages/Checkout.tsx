import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import { createOrder, updateOrderPaymentStatus } from '../services/orderService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
  });

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order in PENDING state first
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      const order = await createOrder(
        {
          order_number: orderNumber,
          customer_name: formData.name,
          phone: formData.mobile,
          address: 'Pickup Order',
          total_amount: totalAmount,
          payment_status: 'PENDING',
          order_status: 'NEW'
        },
        cart.map(item => ({
          item_name: item.name,
          plate_type: item.variant.toUpperCase() as 'HALF' | 'FULL',
          quantity: item.quantity,
          price: item.price
        }))
      );

      // 2. Launch Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount * 100, // Amount in paise
        currency: "INR",
        name: "Himalayan Momo",
        description: "Momo Order Payment",
        handler: async function (response: any) {
          if (response.razorpay_payment_id) {
            try {
              // 3. Update payment status to PAID
              await updateOrderPaymentStatus(order.id, 'PAID');
              
              clearCart();
              navigate('/success', { state: { orderId: orderNumber } });
              toast.success('Payment Successful & Order Placed!');
            } catch (error) {
              console.error(error);
              toast.error('Failed to update payment status');
            }
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.mobile,
        },
        theme: {
          color: "#ea580c",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate order');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Navbar />
      
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-stone-900">Checkout</h1>
        
        <form onSubmit={handlePayment} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
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
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-orange-600 bg-orange-50 p-4 transition-all">
                <CreditCard className="h-5 w-5 text-stone-600" />
                <div className="flex flex-col">
                  <span className="font-medium text-stone-900">Pay via UPI / Card (Razorpay)</span>
                </div>
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
              Pay Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
