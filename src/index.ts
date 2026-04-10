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

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://vistara-cart.vercel.app',
  /\.vercel\.app$/,
]
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // allow server-to-server
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )
    if (allowed) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
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
