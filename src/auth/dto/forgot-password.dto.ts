import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
