import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user..schema';
import { EmailModule } from 'src/email/email.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({
      secret:
        process.env.JWT_SECRETKEY ||
        '3e3e60e4e72dc2cd29a94a87a03e7e808f2d662c071251846a725498fa5b19d4c5b51174bfb5545b4761dff4c9611da50d8174b618b51e6ecaac4a38cb19feac',
      signOptions: { expiresIn: '3h' },
    }),
    forwardRef(() => EmailModule),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
