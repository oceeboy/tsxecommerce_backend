import { forwardRef, Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from './schemas/cart.schema';
import { ProductModule } from '../product/product.module';
import ProductSchema from '../product/schemas/product.schema';
import { AuthModule } from '../auth/auth.module';

import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Cart', schema: CartSchema },
      {
        name: 'Product',
        schema: ProductSchema,
      },
    ]),
    forwardRef(() => ProductModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
