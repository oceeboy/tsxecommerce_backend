import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartDocument } from './schemas/cart.schema';

import { ProductDocument } from '../product/schemas/product.schema';

import { UserService } from '../user/user.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel('Cart') private readonly cartModel: Model<CartDocument>,
    @InjectModel('Product')
    private productModel: Model<ProductDocument>,
    private userService: UserService,
  ) {}

  async getCartByUserId(userId: string) {
    return this.cartModel.findOne({ userId }).populate('cartItems.productId');
  }

  // add to cart

  async addToCart(
    userId: string,
    cartItems: { productId: string; quantity: number }[],
  ) {
    const user = await this.userService.validateUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = new this.cartModel({ userId, cartItems: [] });
    }

    for (const item of cartItems) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Get existing quantity in cart for this product
      const existingItem = cart.cartItems.find(
        (cartItem) => cartItem.productId.toString() === item.productId,
      );
      const existingQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = existingQuantity + item.quantity;

      // after adding the new quantity, check if it exceeds the stock quantity
      if (newTotalQuantity > product.stockQuantity) {
        throw new BadRequestException(
          `Only ${product.stockQuantity} items available for ${product.productName}. Requested: ${newTotalQuantity}`,
        );
      }

      if (existingItem) {
        existingItem.quantity = newTotalQuantity;
      } else {
        cart.cartItems.push({
          productId: new this.productModel.base.Types.ObjectId(item.productId),
          quantity: item.quantity,
        });
      }
    }

    await cart.save();
    return cart;
  }
  async removeFromCart(
    userId: string,
    productId: string,
    quantityToRemove?: number,
  ) {
    const user = await this.userService.validateUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (itemIndex === -1)
      throw new NotFoundException('Product not found in cart');

    if (
      quantityToRemove &&
      cart.cartItems[itemIndex].quantity > quantityToRemove
    ) {
      // Reduce quantity instead of removing the item completely
      cart.cartItems[itemIndex].quantity -= quantityToRemove;
    } else {
      // Remove the item completely
      cart.cartItems.splice(itemIndex, 1);
    }

    await cart.save();
    return cart;
  }
}
