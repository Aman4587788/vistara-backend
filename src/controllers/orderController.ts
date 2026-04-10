import { Response } from 'express'
import Order from '../models/Order'
import Cart from '../models/Cart'
import { AuthRequest } from '../middleware/auth'

// GET /api/orders
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 })
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// GET /api/orders/:id
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user!.id })
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return }
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, total, address, razorpay_order_id } = req.body
    if (!items?.length || !total || !address) {
      res.status(400).json({ success: false, message: 'items, total, and address are required' }); return
    }
    const order = await Order.create({
      user: req.user!.id,
      items,
      total,
      address,
      razorpay_order_id: razorpay_order_id || null,
      status: 'pending',
    })
    // Clear the user's cart after placing order
    await Cart.findOneAndUpdate({ user: req.user!.id }, { items: [] })
    res.status(201).json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
