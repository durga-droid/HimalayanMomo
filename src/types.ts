export interface Product {
  id: number;
  name: string;
  category: 'VEG' | 'NON-VEG';
  type: 'Steam' | 'Fried' | 'Crispy';
  price_half: number;
  price_full: number;
  description?: string;
  image_url?: string;
}

export interface CartItem extends Product {
  variant: 'Half' | 'Full';
  quantity: number;
  price: number; // Calculated based on variant
}

export interface Order {
  id: string;
  customer_name: string;
  mobile_number: string;
  address: string;
  order_type: 'Delivery' | 'Pickup';
  total_amount: number;
  payment_status: 'Pending' | 'Paid';
  order_status: 'New' | 'Completed' | 'Cancelled';
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_name: string;
  variant: 'Half' | 'Full';
  quantity: number;
  price: number;
}
