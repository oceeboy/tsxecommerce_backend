import { Document, Schema, Types } from 'mongoose';

export class CartDocument extends Document {
  userId: Types.ObjectId;
  cartItems: { productId: Types.ObjectId; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export const CartSchema = new Schema<CartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cartItems: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true },
);
