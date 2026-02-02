import express from "express"; 
import session from "express-session";
import passport from "passport";
import cors from "cors";

// استيراد الإعدادات من المجلدات المجاورة
import "./auth/google"; 
import authRoutes from "./routes/auth";

const app = express();

// إخبار Express أنه يعمل خلف بروكسي (ضروري جداً لـ Vercel و Google Auth)
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// إعداد الجلسة
app.use(session({
  // استخدام المتغير البيئي أو قيمة افتراضية لمنع الانهيار
  secret: process.env.SESSION_SECRET || "twtc_secret_key_2025",
  resave: false,
  saveUninitialized: false,
  cookie: {
    // يجب أن يكون true في الإنتاج ليعمل مع HTTPS
    secure: true, 
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// تهيئة Passport للجلسات
app.use(passport.initialize());
app.use(passport.session());

// ربط مسارات تسجيل الدخول
// الرابط سيكون: https://your-domain.com/api/auth/google
app.use("/api/auth", authRoutes);

// مسار فحص الحالة
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "TWTC Mining API" });
});

// تصدير التطبيق لـ Vercel
export default app;
