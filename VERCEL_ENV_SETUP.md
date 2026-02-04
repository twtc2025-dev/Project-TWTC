# 🔗 ربط متغيرات Vercel - دليل شامل

## ✅ المتغيرات الموجودة بالفعل في Vercel

وفقاً لطلبك، المتغيرات التالية موجودة بالفعل:
- ✅ `MONGODB_URI`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `SESSION_SECRET`

---

## 🔄 كيفية العمل - Architecture

### النظام الحالي:

```
Vercel Dashboard
      ↓
Environment Variables
      ↓
GitHub Secrets (via GitHub integration)
      ↓
api/config/env.ts (يقرأ من process.env)
      ↓
api/server.ts (يستخدم env config)
      ↓
API Routes & Services
```

### ملف `api/config/env.ts` (الموجود بالفعل):

```typescript
// يقوم بـ:
// 1. قراءة جميع متغيرات البيئة من process.env
// 2. التحقق من أن جميع المتغيرات المطلوبة موجودة
// 3. تصدير كائن env مركزي
// 4. عرض رسائل خطأ واضحة إذا كانت هناك متغيرات ناقصة
```

---

## 🚀 خطوات الإعداد على Vercel

### الخطوة 1: تسجيل الدخول إلى Vercel

```bash
# إذا كنت لم تقم بتسجيل الدخول
vercel login
```

### الخطوة 2: اختيار المشروع

```bash
# سيطلب منك اختيار المشروع
vercel
```

### الخطوة 3: الوصول إلى لوحة التحكم

**الطريقة الويب:**
1. اذهب إلى: https://vercel.com/dashboard/twtc2025-dev/Project-TWTC
2. انقر على "Settings" في شريط التنقل
3. اختر "Environment Variables" من الجانب الأيسر

**الطريقة عبر الـ CLI:**
```bash
# عرض المتغيرات الحالية
vercel env ls

# إضافة متغير جديد
vercel env add

# حذف متغير
vercel env rm
```

---

## ✨ التحقق من المتغيرات

### 1. التحقق محلياً:

```bash
# قبل التشغيل، تأكد من:
cat .env

# يجب أن تحتوي على:
# MONGODB_URI=...
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# SESSION_SECRET=...
```

### 2. التحقق أثناء التشغيل:

عند بدء التطبيق `npm run dev`، سترى:

```
✅ Environment configuration loaded successfully
✅ All required variables are present
📦 MongoDB: Connected
🔐 Google OAuth: Configured
🔑 Session: Initialized
```

### 3. التحقق على Vercel:

```bash
# بعد النشر
vercel logs

# يجب أن ترى رسائل الاتصال الناجحة
```

---

## 🔐 كيفية ربط GitHub Secrets (اختياري)

إذا كنت تستخدم GitHub Actions:

### الخطوة 1: إضافة إلى GitHub Secrets

اذهب إلى: `https://github.com/twtc2025-dev/Project-TWTC/settings/secrets/actions`

أضف كل متغير:
```
Name: MONGODB_URI
Value: mongodb+srv://...

Name: GOOGLE_CLIENT_ID
Value: ...apps.googleusercontent.com

Name: GOOGLE_CLIENT_SECRET
Value: ...

Name: SESSION_SECRET
Value: ...
```

### الخطوة 2: استخدام في GitHub Actions

```yaml
# .github/workflows/deploy.yml
env:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
  GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
  SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
```

---

## 🧪 اختبار الاتصالات

### اختبار MongoDB:

```bash
# في terminal
curl http://localhost:5000/api/health

# أو في browser
# http://localhost:5000/api/health

# النتيجة المتوقعة:
# { status: "ok", mongodb: "connected" }
```

### اختبار Google OAuth:

```bash
# سيتم اختباره عند محاولة تسجيل الدخول عبر Google
# في واجهة المستخدم
```

### اختبار نظام الإحالات:

```bash
# بعد تسجيل الدخول
curl http://localhost:5000/api/referral/me \
  -H "Authorization: Bearer $TOKEN"

# يجب أن يرجع:
# {
#   "referralCode": "ABC-1X2Y3",
#   "referralLink": "https://...",
#   "stats": { ... }
# }
```

---

## 📋 Checklist النشر على Vercel

