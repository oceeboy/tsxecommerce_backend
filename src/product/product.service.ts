import { CreateProduct } from './dto/create-product.dto';
import { Cloudinary } from './../cloudinary/cloudinary';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDocument } from './schemas/product.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private productModel: Model<ProductDocument>,
    private cloudinary: Cloudinary,
  ) {}

  // healper

  generateSku(productName: string): string {
    const timestamp = Date.now().toString().slice(-5); // Get last 5 digits of timestamp
    const namePart = productName.replace(/\s+/g, '-').toUpperCase().slice(0, 5); // First 5 letters
    return `${namePart}-${timestamp}`;
  }

  // create a product

  async create(createProduct: CreateProduct, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('No images uploaded');
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        try {
          const uploadResult = await this.cloudinary.uploadImage(file);

          return uploadResult.secure_url;
        } catch (error) {
          console.error('Image upload failed:', error.message);
          return null;
        }
      }),
    ).then((results) => results.filter((img) => img !== null));

    const product = new this.productModel({
      ...createProduct,
      sku: this.generateSku(createProduct.productName),
      productImages: uploadedImages,
    });
    await product.save();
    return { message: 'Product added Successfully' };
  }

  /**  update */

  async update(
    productId: string,
    updateProductDto: Partial<CreateProduct>, // Accepts partial update
    files?: Express.Multer.File[], // Optional new images
  ): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Update images if new files are provided
    if (files?.length) {
      // Delete old images
      await Promise.all(
        product.productImages.map((imgUrl) =>
          this.cloudinary.deleteImage(imgUrl),
        ),
      );

      // Upload new images
      product.productImages = await Promise.all(
        files.map(
          async (file) => (await this.cloudinary.uploadImage(file)).secure_url,
        ),
      );
    }

    // Merge updates and save
    Object.assign(product, updateProductDto);
    await product.save();

    return { message: 'Product updated successfully' };
  }

  /** delet image */

  async deleteImage(
    productId: string,
    imageUrl: string,
  ): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    await this.cloudinary.deleteImage(imageUrl);

    product.productImages = product.productImages.filter(
      (img) => img !== imageUrl,
    );
    await product.save();

    return { message: 'Image deleted successfully' };
  }

  /** update image */
  async updateImage(
    productId: string,
    oldImageUrl: string,
    newFile: Express.Multer.File,
  ): Promise<{ newImageUrl: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const uploadResult = await this.cloudinary.updateImage(
      oldImageUrl,
      newFile,
    );

    // Replace the old image URL in the productImages array
    product.productImages = product.productImages.map((img) =>
      img === oldImageUrl ? uploadResult.secure_url : img,
    );

    await product.save();

    return { newImageUrl: uploadResult.secure_url };
  }
  // dele
  async deleteProduct(productId: string): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete images from Cloudinary
    await Promise.all(
      product.productImages.map((imgUrl: string) =>
        this.cloudinary.deleteImage(imgUrl),
      ),
    );

    // Delete the product from the database
    await this.productModel.findByIdAndDelete(productId);

    return { message: 'Product deleted successfully' };
  }

  // deletemany

  async deleteProducts(productIds: string[]): Promise<{ message: string }> {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestException('No product IDs provided for deletion');
    }

    // Find products
    const products = await this.productModel.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      throw new NotFoundException('No matching products found');
    }

    // Delete images from Cloudinary
    await Promise.all(
      products.flatMap((product) =>
        product.productImages.map((imgUrl: string) =>
          this.cloudinary.deleteImage(imgUrl),
        ),
      ),
    );

    // Delete products from MongoDB
    await this.productModel.deleteMany({ _id: { $in: productIds } });

    return { message: `${products.length} products deleted successfully` };
  }
  /** Get all products with optional filters */
  async findAll(category?: string, minPrice?: number, maxPrice?: number) {
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.productPrice = {};
      if (minPrice) filter.productPrice.$gte = minPrice;
      if (maxPrice) filter.productPrice.$lte = maxPrice;
    }

    return this.productModel.find(filter).exec();
  }

  /** Get product by ID */
  async findOne(productId: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /** Update stock quantity after a purchase */
  async updateStock(
    productId: string,
    quantity: number,
  ): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    if (product.stockQuantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    // Decrease the stock
    product.stockQuantity -= quantity;
    await product.save();

    return { message: 'Stock updated successfully' };
  }

  /** Add or update variants for a product */
  async updateVariants(
    productId: string,
    variants: Array<{
      variantName: string;
      variantPrice: number;
      variantStockQuantity: number;
    }>,
  ): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Set the variants to the new values
    product.variants = variants;
    await product.save();

    return { message: 'Variants updated successfully' };
  }

  /** add review */

  async addReview(
    productId: string,
    userId: string,
    rating: number,
    comment: string,
  ): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Check if the user has already reviewed the product
    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === userId,
    );
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Add the review
    product.reviews.push({
      userId: new Types.ObjectId(userId),
      rating,
      comment,
      createdAt: new Date(),
    });
    await product.save();

    return { message: 'Review added successfully' };
  }

  /** delete a review */

  async deleteReview(
    productId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Filter out the user's review
    const newReviews = product.reviews.filter(
      (review) => review.userId.toString() !== userId,
    );

    // If no review was removed, return an error
    if (newReviews.length === product.reviews.length) {
      throw new NotFoundException('Review not found');
    }

    product.reviews = newReviews;
    await product.save();

    return { message: 'Review deleted successfully' };
  }

  /** Fetch All Reviews for a Product  */
  async getReviews(productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    return product.reviews;
  }

  /** Get Average Rating  */

  async getAverageRating(productId: string): Promise<number> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const totalReviews = product.reviews.length;
    if (totalReviews === 0) return 0; // No reviews yet

    const sumRatings = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    return sumRatings / totalReviews; // Return the average rating
  }
}
