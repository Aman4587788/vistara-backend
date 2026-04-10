import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import sendEmail from '../utils/sendEmail'
import User from '../models/User'

const generateToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions)

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email and password' })
      return
    }
    const exists = await User.findOne({ email })
    if (exists) {
      res.status(400).json({ success: false, message: 'Email already registered' })
      return
    }
    const user = await User.create({ name, email, password })
    res.status(201).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: { id: user._id, name: user.name, email: user.email, loyalty_points: user.loyalty_points },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' })
      return
    }
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }
    res.json({
      success: true,
      token: generateToken(user._id.toString()),
      user: { id: user._id, name: user.name, email: user.email, loyalty_points: user.loyalty_points },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// GET /api/auth/me
export const getMe = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password')
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// POST /api/auth/forgotpassword
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      res.status(404).json({ success: false, message: 'There is no user with that email' })
      return
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save()

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      })
      res.status(200).json({ success: true, message: 'Email sent' })
    } catch (err) {
      console.log(err)
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save({ validateBeforeSave: false })
      res.status(500).json({ success: false, message: 'Email could not be sent' })
    }
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

// PUT /api/auth/resetpassword/:resettoken
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid token' })
      return
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.status(200).json({
      success: true,
      token: generateToken(user._id.toString()),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id')

// POST /api/auth/google
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body
    let email, name, googleId

    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      if (!payload || !payload.email) {
        res.status(400).json({ success: false, message: 'Invalid Google token' })
        return
      }
      email = payload.email
      name = payload.name || 'Google User'
      googleId = payload.sub
    } else {
      // Dummy check for frontend dev testing without G Client ID
      if (idToken === 'dummy_token') {
        email = 'dummy@google.com'
        name = 'Dummy Google User'
        googleId = 'google_123'
      } else {
        res.status(400).json({ success: false, message: 'No Google Client ID configured' })
        return
      }
    }

    let user = await User.findOne({ email })

    // Link account if user already exists
    if (user && !user.googleId) {
      user.googleId = googleId
      await user.save()
    }

    // Register Google User if they don't exist
    if (!user) {
      const randomPassword = crypto.randomBytes(20).toString('hex')
      user = await User.create({
        name,
        email,
        password: randomPassword,
        googleId,
      })
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, loyalty_points: user.loyalty_points },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
}
