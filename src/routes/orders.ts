import { Router } from 'express'
import { getOrders, getOrderById, createOrder } from '../controllers/orderController'
import { protect } from '../middleware/auth'

const router = Router()

router.use(protect)
router.get('/', getOrders)
router.post('/', createOrder)
router.get('/:id', getOrderById)

export default router
