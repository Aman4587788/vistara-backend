import mongoose, { Schema, Document } from 'mongoose'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface IOrderItem {
  product: any
  name: string
  emoji: string
  image?: string
  price: number
  quantity: number
}

export interface IShippingAddress {
  full_name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId
  items: IOrderItem[]
  total: number
  status: OrderStatus
  razorpay_order_id?: string
  razorpay_payment_id?: string
  address: IShippingAddress
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.Mixed, ref: 'Product', required: true },
        name: String,
        emoji: String,
        image: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    razorpay_order_id: { type: String, default: null },
    razorpay_payment_id: { type: String, default: null },
    address: {
      full_name: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
  },
  { timestamps: true }
)

export default mongoose.model<IOrder>('Order', OrderSchema)
