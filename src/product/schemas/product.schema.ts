import { Schema, Types } from 'mongoose';

export interface Review {
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Variant {
  variantName: string;
  variantPrice: number;
  variantStockQuantity: number;
}

export interface ProductDocument extends Document {
  productName: string;
  productDescription: string;
  productPrice: number;
  productImages: string[];
  category: string;
  stockQuantity: number;
  sku: string;
  variants: Variant[];
  tags: string[];
  ratings: number; // Average product rating
  reviews: Review[];
  isOnSale: boolean;
  salePrice?: number; // Optional, only if on sale
  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = new Schema<ProductDocument>(
  {
    productName: { type: String, required: true },
    productDescription: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImages: { type: [String], required: true },
    category: { type: String, required: true },
    stockQuantity: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    variants: [
      {
        variantName: { type: String, required: true },
        variantPrice: { type: Number, required: true },
        variantStockQuantity: { type: Number, required: true },
      },
    ],
    tags: { type: [String], default: [] },
    ratings: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isOnSale: { type: Boolean, default: false },
    salePrice: { type: Number },
  },
  {
    timestamps: true,
  },
);

export default ProductSchema;
