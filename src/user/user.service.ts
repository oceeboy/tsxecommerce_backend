import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../auth/schemas/user..schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  async getUserById(userId: string) {
    return await this.userModel.findById(userId).select('-password');
  }

  async validateUserById(userId: string) {
    return await this.userModel.findById(userId);
  }
}
