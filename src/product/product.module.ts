import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { Cloudinary } from '../cloudinary/cloudinary';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './schemas/product.schema';
import { ProductController } from './product.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Product',
        schema: ProductSchema,
      },
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: [ProductService, Cloudinary],
  controllers: [ProductController],
})
export class ProductModule {}