- [ ] متغيرات البيئة موجودة في Vercel:
  - [ ] `MONGODB_URI` ✅
  - [ ] `GOOGLE_CLIENT_ID` ✅
  - [ ] `GOOGLE_CLIENT_SECRET` ✅
  - [ ] `SESSION_SECRET` ✅

- [ ] محدّث Google OAuth Redirect URI:
  - [ ] Local: `http://localhost:5000/api/auth/google/callback` ✅
  - [ ] Vercel: `https://twtc-mining.vercel.app/api/auth/google/callback` ✅

- [ ] MongoDB Atlas مُعدّ:
  - [ ] IP Whitelist يسمح بـ Vercel IPs ✅
  - [ ] User credentials محفوظة ✅
  - [ ] Database `twtc` موجودة ✅

- [ ] Git Push مشروع محدّث:
  ```bash
  git add .
  git commit -m "Setup referral system with env config"
  git push origin main
  ```

- [ ] إعادة نشر على Vercel:
  - [ ] اذهب إلى Vercel Dashboard
  - [ ] انقر "Redeploy" لتطبيق متغيرات البيئة الجديدة

---

## 🎯 التسلسل الكامل للإعداد

### 1️⃣ تطوير محلي:
```bash
# 1. نسخ ملف البيئة
cp .env.example .env

# 2. تحديث .env بالقيم الحقيقية
nano .env

# 3. تثبيت المتطلبات
npm install

# 4. بدء التطبيق
npm run dev

# 5. اختبار
# http://localhost:5000
```

### 2️⃣ نشر على Vercel:
```bash
# 1. إضافة التغييرات
git add .
git commit -m "Setup referral system"

# 2. Push إلى GitHub
git push origin main

# 3. Vercel سيقوم بـ redeploy تلقائياً
# (يمكنك أيضاً النقر "Redeploy" يدوياً في Dashboard)

# 4. اختبار الـ API على Vercel
# https://twtc-mining.vercel.app/api/health
```

### 3️⃣ التحقق من النجاح:
```bash
# الفحص السريع:
# 1. فتح https://twtc-mining.vercel.app
# 2. التحقق من أن الصفحة تحميل بدون أخطاء
# 3. محاولة تسجيل الدخول عبر Google
# 4. التحقق من ظهور رمز الإحالة
```

---

## 🆘 استكشاف الأخطاء الشائعة

### خطأ: "MongoDB connection failed"

**السبب:** `MONGODB_URI` غير صحيح أو غير موجود

**الحل:**
```bash
# 1. تأكد من .env
cat .env | grep MONGODB_URI

# 2. اختبر الاتصال
mongo "mongodb+srv://..." --eval "db.adminCommand('ping')"

# 3. تحقق من IP Whitelist في MongoDB Atlas
# Dashboard → Network Access → IP Whitelist
```

### خطأ: "Google OAuth failed"

**السبب:** `GOOGLE_CLIENT_ID` أو `GOOGLE_CLIENT_SECRET` غير صحيح

**الحل:**
```bash
# 1. تحقق من Google Cloud Console
# https://console.cloud.google.com

# 2. تأكد من صحة Client ID و Secret

# 3. تحقق من Authorized redirect URIs
# يجب أن يكون موجود:
# - http://localhost:5000/api/auth/google/callback (local)
# - https://twtc-mining.vercel.app/api/auth/google/callback (Vercel)
```

### خطأ: "SESSION_SECRET is required"

**السبب:** `SESSION_SECRET` غير موجود في البيئة

**الحل:**
```bash
# 1. أضف إلى .env
SESSION_SECRET=your-random-key-here

# 2. أو على Vercel Dashboard:
# Settings → Environment Variables → Add
# Name: SESSION_SECRET
# Value: your-random-key-here
```

---

## 📞 معلومات إضافية

**ملف البيئة المركزي:**
- [api/config/env.ts](api/config/env.ts)

**ملف الخادم:**
- [api/server.ts](api/server.ts)

**نظام الإحالات:**
- [REFERRAL_SYSTEM.md](REFERRAL_SYSTEM.md)

**البدء السريع:**
- [QUICK_SETUP.md](QUICK_SETUP.md)

---

**هل كل شيء جاهز؟** 🚀

```bash
# ابدأ هنا:
npm install
npm run dev

# ثم:
# http://localhost:5000
```
