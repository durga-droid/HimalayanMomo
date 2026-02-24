import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const getMenu = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('menu')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Product[];
};

export const subscribeToMenu = (callback: (products: Product[]) => void) => {
  return supabase
    .channel('menu_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, async () => {
      const products = await getMenu();
      callback(products);
    })
    .subscribe();
};

export const seedMenu = async () => {
  const menuItems = [
    { name: 'Veg Paneer Mix Steam Momos', category: 'VEG', type: 'STEAM', half_price: 50, full_price: 80, image_url: 'https://www.bigbasket.com/media/uploads/recipe/w-l/3506_2_1.jpg', is_available: true },
    { name: 'Veg Paneer Mix Fried Momos', category: 'VEG', type: 'FRIED', half_price: 60, full_price: 100, image_url: 'https://dukaan.b-cdn.net/700x700/webp/media/c0532bc3-9fa6-4273-be15-1964396d077f.jpeg', is_available: true },
    { name: 'Veg Paneer Mix Crispy Momos', category: 'VEG', type: 'CRISPY', half_price: 70, full_price: 120, image_url: 'https://www.shutterstock.com/image-photo/street-style-crispy-fried-momos-600nw-2660322033.jpg', is_available: true },
    { name: 'Chicken Steam Momos', category: 'NON-VEG', type: 'STEAM', half_price: 60, full_price: 90, image_url: 'https://salasdaily.com/cdn/shop/products/steamedmomos.jpg?v=1667533887', is_available: true },
    { name: 'Chicken Fried Momos', category: 'NON-VEG', type: 'FRIED', half_price: 70, full_price: 110, image_url: 'https://b.zmtcdn.com/data/dish_photos/c6a/ebb44c52b69db188c2aff97713861c6a.jpg', is_available: true },
    { name: 'Chicken Crispy Momos', category: 'NON-VEG', type: 'CRISPY', half_price: 80, full_price: 130, image_url: 'https://i.pinimg.com/736x/1d/22/cf/1d22cf8ee5e70d49abf78919d9a9ef75.jpg', is_available: true },
  ];

  const { error } = await supabase.from('menu').insert(menuItems);
  if (error) throw error;
};
