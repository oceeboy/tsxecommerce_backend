import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateNewOtp {
  @IsNotEmpty()
  @IsString()
  email: string;
}
