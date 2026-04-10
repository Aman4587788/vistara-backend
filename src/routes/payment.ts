import { Router } from 'express'
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController'
import { protect } from '../middleware/auth'

const router = Router()

router.use(protect)
router.post('/create-order', createRazorpayOrder)
router.post('/verify', verifyPayment)

export default router
