import { Request, Response } from 'express'
import Product from '../models/Product'

const sampleProducts = [
  { name: 'Classic Sneakers', category: 'Fashion', price: 1299, original_price: 1599, description: 'Comfortable and stylish classic sneakers for everyday wear.', emoji: '👟', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'], stock: 50, badge: 'NEW', rating: 4.8, review_count: 124 },
  { name: 'Wireless Earbuds', category: 'Electronics', price: 2499, original_price: 2999, description: 'High-quality sound with deep bass and active noise cancellation. 24h battery.', emoji: '🎧', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600'], stock: 80, badge: 'HOT', rating: 4.9, review_count: 342 },
  { name: 'Minimal Desk Lamp', category: 'Home', price: 899, original_price: 1099, description: 'Adjustable brightness minimal desk lamp. Perfect for reading and studying.', emoji: '💡', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600'], stock: 40, badge: null, rating: 4.5, review_count: 89 },
  { name: 'Silk Evening Dress', category: 'Fashion', price: 3199, original_price: 3999, description: 'Elegant premium silk evening dress for special occasions.', emoji: '👗', images: ['https://images.unsplash.com/photo-1539008835270-2a4073808922?auto=format&fit=crop&q=80&w=600'], stock: 20, badge: 'NEW', rating: 4.7, review_count: 45 },
  { name: 'Smart Watch Pro', category: 'Electronics', price: 8999, original_price: 10999, description: 'Track your fitness, heart rate, sleep, and receive notifications on the go.', emoji: '⌚', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'], stock: 60, badge: 'HOT', rating: 4.9, review_count: 890 },
  { name: 'Scented Candle Set', category: 'Home', price: 649, original_price: 799, description: 'Set of 3 soothing aromatherapy candles: Lavender, Vanilla, and Sandalwood.', emoji: '🕯️', images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600'], stock: 100, badge: null, rating: 4.6, review_count: 210 },
  { name: 'Vitamin C Serum', category: 'Beauty', price: 799, original_price: 999, description: 'Brightening Vitamin C serum with hyaluronic acid for a glowing complexion.', emoji: '✨', images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=600'], stock: 75, badge: 'NEW', rating: 4.8, review_count: 567 },
  { name: 'Premium Yoga Mat', category: 'Sports', price: 1099, original_price: 1299, description: 'Non-slip, eco-friendly thick yoga mat with carrying strap.', emoji: '🧘', images: ['https://images.unsplash.com/photo-1601925260368-ae2f81c255f8?auto=format&fit=crop&q=80&w=600'], stock: 45, badge: null, rating: 4.7, review_count: 132 },
  { name: 'Leather Wallet', category: 'Fashion', price: 599, original_price: 799, description: 'Genuine leather slim bifold wallet with RFID blocking technology.', emoji: '👜', images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600'], stock: 90, badge: null, rating: 4.4, review_count: 78 },
  { name: 'Bluetooth Speaker', category: 'Electronics', price: 3499, original_price: 4299, description: 'Waterproof portable bluetooth speaker with 360-degree sound and heavy bass.', emoji: '🔊', images: ['https://images.unsplash.com/photo-1608156639585-34052e81c99f?auto=format&fit=crop&q=80&w=600'], stock: 55, badge: 'HOT', rating: 4.8, review_count: 423 },
  { name: 'Ceramic Coffee Mug', category: 'Home', price: 349, original_price: 499, description: 'Handcrafted ceramic coffee mug. Microwave and dishwasher safe.', emoji: '☕', images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600'], stock: 120, badge: null, rating: 4.9, review_count: 156 },
  { name: 'Running Shoes', category: 'Sports', price: 2199, original_price: 2799, description: 'Lightweight breathable running shoes with advanced shock absorption.', emoji: '👟', images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600'], stock: 65, badge: 'NEW', rating: 4.6, review_count: 289 },
]

// GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query
    const query: Record<string, unknown> = {}

    if (category && category !== 'all') query.category = new RegExp(category as string, 'i')
    if (search) query.$text = { $search: search as string }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(parseInt(limit as string)).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ])

    res.json({ success: true, total, page: parseInt(page as string), products })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return }
    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/products/seed  — populates DB with all 12 sample products
export const seedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    await Product.deleteMany({})
    const products = await Product.insertMany(sampleProducts)
    res.json({ success: true, message: `${products.length} products seeded`, products })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
