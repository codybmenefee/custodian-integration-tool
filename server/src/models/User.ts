import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { User as IUser, UserRole } from 'shared/src/types';

// Extended interface for Mongoose Document
export interface UserDocument extends Omit<IUser, 'id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  const user = this as UserDocument;
  
  // Only hash the password if it has been modified or is new
  if (!user.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, salt);
    // Replace plain text password with hashed password
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Create and export User model
export const User = mongoose.model<UserDocument>('User', userSchema); 