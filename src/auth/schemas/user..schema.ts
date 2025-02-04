import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '../../common/constants/role.enum';

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role: Role;
  otp?: string;
  otpExpiration?: Date;
}

export const UserSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.User }, // Default role is user
    otp: { type: String },
    otpExpiration: { type: Date },
  },
  {
    timestamps: true,
  },
);

const User =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;
