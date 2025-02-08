import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class Cloudinary {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload Image to Cloudinary
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'product' }, (error, result) => {
          if (error) {
            return reject(
              new Error(`Cloudinary Upload Failed: ${error.message}`),
            );
          }
          resolve(result as UploadApiResponse);
        })
        .end(file.buffer);
    });
  }

  /**
   * Delete Image from Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<{ message: string }> {
    try {
      const publicId = imageUrl.split('/').pop()?.split('.')[0]; // Extract public_id
      if (!publicId) throw new Error('Invalid image URL');

      await cloudinary.uploader.destroy(`product/${publicId}`);
      return { message: 'Image deleted successfully' };
    } catch (error) {
      throw new Error(`Cloudinary Delete Failed: ${error.message}`);
    }
  }

  /**
   * Update Image on Cloudinary (Delete Old & Upload New)
   */
  async updateImage(
    oldImageUrl: string,
    newFile: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    try {
      // Delete the old image first
      await this.deleteImage(oldImageUrl);

      // Upload the new image
      return await this.uploadImage(newFile);
    } catch (error) {
      throw new Error(`Cloudinary Update Failed: ${error.message}`);
    }
  }
}
