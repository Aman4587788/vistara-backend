import { Router } from 'express'
import { getProfile, updateProfile, addLoyaltyPoints } from '../controllers/profileController'
import { protect } from '../middleware/auth'

const router = Router()

router.use(protect)
router.get('/', getProfile)
router.put('/', updateProfile)
router.post('/points', addLoyaltyPoints)

export default router
