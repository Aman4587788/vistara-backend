import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  category: string
  price: number
  original_price: number
  description: string
  emoji: string
  images: string[]
  stock: number
  badge: string | null
  rating: number
  review_count: number
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    original_price: { type: Number, required: true },
    description: { type: String, required: true },
    emoji: { type: String, default: '📦' },
    images: [{ type: String }],
    stock: { type: Number, default: 100 },
    badge: { type: String, default: null },
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', category: 'text' })

export default mongoose.model<IProduct>('Product', ProductSchema)
