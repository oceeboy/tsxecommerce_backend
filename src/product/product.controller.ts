import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProduct } from './dto/create-product.dto';
import { ReviewDto } from './dto/review-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductDocument } from './schemas/product.schema';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('product')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /** 📌 Create a new product */
  @Post()
  @UseInterceptors(FilesInterceptor('productImages', 5)) // Max 5 images
  async create(
    @Body() createProduct: CreateProduct,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.create(createProduct, files);
  }

  /** 📌 Get all products with optional filters */
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    const data: ProductDocument[] = await this.productService.findAll(
      category,
      minPrice,
      maxPrice,
    );

    return data;
  }

  /** 📌 Get a single product by ID */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  /** 📌 Update product details (with optional image updates) */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('productImages', 5))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProduct>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productService.update(id, updateProductDto, files);
  }

  /** 📌 Delete a product */
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  /** 📌 Delete multiple products */
  @Post('bulk-delete')
  async deleteMultiple(@Body('productIds') productIds: string[]) {
    return this.productService.deleteProducts(productIds);
  }

  // 🔹 **Image Management** 🔹

  /** 📌 Delete a specific image from a product */
  @Delete(':id/image')
  async deleteImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.productService.deleteImage(id, imageUrl);
  }

  // 🔹 **Stock & Variants Management** 🔹

  /** 📌 Update stock quantity */
  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productService.updateStock(id, quantity);
  }

  /** 📌 Update product variants */
  @Patch(':id/variants')
  async updateVariants(
    @Param('id') id: string,
    @Body('variants')
    variants: Array<{
      variantName: string;
      variantPrice: number;
      variantStockQuantity: number;
    }>,
  ) {
    return this.productService.updateVariants(id, variants);
  }

  // 🔹 **Reviews & Ratings** 🔹

  /** 📌 Add a review for a product */
  @Post(':id/review')
  async addReview(
    @Param('id') productId: string,
    @Body() reviewDto: ReviewDto,
  ) {
    return this.productService.addReview(
      productId,
      reviewDto.userId,
      reviewDto.rating,
      reviewDto.comment,
    );
  }

  /** 📌 Delete a review by user */
  @Delete(':id/review/:userId')
  async deleteReview(
    @Param('id') productId: string,
    @Param('userId') userId: string,
  ) {
    return this.productService.deleteReview(productId, userId);
  }

  /** 📌 Get all reviews for a product */
  @Get(':id/reviews')
  async getReviews(@Param('id') productId: string) {
    return this.productService.getReviews(productId);
  }

  /** 📌 Get the average rating of a product */
  @Get(':id/average-rating')
  async getAverageRating(@Param('id') productId: string) {
    return this.productService.getAverageRating(productId);
  }
}
