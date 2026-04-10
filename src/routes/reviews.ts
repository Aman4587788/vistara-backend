import { Router } from 'express'
import { getReviews, addReview } from '../controllers/reviewController'
import { protect } from '../middleware/auth'

const router = Router()

router.get('/:productId', getReviews)
router.post('/:productId', protect, addReview)

export default router
