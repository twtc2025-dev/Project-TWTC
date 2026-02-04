import mongoose, { Schema, Document } from 'mongoose';

// User Document Interface
export interface IUser extends Document {
  username: string;
  email: string;
  coins: number;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Referral Document Interface
export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'rewarded';
  rewardGiven: boolean;
  createdAt: Date;
  confirmedAt?: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: /^[A-Z]{3}-[A-Z0-9]{6}$/,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Referral Schema
const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rewarded'],
      default: 'pending',
    },
    rewardGiven: {
      type: Boolean,
      default: false,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: false,
    },
  }
);

// Create indexes for better query performance
UserSchema.index({ referralCode: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referredUserId: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ createdAt: -1 });

// Export Models
export const User = mongoose.model<IUser>('User', UserSchema);
export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);

export default { User, Referral };
