import { Response } from 'express'
import Cart from '../models/Cart'
import { AuthRequest } from '../middleware/auth'

// GET /api/cart
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id }).populate('items.product')
    res.json({ success: true, cart: cart || { items: [] } })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/cart
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body
    if (!productId) { res.status(400).json({ success: false, message: 'productId is required' }); return }

    let cart = await Cart.findOne({ user: req.user!.id })
    if (!cart) cart = await Cart.create({ user: req.user!.id, items: [] })

    const existingIdx = cart.items.findIndex(i => i.product.toString() === productId)
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity })
    }
    await cart.save()
    await cart.populate('items.product')
    res.json({ success: true, cart })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// PUT /api/cart/:productId
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body
    const cart = await Cart.findOne({ user: req.user!.id })
    if (!cart) { res.status(404).json({ success: false, message: 'Cart not found' }); return }

    const idx = cart.items.findIndex(i => i.product.toString() === req.params.productId)
    if (idx === -1) { res.status(404).json({ success: false, message: 'Item not in cart' }); return }

    if (quantity <= 0) {
      cart.items.splice(idx, 1)
    } else {
      cart.items[idx].quantity = quantity
    }
    await cart.save()
    await cart.populate('items.product')
    res.json({ success: true, cart })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// DELETE /api/cart/:productId
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id })
    if (!cart) { res.status(404).json({ success: false, message: 'Cart not found' }); return }
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId)
    await cart.save()
    res.json({ success: true, message: 'Item removed', cart })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// DELETE /api/cart
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Cart.findOneAndUpdate({ user: req.user!.id }, { items: [] })
    res.json({ success: true, message: 'Cart cleared' })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
