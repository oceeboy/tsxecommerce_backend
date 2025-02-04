import { IsEmail, IsEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmpty()
  @IsEmail()
  email: string;

  @IsEmpty()
  @IsString()
  password: string;
}
