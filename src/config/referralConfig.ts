/**
 * إعدادات نظام الإحالات
 * يمكن تغيير هذه القيم حسب احتياجاتك
 */

export const REFERRAL_CONFIG = {
  // ======== المكافآت ========
  /**
   * المكافأة الأساسية للمُحيل عند تأكيد الإحالة
   * الوحدة: Coins
   */
  REFERRAL_REWARD: 50,

  /**
   * المكافأة الإضافية للإحالات المتعددة
   * بعد 5 إحالات: +10 coins إضافية
   * بعد 10 إحالات: +25 coins إضافية
   * بعد 20 إحالة: +50 coins إضافية
   */
  BONUS_THRESHOLDS: [
    { count: 5, bonus: 10 },
    { count: 10, bonus: 25 },
    { count: 20, bonus: 50 },
  ],

  // ======== شروط المكافأة ========
  /**
   * متى يتم الحصول على المكافأة؟
   * 'signup': عند التسجيل فقط
   * 'email_verified': بعد تأكيد البريد
   * 'kyc_verified': بعد التحقق من الهوية
   * 'first_deposit': بعد الإيداع الأول
   */
  REWARD_CONDITION: 'signup',

  /**
   * عدد الأيام المسموحة لتأكيد الإحالة
   * مثال: إذا كانت 30، يجب تأكيد الإحالة خلال 30 يوم
   */
  CONFIRMATION_DAYS: 30,

  // ======== صيغة الكود ========
  /**
   * طول كود الإحالة
   * الحد الأدنى: 6 أحرف
   * الحد الأقصى: 10 أحرف
   */
  CODE_LENGTH: 6,

  /**
   * هل يتضمن الكود أحرف صغيرة؟
   * true: ABC-abc-123 (أكثر قابلية للقراءة)
   * false: ABC-1X2Y3 (أكثر تمييزاً)
   */
  INCLUDE_LOWERCASE: false,

  // ======== حدود الاستخدام ========
  /**
   * الحد الأقصى من الإحالات في الساعة الواحدة
   * 0 = بدون حد
   */
  MAX_REFERRALS_PER_HOUR: 100,

  /**
   * الحد الأقصى من الإحالات في اليوم الواحد
   * 0 = بدون حد
   */
  MAX_REFERRALS_PER_DAY: 500,

  /**
   * الحد الأقصى من الإحالات لكل مستخدم (كلي)
   * 0 = بدون حد
   */
  MAX_TOTAL_REFERRALS: 0,

  // ======== السلوك ========
  /**
   * هل يمكن لمستخدم واحد أن يُحال أكثر من مرة؟
   */
  ALLOW_MULTIPLE_REFERRALS: false,

  /**
   * هل يمكن لمستخدم واحد أن يُحال من عدة مُحيلين؟
   */
  ALLOW_MULTIPLE_REFERRERS: false,

  /**
   * هل يتم حفظ سجل الإحالات بعد حذف المستخدم؟
   */
  KEEP_REFERRAL_HISTORY_AFTER_DELETE: true,

  // ======== التحليلات والإشعارات ========
  /**
   * هل يتم إرسال إشعارات عند الإحالات الجديدة؟
   */
  SEND_NOTIFICATIONS: true,

  /**
   * هل يتم إرسال رسائل بريد إلكترونية؟
   */
  SEND_EMAILS: true,

  /**
   * تسجيل الإحالات في Logs
   */
  LOG_REFERRALS: true,

  // ======== المسارات والروابط ========
  /**
   * نص رابط الإحالة
   * {code} = كود الإحالة
   * {app_domain} = نطاق التطبيق
   */
  REFERRAL_LINK_TEMPLATE: 'https://twtc-mining.vercel.app/signup?ref={code}',

  /**
   * صفحة التسجيل
   */
  SIGNUP_PAGE: '/signup',

  /**
   * صفحة البروفايل
   */
  PROFILE_PAGE: '/profile',

  // ======== الترجمات (Localization) ========
  MESSAGES: {
    SELF_REFERRAL: 'لا يمكنك إحالة نفسك',
    ALREADY_REFERRED: 'هذا المستخدم مُحال بالفعل',
    INVALID_CODE: 'كود الإحالة غير صحيح',
    REWARD_GRANTED: 'تم منحك مكافأة بنجاح',
    REFERRAL_TRACKED: 'تم تتبع الإحالة بنجاح',
    NO_REFERRALS: 'لا توجد إحالات بعد',
  },
};

/**
 * الحصول على قيمة إعداد معينة
 */
export function getConfig(key: keyof typeof REFERRAL_CONFIG) {
  return REFERRAL_CONFIG[key];
}

/**
 * تحديث إعداد معين (للبيئات المختبرة)
 */
export function updateConfig(key: keyof typeof REFERRAL_CONFIG, value: any) {
  (REFERRAL_CONFIG as any)[key] = value;
}

/**
 * إعادة تعيين الإعدادات للقيم الافتراضية
 */
export function resetConfig() {
  // هذا مثال فقط، يجب إعادة تحميل الملف بالفعل
  console.log('Config will be reset on next app restart');
}

/**
 * التحقق من صحة الإعدادات
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (REFERRAL_CONFIG.REFERRAL_REWARD < 0) {
    errors.push('REFERRAL_REWARD must be greater than or equal to 0');
  }

  if (REFERRAL_CONFIG.CODE_LENGTH < 6 || REFERRAL_CONFIG.CODE_LENGTH > 10) {
    errors.push('CODE_LENGTH must be between 6 and 10');
  }

  if (REFERRAL_CONFIG.CONFIRMATION_DAYS < 1) {
    errors.push('CONFIRMATION_DAYS must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
