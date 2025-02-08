import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

class VariantDto {
  @IsString()
  variantName: string;

  @IsNumber()
  @Min(0)
  variantPrice: number;

  @IsNumber()
  @Min(0)
  variantStockQuantity: number;
}

export class CreateProduct {
  @IsString()
  productName: string;

  @IsString()
  productDescription: string;

  @IsNumber()
  @Min(0)
  productPrice: number;

  @IsArray()
  @IsString({ each: true })
  productImages: string[];

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsString()
  sku: string;

  @IsArray()
  @IsOptional()
  variants?: VariantDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;
}
