import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserDocument } from './schemas/user..schema';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyOtpDtoMain } from './dto/verify-otp-main.dto';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp-password.dto';
import { GenerateNewOtp } from './dto/generate-otp';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  generateAccessToken(user: UserDocument): string {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESSTOKENEXPIRATION || '5h',
    }); // Access token expires in 5 minutes
  }
  generateRefreshToken(user: UserDocument): string {
    const payload = { sub: user._id };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESHTOKENEXPIRATION,
    }); // Refresh token expires in 7 days
  }

  // User Registration

  async registerUser(
    registerUser: RegisterUserDto,
  ): Promise<{ message: string }> {
    const { email, password, firstName, ...rest } = registerUser;

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 15);

    // Save new user to the database

    //Generatee otp
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // this will be change to using the service of User and all the use of prisima
    const newUser = new this.userModel({
      ...rest,
      email,
      firstName,
      password: hashedPassword,
      otp: otpCode,
      otpExpiration: new Date(Date.now() + 10 * 60 * 1000),
    });

    await newUser.save();

    await this.emailService.SendOtpEmailForToken(email, firstName, otpCode);

    return { message: `Successfully registered` };
  }

  // User Login

  async loginUser(loginUser: LoginUserDto): Promise<{ message: string }> {
    const { email, password } = loginUser;

    // Validate user credentials
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    //Generatee otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;

    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // for 10 mintues

    await user.save();

    await this.emailService.SendOtpEmailForToken(email, user.firstName, otp);

    return { message: `Check email to verify OTP` };
  }

  async validateUser(validateOtp: VerifyOtpDtoMain): Promise<{
    accessToken: string;
    refreshToken: string;
    userDetails: UserDocument;
  }> {
    const { email, otp } = validateOtp;
    const user = await this.userModel.findOne({ email });
    if (!user || user.otp !== otp || new Date() > user.otpExpiration) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    user.otp = undefined;

    user.otpExpiration = undefined;

    await user.save();

    // generate token
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const userDetails = user;

    return { accessToken, refreshToken, userDetails };
  }

  //
  // forget password

  async forgetPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    // this Generates a 6-digit OTP

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await this.emailService.sendOtpToEmailUsingNodeMailer(
      user.email,
      user.firstName,
      otp,
    );

    await user.save();

    return {
      message: 'OTP sent to your email',
    };
  }

  // change password

  async verifyOtpTokenToChangePassword(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string }> {
    const { email, otp, newPassword } = verifyOtpDto;
    const user = await this.userModel.findOne({ email });
    if (!user || user.otp !== otp || new Date() > user.otpExpiration) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    // after get the token is validated the new password is to be hashed
    user.password = await bcrypt.hash(newPassword, 15);

    // after password has been hashed the otp has no use so it needs to be clear of the database

    user.otp = undefined;

    await user.save();

    return {
      message: 'Password updated successfully',
    };
  }

  // generate otp
  async generateOtp(
    generateNewOtp: GenerateNewOtp,
  ): Promise<{ message: string }> {
    const { email } = generateNewOtp;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User is not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await this.emailService.sendOtpToEmailUsingNodeMailer(
      user.email,
      user.firstName,
      otp,
    );

    await user.save();
    return {
      message: 'Password updated successfully',
    };
  }

  // refresh token

  async refreshAccessToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const accessToken = this.generateAccessToken(user);

      return {
        accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async userData(_id: string) {
    const user = await this.userModel.findById(_id);
    return user;
  }
}
