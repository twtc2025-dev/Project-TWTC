# نظام الإحالات (Referral System) - دليل شامل

## 📋 نظرة عامة

نظام إحالات متكامل يسمح للمستخدمين بدعوة أصدقاء جدد والحصول على مكافآت.

---

## 🏗️ هيكل النظام

### 1. **قاعدة البيانات**

#### جدول `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  coins INTEGER DEFAULT 0,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by INTEGER
);
```

#### جدول `referrals`
```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### 1. **GET /api/referral/me**
الحصول على بيانات الإحالات للمستخدم الحالي.

**المصادقة:** مطلوبة ✅

**Response:**
```json
{
  "success": true,
  "referralCode": "ABC-1X2Y3",
  "referralLink": "https://twtc-mining.vercel.app/signup?ref=ABC-1X2Y3",
  "totalReferrals": 5,
  "activeReferrals": 3,
  "rewardedReferrals": 2,
  "totalRewardsEarned": 100
}
```

---

### 2. **POST /api/referral/track**
تتبع إحالة جديدة عند تسجيل مستخدم جديد.

**Body:**
```json
{
  "referralCode": "ABC-1X2Y3",
  "newUserId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral tracked successfully"
}
```

---

### 3. **POST /api/referral/reward**
منح مكافأة للمُحيل بعد تحقق شروط معينة.

**المصادقة:** مطلوبة ✅

**Body:**
```json
{
  "referralId": 1
}
```

**Response:**
```json
{
  "success": true,
  "reward": 50,
  "message": "Reward granted successfully"
}
```

---

### 4. **GET /api/referral/stats**
جلب الإحصائيات الكاملة للإحالات.

**المصادقة:** مطلوبة ✅

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 10,
    "pendingReferrals": 3,
    "confirmedReferrals": 4,
    "rewardedReferrals": 3,
    "totalRewardsEarned": 150,
    "referralsList": [
      {
        "id": 1,
        "username": "user123",
        "status": "rewarded",
        "createdAt": "2025-02-04T10:00:00Z"
      }
    ]
  }
}
```

---

## 🎨 المكونات

### 1. **ReferralSection.tsx**
مكون يعرض:
- كود الإحالة الفريد
- رابط الإحالة
- زر النسخ
- زر المشاركة
- إحصائيات الإحالات
- قائمة الإحالات الأخيرة

**الاستخدام:**
```tsx
import { ReferralSection } from './components/referral-section';

<ReferralSection 
  stats={referralStats} 
  isLoading={referralLoading} 
/>
```

---

## 🛠️ الخدمات

### `referralService.ts`

#### الدوال المتاحة:

1. **`getReferralData()`**
   ```typescript
   const data = await getReferralData();
   ```

2. **`getReferralStats()`**
   ```typescript
   const stats = await getReferralStats();
   ```

3. **`trackReferral(code, userId)`**
   ```typescript
   const result = await trackReferral('ABC-1X2Y3', 'user123');
   ```

4. **`processReferralReward(referralId)`**
   ```typescript
   const reward = await processReferralReward('referral-id');
   ```

5. **`getReferralCodeFromURL()`**
   ```typescript
   const code = getReferralCodeFromURL(); // يستخرج ?ref=... من URL
   ```

6. **`copyReferralLink(link)`**
   ```typescript
   const copied = await copyReferralLink(referralLink);
   ```

7. **`shareReferralLink(title, text, link)`**
   ```typescript
   const shared = await shareReferralLink(
     'Join TWTC Mining',
     'Start mining with my link!',
     referralLink
   );
   ```

---

## 🔒 الأمان

### قواعد الحماية:

1. **منع إحالة النفس**
   ```typescript
   if (referrerId === referredUserId) {
     return { can: false, error: "Cannot refer yourself" };
   }
   ```

2. **منع تكرار الإحالات**
   - التحقق من عدم وجود إحالة سابقة بين نفس المستخدمين

3. **منع تكرار المكافآت**
   - التحقق من عدم تحويل reward_given إلى true سابقاً

4. **المصادقة المطلوبة**
   - جميع العمليات الحساسة تتطلب مستخدم معاد

5. **Rate Limiting**
   - يمكن إضافة حد للإحالات في فترة زمنية معينة

---

## 📊 حالات الإحالة

| الحالة | الوصف |
|--------|-------|
| **pending** | تم تتبع الإحالة لكن لم يتم تأكيدها بعد |
| **confirmed** | تم تأكيد الإحالة (المستخدم الجديد نشط) |
| **rewarded** | تم منح المكافأة للمُحيل |

---

## 💰 نظام المكافآت

### الحد الأدنى للمكافأة:
```typescript
const REFERRAL_REWARD = 50; // Coins
```

### شروط المكافأة:
1. ✅ التسجيل بنجاح عبر الرابط
2. ✅ تأكيد البريد الإلكتروني (اختياري)
3. ✅ إكمال التحقق من الهوية (اختياري)

---

## 🔧 التكامل مع الواجهة الأمامية

### مثال كامل:

```tsx
import { useEffect, useState } from 'react';
import { ReferralSection } from './components/referral-section';
import { getReferralData, getReferralCodeFromURL } from './services/referralService';

export function ProfilePage() {
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. جلب البيانات عند التحميل
    fetchReferralData();

    // 2. التحقق من وجود كود إحالة في URL
    const referralCode = getReferralCodeFromURL();
    if (referralCode) {
      console.log('Referral code from URL:', referralCode);
      // حفظ الكود لاستخدامه عند التسجيل
      localStorage.setItem('referralCode', referralCode);
    }
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const data = await getReferralData();
      setReferralStats(data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <ReferralSection stats={referralStats} isLoading={loading} />
    </div>
  );
}
```

---

## 📈 التحسينات المستقبلية

1. **نظام الليدربورد**
   - عرض أفضل المُحيلين

2. **نظام النقاط المتقدم**
   - مكافآت مختلفة حسب الفئة

3. **الإحالات متعددة المستويات**
   - مكافآت من إحالات الإحالات

4. **التكامل مع Web3**
   - إرسال rewards كـ NFTs

5. **التحليلات**
   - تقارير تفصيلية عن الإحالات

---

## 🚀 النشر

### على Vercel:
1. تحديث متغيرات البيئة
2. تشغيل migrations
3. نشر الكود

```bash
npm run build
npm run preview
```

---

## 📝 ملاحظات إضافية

- النظام قابل للتوسع لدعم Web3 مستقبلاً
- يمكن تخصيص قيمة المكافأة من `REFERRAL_REWARD`
- يدعم النسخ السريع والمشاركة الأصلية
- آمن وخالي من الثغرات الشائعة
