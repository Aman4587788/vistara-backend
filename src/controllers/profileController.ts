import { Response } from 'express'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'

// GET /api/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password')
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.json({ success: true, profile: user })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// PUT /api/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, avatar_url } = req.body
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { ...(name && { name }), ...(phone && { phone }), ...(avatar_url && { avatar_url }) },
      { new: true, runValidators: true }
    ).select('-password')
    res.json({ success: true, profile: user })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/profile/points  — add loyalty points
export const addLoyaltyPoints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { points } = req.body
    if (!points || typeof points !== 'number') {
      res.status(400).json({ success: false, message: 'points must be a number' }); return
    }
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $inc: { loyalty_points: points } },
      { new: true }
    ).select('-password')
    res.json({ success: true, loyalty_points: user?.loyalty_points })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
