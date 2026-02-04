# ⚙️ إعداد Vercel Environment Variables

## 🔗 متغيرات البيئة المطلوبة

تم ربط جميع متغيرات البيئة من خلال:
- `api/config/env.ts` - مركزي لتحميل المتغيرات
- `api/server.ts` - التحقق والاستخدام

### المتغيرات الأساسية:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Session
SESSION_SECRET=your_secret_key

# App
NODE_ENV=production
PORT=3000
VITE_API_URL=https://twtc-mining.vercel.app
```

---

## ✅ كيفية الإعداد في Vercel

### الخطوة 1: فتح صفحة المشروع
```
https://vercel.com/twtc2025-dev/Project-TWTC
```

### الخطوة 2: انتقل إلى Settings
```
Settings → Environment Variables
```

### الخطوة 3: أضف المتغيرات

أضف كل متغير بالصيغة التالية:

| متغير | القيمة | ملاحظات |
|-------|--------|--------|
| `MONGODB_URI` | MongoDB Connection String | من MongoDB Atlas |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | من Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | من Google Cloud Console |
| `SESSION_SECRET` | أي نص آمن | للتوقيع على الـ sessions |

### الخطوة 4: أعد النشر
```bash
git push origin main
# أو انقر "Redeploy" في Vercel Dashboard
```

---

## 🔍 التحقق من الاتصال

### محلياً:
```bash
npm run dev
# ستظهر رسائل التحقق:
# ✅ MongoDB connected
# ✅ Environment variables validated
```

### على Vercel:
```bash
# افتح Vercel Logs
# ستظهر نفس الرسائل في الـ logs
```

---

## 🔐 الحصول على المفاتيح

### 1. MongoDB Atlas Connection String
```
1. انتقل إلى https://www.mongodb.com/cloud/atlas
2. تسجيل الدخول إلى حسابك
3. الكلاستر → Connect → Connect your application
4. انسخ Connection String
5. استبدل <username> و <password>
```

### 2. Google OAuth Credentials
```
1. انتقل إلى https://console.cloud.google.com
2. إنشاء مشروع جديد أو اختر موجود
3. APIs & Services → Credentials
4. Create Credentials → OAuth 2.0 Client ID
5. اختر "Web application"
6. Authorized redirect URIs:
   - https://twtc-mining.vercel.app/api/auth/google/callback
   - http://localhost:3000/api/auth/google/callback (للتطوير)
7. انسخ Client ID و Client Secret
```

---

## 📝 الملفات المتعلقة

| الملف | الدور |
|------|-------|
| `api/config/env.ts` | تحميل والتحقق من المتغيرات |
| `api/server.ts` | استخدام المتغيرات |
| `api/lib/mongodb.ts` | نماذج MongoDB |
| `api/routes/referral.ts` | API للإحالات |

---

## ✨ الحالة الحالية

### ✅ تم الإعداد:
- [x] جميع متغيرات البيئة مركزية
- [x] التحقق التلقائي من المتغيرات
- [x] رسائل خطأ واضحة
- [x] توافق كامل مع Vercel

### 🚀 جاهز للنشر:
```bash
git push origin main
# التطبيق سيشتغل تلقائياً على Vercel
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "MONGODB_URI not set"
**الحل:**
1. تحقق من Vercel Settings
2. أضف MONGODB_URI
3. اضغط "Redeploy"

### المشكلة: "Google Auth Failed"
**الحل:**
1. تحقق من GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET
2. تحقق من Authorized redirect URIs في Google Console
3. أعد النشر

### المشكلة: "MongoDB Connection Failed"
**الحل:**
1. تحقق من Connection String في MONGODB_URI
2. تأكد من أن IP الخادم مسموح في MongoDB Atlas
3. أضف "0.0.0.0/0" للسماح بجميع الـ IPs

---

## 🌐 الاتصال بالتطبيق

بعد النشر على Vercel:

```
Frontend:   https://twtc-mining.vercel.app
API:        https://twtc-mining.vercel.app/api
Health:     https://twtc-mining.vercel.app/api/health
Referral:   https://twtc-mining.vercel.app/api/referral/me
```

---

## 📊 قائمة التحقق

- [ ] MongoDB URI مضاف في Vercel
- [ ] Google Client ID مضاف في Vercel
- [ ] Google Client Secret مضاف في Vercel
- [ ] SESSION_SECRET مضاف في Vercel
- [ ] تم النشر على Vercel
- [ ] اختبار الاتصال من المتصفح
- [ ] التحقق من لوحات Vercel Logs

---

## 💡 النصائح

1. **أثناء التطوير**: استخدم `.env` محليّة
2. **أثناء الإنتاج**: استخدم Vercel Environment Variables
3. **الأمان**: لا تضع المفاتيح في الكود أو Git
4. **المراقبة**: راقب Vercel Logs للأخطاء
5. **النسخ الاحتياطية**: احفظ المفاتيح في مكان آمن

---

**جميع الإعدادات جاهزة! فقط أضف المتغيرات في Vercel وأعد النشر.** 🚀
