import crypto from "crypto";
import { User, Referral } from "../lib/mongodb.js";

const REFERRAL_CODE_LENGTH = 6;
const REFERRAL_REWARD = 50;

/**
 * Generate a unique referral code for a user
 * Format: ABC-1X2Y3 (3 letters + 3 alphanumeric)
 */
export function generateReferralCode(userId: string | number): string {
  const buf = crypto.createHash("sha256").update(`${userId}-${Date.now()}`).digest();

  // First 3 bytes -> letters A-Z
  const letters = Array.from({ length: 3 }, (_, i) => {
    return String.fromCharCode(65 + (buf[i] % 26));
  }).join("");

  // Next 6 bytes -> alphanumeric (0-9,A-Z) using base36
  const numbers = Array.from({ length: 6 }, (_, i) => {
    return (buf[3 + i] % 36).toString(36).toUpperCase();
  }).join("");

  return `${letters}-${numbers}`;
}

/**
 * Validate referral code format and existence
 */
export function validateReferralCode(code: string): { valid: boolean; error?: string; userId?: number } {
  if (!code || typeof code !== "string") {
    return { valid: false, error: "Invalid referral code format" };
  }

  const codeRegex = /^[A-Z]{3}-[A-Z0-9]{6}$/;
  if (!codeRegex.test(code)) {
    return { valid: false, error: "Referral code format is invalid" };
  }

  // في الواقع ستحتاج للبحث عن الكود في قاعدة البيانات
  // هذا مثال توضيحي
  return { valid: true };
}

/**
 * Check if a user can be referred by another user
 * يمنع:
 * 1. Self-referral
 * 2. Double referral
 */
export function canBeReferred(
  referrerId: number,
  referredUserId: number,
  existingReferrals: any[] = []
): { can: boolean; error?: string } {
  // منع إحالة النفس
  if (referrerId === referredUserId) {
    return { can: false, error: "Cannot refer yourself" };
  }

  // منع تكرار الإحالة
  const alreadyReferred = existingReferrals.some(
    (ref) => ref.referrerId === referrerId && ref.referredUserId === referredUserId
  );
  
  if (alreadyReferred) {
    return { can: false, error: "This user is already referred by you" };
  }

  return { can: true };
}

/**
 * Process referral reward
 * التحقق من شروط المكافأة وتطبيقها
 */
export async function processReferralReward(
  referrerId: number,
  referralId: number
): Promise<{ success: boolean; error?: string; reward?: number }> {
  try {
    // يجب التحقق من:
    // 1. أن الإحالة موجودة وصحيحة
    // 2. أن المستخدم المُحال لم يحصل على مكافأة مسبقاً
    // 3. أن شرط المكافأة تحقق (التحقق من البريد / الدفع / وما إلى ذلك)

    // هذا مثال توضيحي
    return {
      success: true,
      reward: REFERRAL_REWARD,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to process reward",
    };
  }
}

/**
 * Get user referral statistics
 */
export async function getUserReferralStats(userId: number) {
  try {
    // جلب بيانات الإحالات من قاعدة البيانات
    return {
      totalReferrals: 0,
      pendingReferrals: 0,
      confirmedReferrals: 0,
      rewardedReferrals: 0,
      totalRewardsEarned: 0,
      referralsList: [],
    };
  } catch (error) {
    throw new Error("Failed to fetch referral stats");
  }
}
