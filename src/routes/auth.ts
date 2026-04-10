import { Router } from 'express'
import { register, login, getMe, forgotPassword, resetPassword, googleLogin } from '../controllers/authController'
import { protect } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/google', googleLogin)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)
router.get('/me', protect, getMe)

export default router
