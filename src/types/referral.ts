/**
 * أنواع البيانات لنظام الإحالات
 */

export type ReferralStatus = 'pending' | 'confirmed' | 'rewarded';

/**
 * بيانات الإحالة الواحدة
 */
export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: ReferralStatus;
  rewardGiven: boolean;
  createdAt: Date;
  confirmedAt?: Date;
}

/**
 * بيانات المستخدم المُحال (في قائمة الإحالات)
 */
export interface ReferredUser {
  id: string;
  username: string;
  email: string;
  status: ReferralStatus;
  createdAt: Date;
  confirmedAt?: Date;
}

/**
 * إحصائيات الإحالات
 */
export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  confirmedReferrals: number;
  rewardedReferrals: number;
  totalRewardsEarned: number;
  referralsList: ReferredUser[];
}

/**
 * بيانات الإحالات للمستخدم
 */
export interface UserReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  rewardedReferrals: number;
  totalRewardsEarned: number;
}

/**
 * طلب تتبع الإحالة
 */
export interface TrackReferralRequest {
  referralCode: string;
  newUserId: string;
  email?: string;
}

/**
 * رد تتبع الإحالة
 */
export interface TrackReferralResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * طلب معالجة المكافأة
 */
export interface ProcessRewardRequest {
  referralId: string;
}

/**
 * رد معالجة المكافأة
 */
export interface ProcessRewardResponse {
  success: boolean;
  reward?: number;
  message?: string;
  error?: string;
}

/**
 * خيارات نسخ رابط الإحالة
 */
export interface CopyLinkOptions {
  showNotification?: boolean;
  callback?: (success: boolean) => void;
}

/**
 * خيارات مشاركة رابط الإحالة
 */
export interface ShareLinkOptions {
  title?: string;
  text?: string;
  fallbackToCopy?: boolean;
}

/**
 * نتيجة الطلب العام
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * نتيجة التحقق من الإحالة
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  userId?: string;
}

/**
 * نتيجة التحقق من إمكانية الإحالة
 */
export interface CanReferResult {
  can: boolean;
  error?: string;
}

/**
 * إعدادات الإحالات (من referralConfig)
 */
export interface ReferralConfiguration {
  REFERRAL_REWARD: number;
  BONUS_THRESHOLDS: Array<{ count: number; bonus: number }>;
  REWARD_CONDITION: 'signup' | 'email_verified' | 'kyc_verified' | 'first_deposit';
  CONFIRMATION_DAYS: number;
  CODE_LENGTH: number;
  INCLUDE_LOWERCASE: boolean;
  MAX_REFERRALS_PER_HOUR: number;
  MAX_REFERRALS_PER_DAY: number;
  MAX_TOTAL_REFERRALS: number;
  ALLOW_MULTIPLE_REFERRALS: boolean;
  ALLOW_MULTIPLE_REFERRERS: boolean;
  KEEP_REFERRAL_HISTORY_AFTER_DELETE: boolean;
  SEND_NOTIFICATIONS: boolean;
  SEND_EMAILS: boolean;
  LOG_REFERRALS: boolean;
  REFERRAL_LINK_TEMPLATE: string;
  SIGNUP_PAGE: string;
  PROFILE_PAGE: string;
  MESSAGES: Record<string, string>;
}
