import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyOtpDtoMain } from './dto/verify-otp-main.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp-password.dto';
import { GenerateNewOtp } from './dto/generate-otp';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'To register a user' })
  @ApiBody({
    description: 'User details to register',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  // this is for the login
  @Post('login')
  @ApiOperation({ summary: 'To login User' })
  @ApiBody({
    description: 'User details to Login',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'user successfully logged in',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Post('validate-user')
  @ApiOperation({ summary: 'Validate User' })
  @ApiBody({
    description: 'Validate User',
    schema: {
      type: 'object',
      properties: {
        otp: { type: 'string' },
        email: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'user successfully logged in',
    schema: {
      type: 'object',
      properties: {
        userDetails: { type: Object() },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async validateUser(@Body() vavlidateUser: VerifyOtpDtoMain) {
    return this.authService.validateUser(vavlidateUser);
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgetPassword(forgotPasswordDto);
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'Change Password',
  })
  @ApiBody({
    description: 'Change Password',
    schema: {
      type: 'object',
      properties: {
        otp: { type: 'string' },
        email: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async changePassword(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtpTokenToChangePassword(verifyOtpDto);
  }

  @Post('generate-otp')
  @ApiOperation({
    summary: 'Generate new OTP',
  })
  @ApiBody({
    description: 'Generate new OTP',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Generate OTP successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async generateOtp(@Body() generateNewOtp: GenerateNewOtp) {
    return await this.authService.generateOtp(generateNewOtp);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Generate new accessToken',
  })
  @ApiBody({
    description: 'Generate new accessToken',
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Generate new accessToken successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshAccessToken(refreshTokenDto);
  }
}
