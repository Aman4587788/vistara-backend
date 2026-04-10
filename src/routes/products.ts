import { Router } from 'express'
import { getProducts, getProductById, seedProducts } from '../controllers/productController'

const router = Router()

router.get('/', getProducts)
router.post('/seed', seedProducts)
router.get('/:id', getProductById)

export default router
