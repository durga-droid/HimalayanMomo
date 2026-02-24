import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb } from "./db";
import db from "./db";
import { randomUUID } from "crypto";

// Initialize Database
initDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get Menu
  app.get("/api/menu", (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  });

  // Create Order
  app.post("/api/orders", (req, res) => {
    const { customer_name, mobile_number, address, order_type, items, total_amount } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      const insertOrder = db.prepare(`
        INSERT INTO orders (id, customer_name, mobile_number, address, order_type, total_amount, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, variant, quantity, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction(() => {
        // In a real app, payment_status would be 'Pending' initially, 
        // and updated to 'Paid' via webhook after successful payment.
        insertOrder.run(orderId, customer_name, mobile_number, address, order_type, total_amount, 'Paid'); 
        
        for (const item of items) {
          insertItem.run(orderId, item.id, item.name, item.variant, item.quantity, item.price);
        }
      });

      transaction();
      res.json({ success: true, orderId });
    } catch (error) {
      console.error("Order creation failed:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const admin = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?').get(username, password);
    
    if (admin) {
      res.json({ success: true, token: "dummy-token" }); // In production use JWT
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Get All Orders (Admin)
  app.get("/api/admin/orders", (req, res) => {
    // In production, verify token here
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const items = db.prepare('SELECT * FROM order_items').all();
    
    // Attach items to orders
    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      items: items.filter((item: any) => item.order_id === order.id)
    }));

    res.json(ordersWithItems);
  });

  // Update Order Status
  app.post("/api/admin/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.prepare('UPDATE orders SET order_status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  });

  // Delete Order
  app.delete("/api/admin/orders/:id", (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(id);
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files from dist
    const path = await import("path");
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));

    // SPA Fallback
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
