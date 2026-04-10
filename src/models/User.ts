import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar_url?: string
  phone?: string
  role: string
  googleId?: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  loyalty_points: number
  createdAt: Date
  matchPassword(entered: string): Promise<boolean>
  getResetPasswordToken(): string
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar_url: { type: String, default: null },
    phone: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    googleId: { type: String, default: null },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    loyalty_points: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password
UserSchema.methods.matchPassword = async function (entered: string): Promise<boolean> {
  return bcrypt.compare(entered, this.password)
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function (): string {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex')

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Set expire (10 minutes)
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000)

  return resetToken
}

export default mongoose.model<IUser>('User', UserSchema)
