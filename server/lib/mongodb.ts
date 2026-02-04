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
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Create indexes
UserSchema.index({ referralCode: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ username: 1 });

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referredUserId: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ createdAt: -1 });

// Add compound index to prevent duplicates
ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

export const User = mongoose.model("User", UserSchema);
export const Referral = mongoose.model("Referral", ReferralSchema);
