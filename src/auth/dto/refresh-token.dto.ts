import { IsEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsEmpty()
  @IsString()
  refreshToken: string;
}
