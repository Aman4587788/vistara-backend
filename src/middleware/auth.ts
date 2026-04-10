import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export interface AuthRequest extends Request {
  user?: { id: string; name: string; email: string; role: string }
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorised — no token' })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' })
      return
    }
    req.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired' })
  }
}

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      })
      return
    }
    next()
  }
}
