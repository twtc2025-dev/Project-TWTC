import express from "express"; 
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo"; // تم إضافة المكتبة هنا

const app = express();

// 1. إعدادات Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "https://twtc-mining.vercel.app/api/auth/google/callback",
    proxy: true
  },
  async (_accessToken, _refreshToken, profile, done) => {
    // هنا مستقبلاً يمكنك حفظ المستخدم في قاعدة البيانات
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user as any));
passport.deserializeUser((obj, done) => done(null, obj as any));

// 2. إعدادات السيرفر
app.set("trust proxy", 1);
app.use(cors({ 
    origin: "https://twtc-mining.vercel.app", // يفضل وضع الدومين الصريح هنا
    credentials: true 
}));
app.use(express.json());

// تحقق من وجود متغير البيئة الخاص بقاعدة البيانات
if (!process.env.MONGODB_URI) {
  console.error("خطأ: متغير البيئة MONGODB_URI غير موجود! يجب ضبطه في إعدادات Vercel.");
  app.use((req, res, next) => {
    res.status(500).send("خطأ في السيرفر: إعداد قاعدة البيانات غير مكتمل. يرجى مراجعة إعدادات Vercel.");
  });
} else {
  app.use(session({
    secret: process.env.SESSION_SECRET || "twtc_dev_key",
    resave: false, // تم تغييرها لـ false لتقليل الضغط على القاعدة
    saveUninitialized: false, // لا تحفظ جلسات فارغة
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI, // سيقرأ الرابط من إعدادات Vercel
      ttl: 14 * 24 * 60 * 60, // سيبقى المستخدم مسجلاً لمدة 14 يوماً
      autoRemove: 'native' 
    }),
    cookie: { 
      secure: true, 
      sameSite: "none", 
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));
}

app.use(passport.initialize());
app.use(passport.session());

// 4. المسارات
app.get("/api/status", (req, res) => res.send("API is back online with MongoDB!"));

app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (_, res) => {
    // حفظ الجلسة في MongoDB قبل التوجيه
    res.redirect("/"); 
  }
);

app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

// مسار لتسجيل الخروج ومسح الجلسة من القاعدة
app.get("/api/logout", (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

export default app;
