import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/cart.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.sub;
    return this.cartService.addToCart(userId, addToCartDto.cartItems);
  }

  @Get()
  getCart(@Request() req) {
    const userId = req.user.sub;
    return this.cartService.getCartByUserId(userId);
  }

  @Delete(':productId')
  removeFromCart(
    @Request() req,
    @Param('productId') productId: string,
    @Body('quantity') quantity?: number, // Optional: If provided, only reduce quantity
  ) {
    const userId = req.user.sub;
    return this.cartService.removeFromCart(userId, productId, quantity);
  }
}
