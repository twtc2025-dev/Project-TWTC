# 🚀 الإعداد السريع - TWTC Referral System

## خطوات الإعداد بـ 3 دقائق ⏱️

### 1️⃣ تثبيت المتطلبات

```bash
npm install
```

### 2️⃣ إنشاء ملف البيئة

```bash
cp .env.example .env
```

### 3️⃣ تحديث متغيرات البيئة في `.env`

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/twtc

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session
SESSION_SECRET=your-session-secret-key
```

> **الحصول على القيم:**
> - **MongoDB URI**: من MongoDB Atlas → Cluster → Connect → Application
> - **Google ClientID/Secret**: من Google Cloud Console → APIs & Services → Credentials
> - **Session Secret**: أي نص عشوائي قوي (32+ حرف)

### 4️⃣ تشغيل التطبيق محلياً

```bash
npm run dev
```

التطبيق سيكون متاحاً على: **http://localhost:5000**

---

## 🔗 نقاط نهاية API الأساسية

| النقطة | الوصف |
|--------|-------|
| `GET /api/referral/me` | الحصول على رمز الإحالة والإحصائيات |
| `POST /api/referral/track` | تتبع إحالة جديدة |
| `POST /api/referral/reward` | معالجة المكافأة |
| `GET /api/referral/stats` | الحصول على الإحصائيات الكاملة |

---

## 📁 هيكل المشروع

```
api/
  ├── server.ts              ← تطبيق Express الرئيسي
  ├── config/
  │   └── env.ts            ← متغيرات البيئة المركزية
  ├── lib/
  │   └── mongodb.ts        ← نماذج MongoDB
  ├── services/
  │   ├── referralBackendService.ts
  │   └── userService.ts
  ├── routes/
  │   └── referral.ts       ← نقاط نهاية API
  └── middleware/
      └── auth.ts           ← المصادقة

src/
  ├── components/
  │   ├── referral-section.tsx  ← واجهة المستخدم الرئيسية
  │   └── user-profile.tsx      ← صفحة المل الشخصي
  ├── services/
  │   └── referralService.ts    ← اتصالات API من Frontend
  └── config/
      └── referralConfig.ts     ← إعدادات النظام
```

---

## ✅ اختبار المتغيرات

عند بدء التطبيق، سيتحقق من:
- ✅ MongoDB connection
- ✅ Google OAuth setup
- ✅ Session configuration

**إذا كان هناك خطأ:**
```
❌ Missing MONGODB_URI - Set it in .env or environment variables
```

---

## 🌍 النشر على Vercel

### الخطوة 1: إضافة متغيرات البيئة

اذهب إلى: `https://vercel.com/project/settings/environment-variables`

أضف:
- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

### الخطوة 2: إعادة النشر

```bash
git push origin main
```

> **ملاحظة مهمة:** تأكد من تحديث Google OAuth redirect URI إلى:
> `https://your-vercel-domain.vercel.app/api/auth/google/callback`

---

## 🐛 استكشاف الأخطاء

| المشكلة | الحل |
|--------|------|
| `MONGODB_URI is required` | تحقق من ملف .env أو متغيرات البيئة |
| `Google OAuth failed` | تأكد من صحة GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET |
| `Session initialization failed` | تأكد من أن SESSION_SECRET موجود |
| `Cannot connect to database` | تحقق من اتصال MongoDB Atlas والعنوان IP |

---

## 📚 المستندات الإضافية

- [START_HERE_AR.md](START_HERE_AR.md) - شروع سريع بالعربية
- [REFERRAL_SYSTEM.md](REFERRAL_SYSTEM.md) - التوثيق الكامل
- [VERCEL_SETUP.md](VERCEL_SETUP.md) - إعداد Vercel المفصل

---

## 🎯 نقاط التحقق

- [ ] تم تثبيت npm packages
- [ ] تم إنشاء ملف .env
- [ ] تم تحديث متغيرات البيئة
- [ ] تم بدء التطبيق `npm run dev`
- [ ] يمكن الوصول إلى http://localhost:5000
- [ ] تم اختبار API endpoints
- [ ] تم إضافة متغيرات البيئة إلى Vercel

---

**استعداد للنشر؟** اتبع خطوات [VERCEL_SETUP.md](VERCEL_SETUP.md)
