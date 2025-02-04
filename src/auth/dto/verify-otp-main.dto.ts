import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDtoMain {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
