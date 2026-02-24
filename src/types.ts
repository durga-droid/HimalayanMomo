export interface Product {
  id: string;
  name: string;
  category: 'VEG' | 'NON-VEG';
  type: 'STEAM' | 'FRIED' | 'CRISPY';
  half_price: number;
  full_price: number;
  image_url?: string;
  is_available: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  variant: 'Half' | 'Full';
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  total_amount: number;
  payment_status: 'PENDING' | 'PAID';
  order_status: 'NEW' | 'COMPLETED';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  item_name: string;
  plate_type: 'HALF' | 'FULL';
  quantity: number;
  price: number;
}
