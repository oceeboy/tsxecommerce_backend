import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class ReviewDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
