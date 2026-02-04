# نظام الإحالات (Referral System) - دليل البدء السريع

## 📚 المحتويات

- [نظرة عامة](#نظرة-عامة)
- [المميزات](#المميزات)
- [البدء السريع](#البدء-السريع)
- [المكونات الرئيسية](#المكونات-الرئيسية)
- [أمثلة الاستخدام](#أمثلة-الاستخدام)
- [الأمان](#الأمان)
- [التخصيص](#التخصيص)

---

## 🎯 نظرة عامة

نظام إحالات متكامل يسمح للمستخدمين بدعوة أصدقاء وتحقيق مكافآت عند تسجيلهم في التطبيق.

### الفوائد:
- 📈 نمو عضوي للقاعدة
- 🎁 مكافآت فورية
- 🔗 رابط مشاركة سهل
- 📊 إحصائيات مفصلة

---

## ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| **Unique Codes** | كود فريد لكل مستخدم (مثال: ABC-1X2Y3) |
| **Shareable Links** | رابط آمن يمكن مشاركته |
| **Copy & Share** | أزرار نسخ ومشاركة سريعة |
| **Status Tracking** | تتبع حالة الإحالات (pending/confirmed/rewarded) |
| **Real-time Stats** | إحصائيات فورية للإحالات والمكافآت |
| **Fraud Prevention** | حماية من الإحالات المكررة والاحتيال |
| **Responsive UI** | واجهة تفاعلية وجميلة |

---

## 🚀 البدء السريع

### 1. التثبيت

```bash
# لا يوجد تثبيت إضافي مطلوب
# النظام متكامل مع المشروع بالفعل
```

### 2. التفعيل في صفحة البروفايل

```tsx
import { ReferralSection } from './components/referral-section';

export function ProfilePage() {
  return (
    <div>
      <h1>My Profile</h1>
      <ReferralSection stats={referralStats} isLoading={loading} />
    </div>
  );
}
```

### 3. معالجة الإحالات عند التسجيل

```typescript
import { handleSignUpWithReferral } from './utils/referralIntegration';

// عند نجاح التسجيل
const newUser = await registerUser(formData);
await handleSignUpWithReferral(newUser.id, newUser.email);
```

### 4. إنشاء جداول قاعدة البيانات

```sql
-- Table 1: تحديث جدول users
ALTER TABLE users ADD COLUMN referral_code VARCHAR(10) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by INTEGER;

-- Table 2: إنشاء جدول referrals
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_user_id) REFERENCES users(id)
);

-- Index for better performance
CREATE INDEX idx_referral_referrer ON referrals(referrer_id);
CREATE INDEX idx_referral_referred_user ON referrals(referred_user_id);
```

---

## 🧩 المكونات الرئيسية

### 1. **ReferralSection Component**

المكون الرئيسي للواجهة:

```tsx
<ReferralSection 
  stats={{
    referralCode: "ABC-1X2Y3",
    referralLink: "https://...",
    totalReferrals: 5,
    activeReferrals: 3,
    rewardedReferrals: 2,
    totalRewardsEarned: 100
  }}
  isLoading={false}
/>
```

### 2. **referralService.ts**

خدمات الإحالات الأساسية:

```typescript
// جلب البيانات
const data = await getReferralData();

// جلب الإحصائيات
const stats = await getReferralStats();

// تتبع إحالة
await trackReferral('ABC-1X2Y3', 'user123');

// معالجة المكافأة
await processReferralReward('referral-id');

// استخراج الكود من URL
const code = getReferralCodeFromURL();
```

### 3. **API Routes**

```typescript
GET    /api/referral/me         // بيانات الإحالات الشخصية
GET    /api/referral/stats      // الإحصائيات
POST   /api/referral/track      // تتبع إحالة
POST   /api/referral/reward     // معالجة المكافأة
```

### 4. **Backend Service**

```typescript
generateReferralCode()    // توليد كود
validateReferralCode()    // التحقق من الكود
canBeReferred()           // التحقق من إمكانية الإحالة
processReferralReward()   // منح المكافأة
```

---

## 💡 أمثلة الاستخدام

### مثال 1: عرض الإحالات في البروفايل

```tsx
import { useState, useEffect } from 'react';
import { ReferralSection } from './components/referral-section';
import { getReferralData } from './services/referralService';

export function UserProfile() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getReferralData();
    setStats(data);
    setLoading(false);
  };

  return <ReferralSection stats={stats} isLoading={loading} />;
}
```

### مثال 2: التعامل مع الإحالات عند التسجيل

```tsx
import { handleSignUpWithReferral, getReferralCodeFromURL } from './utils/referralIntegration';

export function SignupForm() {
  const handleSubmit = async (email, password) => {
    // 1. تسجيل المستخدم
    const user = await registerUser({ email, password });

    // 2. معالجة الإحالة
    const result = await handleSignUpWithReferral(user.id, user.email);

    if (result.referralTracked) {
      toast.success('You joined via a referral link!');
    }

    // 3. التوجيه للصفحة الرئيسية
    navigate('/');
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(email, password);
    }}>
      {/* form fields */}
    </form>
  );
}
```

### مثال 3: نسخ ومشاركة الرابط

```tsx
import { copyReferralLink, shareReferralLink } from './services/referralService';
import { Button } from './components/ui/button';
import { Copy, Share2 } from 'lucide-react';

export function ReferralButtons({ link }) {
  const handleCopy = async () => {
    const success = await copyReferralLink(link);
    if (success) {
      toast.success('Link copied!');
    }
  };

  const handleShare = async () => {
    const success = await shareReferralLink(
      'Join TWTC Mining',
      'Start mining with my link!',
      link
    );
    if (success) {
      toast.success('Link shared!');
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleCopy}>
        <Copy className="w-4 h-4" /> Copy
      </Button>
      <Button onClick={handleShare}>
        <Share2 className="w-4 h-4" /> Share
      </Button>
    </div>
  );
}
```

---

## 🔒 الأمان

### قواعس الحماية المضمنة:

```typescript
// 1. منع إحالة النفس
if (referrerId === referredUserId) {
  throw new Error('Cannot refer yourself');
}

// 2. منع الإحالات المكررة
const exists = await db.query(
  'SELECT * FROM referrals WHERE referrer_id = ? AND referred_user_id = ?',
  [referrerId, referredUserId]
);
if (exists.length > 0) {
  throw new Error('Already referred');
}

// 3. منع المكافآت المتكررة
if (referral.reward_given) {
  throw new Error('Reward already given');
}

// 4. مصادقة اجبارية
router.post('/reward', isAuthenticated, async (req, res) => {
  // معالجة الطلب
});

// 5. Rate limiting (يمكن إضافتها)
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

---

## ⚙️ التخصيص

### تغيير المكافأة

```typescript
// src/config/referralConfig.ts
export const REFERRAL_CONFIG = {
  REFERRAL_REWARD: 100, // تغيير من 50 إلى 100
};
```

### تغيير صيغة الكود

```typescript
// src/config/referralConfig.ts
export const REFERRAL_CONFIG = {
  CODE_LENGTH: 8, // جعل الكود أطول
  INCLUDE_LOWERCASE: true, // إضافة حروف صغيرة
};
```

### تغيير رابط الإحالة

```typescript
// src/config/referralConfig.ts
export const REFERRAL_CONFIG = {
  REFERRAL_LINK_TEMPLATE: 'https://yourdomain.com/join?code={code}',
};
```

### إضافة المكافآت الإضافية

```typescript
// src/config/referralConfig.ts
export const REFERRAL_CONFIG = {
  BONUS_THRESHOLDS: [
    { count: 5, bonus: 10 },
    { count: 10, bonus: 25 },
    { count: 20, bonus: 50 },
    { count: 50, bonus: 100 }, // إضافة عتبة جديدة
  ],
};
```

---

## 🔄 التكامل مع Google OAuth

النظام متكامل مع Google OAuth ويحفظ كود الإحالة في الـ session:

```typescript
// api/routes/auth.ts
router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const referralCode = req.query.ref;
    
    // حفظ في session
    if (referralCode && req.session) {
      req.session.referralCode = referralCode;
    }

    // التوجيه مع الكود
    if (referralCode) {
      res.redirect(`/?ref=${encodeURIComponent(referralCode)}`);
    }
  }
);
```

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm run test referralSystem

# مثال على اختبار توليد الكود
describe('generateReferralCode', () => {
  it('should generate valid code', () => {
    const code = generateReferralCode(1);
    expect(code).toMatch(/^[A-Z]{3}-[A-Z0-9]{6}$/);
  });
});
```

---

## 📊 الميتاداتا والتحليلات

يمكن تتبع:
- ✅ عدد الإحالات الكلي
- ✅ عدد الإحالات الفعالة
- ✅ المكافآت الممنوحة
- ✅ معدل التحويل
- ✅ أفضل المُحيلين

---

## 🐛 استكشاف الأخطاء

### المشكلة: الرابط لا يعمل

```typescript
// تحقق من قائمة CORS
app.use(cors({ 
  origin: "https://yourdomain.vercel.app", 
  credentials: true 
}));
```

### المشكلة: الكود غير صحيح

```typescript
// تحقق من صيغة الكود
const codeRegex = /^[A-Z]{3}-[A-Z0-9]{6}$/;
if (!codeRegex.test(code)) {
  throw new Error('Invalid format');
}
```

### المشكلة: المكافآت لا تُمنح

```typescript
// تحقق من شروط المكافأة في referralConfig
// وتأكد من تحديث reward_given في قاعدة البيانات
```

---

## 📞 الدعم

للمزيد من المعلومات:
- 📄 اقرأ [REFERRAL_SYSTEM.md](./REFERRAL_SYSTEM.md)
- 🔧 اطلع على [referralConfig.ts](./src/config/referralConfig.ts)
- 🧪 شاهد [referralSystem.test.ts](./tests/referralSystem.test.ts)

---

## 📝 الملاحظات

- النظام قابل للتوسع لدعم Web3 مستقبلاً
- يدعم الإحالات متعددة المستويات (قريباً)
- يمكن إضافة تصفية الاحتيال (AI-based)
- متوافق مع Vercel و Firebase

---

**تم إنشاؤه بواسطة: TWTC Development Team** ✨
