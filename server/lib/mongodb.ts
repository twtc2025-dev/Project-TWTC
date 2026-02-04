import mongoose from "mongoose";

// User Model
const UserSchema = new mongoose.Schema(
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
      unique: true,
      lowercase: true,
      sparse: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      default: null, // null si inscription via Google OAuth
    },
    isEmailVerified: {
      type: Boolean,
      default: false, // false jusqu'à confirmation
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMined: {
      type: Number,
      default: 0,
      min: 0,
    },
    energy: {
      type: Number,
      default: 1000,
    },
    maxEnergy: {
      type: Number,
      default: 1000,
    },
    clickPower: {
      type: Number,
      default: 1,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    kycStatus: {
      type: String,
      enum: ['Not Started', 'Pending', 'Verified'],
      default: 'Not Started',
    },
    userGroup: {
      type: Number,
      default: 1,
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

// Referral Model
const ReferralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rewarded"],
      default: "pending",
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
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

// Indexes already defined via 'unique: true' in schema fields above
// Removing duplicate indexes to fix Mongoose warnings

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referredUserId: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ createdAt: -1 });

// Add compound index to prevent duplicates
ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

export const User = mongoose.model("User", UserSchema);
export const Referral = mongoose.model("Referral", ReferralSchema);
