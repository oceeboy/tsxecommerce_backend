import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cloudinary } from './../cloudinary/cloudinary';
import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { NotFoundException } from '@nestjs/common';

const mockProductModel = {
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn().mockImplementation((dto) =>
    Promise.resolve({
      ...dto,
      _id: '123',
    }),
  ),
  deleteMany: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockCloudinary = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  updateImage: jest.fn(),
};

describe('ProductService', () => {
  let productService: ProductService;
  let productModel: Model<ProductDocument>;
  let cloudinary: Cloudinary;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getModelToken('Product'), useValue: mockProductModel },
        { provide: Cloudinary, useValue: mockCloudinary },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get<Model<ProductDocument>>(getModelToken('Product'));
    cloudinary = module.get<Cloudinary>(Cloudinary);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with uploaded images', async () => {
      const createProductDto = {
        productName: 'Test Product',
        productDescription: 'Test Description',
        productPrice: 100,
        productImages: ['ghhgjgj'],
        category: 'Test Category',
        stockQuantity: 10,
        sku: 'TESTSKU123',
      };
      const files = [{ buffer: Buffer.from('test') }] as Express.Multer.File[];

      mockCloudinary.uploadImage.mockResolvedValue({ secure_url: 'image-url' });
      mockProductModel.create.mockResolvedValue({
        ...createProductDto,
        _id: '123',
      });

      const result = await productService.create(createProductDto, files);
      expect(result).toEqual({ message: 'Product added Successfully' });
    });

    it('should throw an error if no images are uploaded', async () => {
      return await expect(
        productService.create(
          {
            productName: 'Test',
            productDescription: '',
            productPrice: 0,
            productImages: [],
            category: '',
            stockQuantity: 0,
            sku: '',
          },
          [],
        ),
      ).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const product = { _id: '123', name: 'Test Product' };
      mockProductModel.findById.mockResolvedValue(product);

      const result = await productService.findOne('123');
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductModel.findById.mockResolvedValue(null);
      await expect(productService.findOne('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and its images', async () => {
      const product = { _id: '123', productImages: ['img1', 'img2'] };
      mockProductModel.findById.mockResolvedValue(product);
      mockProductModel.findByIdAndDelete.mockResolvedValue(product);

      const result = await productService.deleteProduct('123');
      expect(result).toEqual({ message: 'Product deleted successfully' });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductModel.findById.mockResolvedValue(null);
      await expect(productService.deleteProduct('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
