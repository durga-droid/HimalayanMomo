import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';

export const createOrder = async (
  orderData: Omit<Order, 'id' | 'created_at' | 'items'>,
  items: Omit<OrderItem, 'id' | 'order_id'>[]
) => {
  // 1. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert order items
  const orderItems = items.map(item => ({
    ...item,
    order_id: order.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
};

export const updateOrderPaymentStatus = async (orderId: string, status: 'PAID') => {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: status })
    .eq('id', orderId);

  if (error) throw error;
};

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform to match our Order type
  return data.map(order => ({
    ...order,
    items: order.order_items.map((item: any) => ({
      item_name: item.item_name,
      plate_type: item.plate_type,
      quantity: item.quantity,
      price: item.price
    }))
  })) as Order[];
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  return supabase
    .channel('orders_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
      const orders = await getOrders();
      callback(orders);
    })
    .subscribe();
};

export const updateOrderStatus = async (orderId: string, status: 'NEW' | 'COMPLETED') => {
  const { error } = await supabase
    .from('orders')
    .update({ order_status: status })
    .eq('id', orderId);

  if (error) throw error;
};

export const deleteOrder = async (orderId: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) throw error;
};
