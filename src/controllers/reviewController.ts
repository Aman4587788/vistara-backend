import { Request, Response } from 'express'
import Review from '../models/Review'
import Product from '../models/Product'
import { AuthRequest } from '../middleware/auth'

// GET /api/reviews/:productId
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar_url')
      .sort({ createdAt: -1 })
    res.json({ success: true, reviews })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/reviews/:productId
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body
    if (!rating || !comment) {
      res.status(400).json({ success: false, message: 'rating and comment are required' }); return
    }
    const existing = await Review.findOne({ product: req.params.productId, user: req.user!.id })
    if (existing) {
      res.status(400).json({ success: false, message: 'You have already reviewed this product' }); return
    }
    const review = await Review.create({
      product: req.params.productId,
      user: req.user!.id,
      rating,
      comment,
    })
    // Recompute product rating
    const all = await Review.find({ product: req.params.productId })
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length
    await Product.findByIdAndUpdate(req.params.productId, {
      rating: Math.round(avg * 10) / 10,
      review_count: all.length,
    })
    await review.populate('user', 'name avatar_url')
    res.status(201).json({ success: true, review })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
