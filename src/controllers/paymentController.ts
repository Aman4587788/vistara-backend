import { Response } from 'express'
import crypto from 'crypto'
import Order from '../models/Order'
import { AuthRequest } from '../middleware/auth'

// POST /api/payment/create-order
export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id_here') {
      res.status(503).json({ success: false, message: 'Payment gateway not configured' })
      return
    }
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
    const { amount } = req.body
    if (!amount) { res.status(400).json({ success: false, message: 'amount is required' }); return }
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `vc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    })
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/payment/verify
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

    const hmac = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (hmac !== razorpay_signature) {
      res.status(400).json({ success: false, message: 'Payment signature mismatch — possible fraud' }); return
    }

    // Mark order as processing
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        razorpay_payment_id,
        status: 'processing',
      })
    }

    res.json({ success: true, message: 'Payment verified successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
