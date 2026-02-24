import Database from 'better-sqlite3';

const db = new Database('momo.db');

export function initDb() {
  // Create Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'VEG' or 'NON-VEG'
      type TEXT NOT NULL, -- 'Steam', 'Fried', 'Crispy'
      price_half INTEGER NOT NULL,
      price_full INTEGER NOT NULL,
      description TEXT,
      image_url TEXT
    )
  `);

  // Create Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      address TEXT NOT NULL,
      order_type TEXT NOT NULL, -- 'Delivery' or 'Pickup'
      total_amount INTEGER NOT NULL,
      payment_status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid'
      order_status TEXT DEFAULT 'New', -- 'New', 'Completed', 'Cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Order Items Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      variant TEXT NOT NULL, -- 'Half' or 'Full'
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  // Create Admin Table (Simple)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL -- In production, hash this!
    )
  `);

  // Seed Admin if not exists
  const adminCheck = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
  if (!adminCheck) {
    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', 'admin123');
  }

  // Seed Products if empty
  const productCount = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
  if (productCount.count === 0) {
    const products = [
      // VEG
      // Veg Steam Momos removed
      { name: 'Veg Paneer Mix Steam Momos', category: 'VEG', type: 'Steam', price_half: 50, price_full: 80 },
      { name: 'Veg Paneer Mix Fried Momos', category: 'VEG', type: 'Fried', price_half: 60, price_full: 100 },
      { name: 'Veg Paneer Mix Crispy Momos', category: 'VEG', type: 'Crispy', price_half: 70, price_full: 120 },
      // NON-VEG
      { name: 'Chicken Steam Momos', category: 'NON-VEG', type: 'Steam', price_half: 60, price_full: 90 },
      { name: 'Chicken Fried Momos', category: 'NON-VEG', type: 'Fried', price_half: 70, price_full: 110 },
      { name: 'Chicken Crispy Momos', category: 'NON-VEG', type: 'Crispy', price_half: 80, price_full: 130 },
    ];

    const insert = db.prepare('INSERT INTO products (name, category, type, price_half, price_full) VALUES (@name, @category, @type, @price_half, @price_full)');
    products.forEach(p => insert.run(p));
  }

  // Ensure Veg Steam Momos is removed if it exists (for existing dbs)
  db.prepare("DELETE FROM products WHERE name = 'Veg Steam Momos'").run();

  // Update image for Veg Paneer Mix Steam Momos
  db.prepare(`
    UPDATE products 
    SET image_url = 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=800&auto=format&fit=crop' 
    WHERE type = 'Steam'
  `).run();

  db.prepare(`
    UPDATE products 
    SET image_url = 'https://images.unsplash.com/photo-1625223007374-ee50915a399a?q=80&w=800&auto=format&fit=crop' 
    WHERE type = 'Fried'
  `).run();

  db.prepare(`
    UPDATE products 
    SET image_url = 'https://plus.unsplash.com/premium_photo-1661600135674-e49870a25695?q=80&w=800&auto=format&fit=crop' 
    WHERE type = 'Crispy'
  `).run();

  // Specific image for Veg Paneer Mix Steam Momos
  db.prepare(`
    UPDATE products 
    SET image_url = 'https://www.bigbasket.com/media/uploads/recipe/w-l/3506_2_1.jpg' 
    WHERE name = 'Veg Paneer Mix Steam Momos'
  `).run();

  // Specific image for Veg Paneer Mix Crispy Momos
  db.prepare(`
    UPDATE products 
    SET image_url = 'https://www.shutterstock.com/image-photo/street-style-crispy-fried-momos-600nw-2660322033.jpg' 
    WHERE name = 'Veg Paneer Mix Crispy Momos'
  `).run();

  // Specific image for Veg Paneer Mix Fried Momos
  db.prepare(`
    UPDATE products 
    SET image_url = 'https://dukaan.b-cdn.net/700x700/webp/media/c0532bc3-9fa6-4273-be15-1964396d077f.jpeg' 
    WHERE name = 'Veg Paneer Mix Fried Momos'
  `).run();

  // Specific image for Chicken Steam Momos
  db.prepare(`
    UPDATE products 
    SET image_url = 'https://salasdaily.com/cdn/shop/products/steamedmomos.jpg?v=1667533887' 
    WHERE name = 'Chicken Steam Momos'
  `).run();

  // Specific image for Chicken Fried Momos
  db.prepare(`
    UPDATE products 
    SET image_url = 'https://b.zmtcdn.com/data/dish_photos/c6a/ebb44c52b69db188c2aff97713861c6a.jpg' 
    WHERE name = 'Chicken Fried Momos'
  `).run();

  // Specific image for Chicken Crispy Momos
  db.prepare(`
    UPDATE products 
    SET image_url = 'https://i.pinimg.com/736x/1d/22/cf/1d22cf8ee5e70d49abf78919d9a9ef75.jpg' 
    WHERE name = 'Chicken Crispy Momos'
  `).run();

  // Update prices for Non-Veg items (New Prices)
  db.prepare(`UPDATE products SET price_half = 60, price_full = 90 WHERE name = 'Chicken Steam Momos'`).run();
  db.prepare(`UPDATE products SET price_half = 70, price_full = 110 WHERE name = 'Chicken Fried Momos'`).run();
  db.prepare(`UPDATE products SET price_half = 80, price_full = 130 WHERE name = 'Chicken Crispy Momos'`).run();
}

export default db;
