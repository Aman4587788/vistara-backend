import { Response } from 'express'
import Wishlist from '../models/Wishlist'
import { AuthRequest } from '../middleware/auth'

// GET /api/wishlist
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id }).populate('products')
    res.json({ success: true, wishlist: wishlist || { products: [] } })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/wishlist
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body
    if (!productId) { res.status(400).json({ success: false, message: 'productId is required' }); return }

    let wishlist = await Wishlist.findOne({ user: req.user!.id })
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user!.id, products: [] })

    if (wishlist.products.map(p => p.toString()).includes(productId)) {
      res.status(400).json({ success: false, message: 'Product already in wishlist' }); return
    }
    wishlist.products.push(productId)
    await wishlist.save()
    await wishlist.populate('products')
    res.json({ success: true, wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id })
    if (!wishlist) { res.status(404).json({ success: false, message: 'Wishlist not found' }); return }
    wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId)
    await wishlist.save()
    res.json({ success: true, message: 'Removed from wishlist', wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
