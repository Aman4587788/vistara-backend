import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import { errorHandler } from './middleware/errorHandler'

// Routes
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import wishlistRoutes from './routes/wishlist'
import orderRoutes from './routes/orders'
import paymentRoutes from './routes/payment'
import reviewRoutes from './routes/reviews'
import profileRoutes from './routes/profile'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Root route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #050505; color: white; text-align: center;">
      <h1 style="font-size: 3rem; margin-bottom: 10px;">🚀 Vistara API</h1>
      <p style="color: #888; font-size: 1.2rem;">The backend is live and running perfectly.</p>
      <div style="margin-top: 20px; padding: 20px; border: 1px solid #333; border-radius: 10px; background: #0a0a0a;">
        <p><strong>Health Check:</strong> <a href="/api/health" style="color: #fff;">/api/health</a></p>
        <p><strong>Status:</strong> <span style="color: #4ade80;">Online</span></p>
      </div>
    </div>
  `);
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (
      origin.includes('localhost') ||
      origin.includes('vercel.app') ||
      origin === (process.env.CLIENT_URL || '')
    ) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: '🚀 Vistara API is running', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/profile', profileRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n🚀 Vistara backend running on http://localhost:${PORT}`)
  console.log(`📦 Health:    http://localhost:${PORT}/api/health`)
  console.log(`📦 Products:  http://localhost:${PORT}/api/products`)
  console.log(`🌱 Seed DB:   POST http://localhost:${PORT}/api/products/seed`)
})

export default app
