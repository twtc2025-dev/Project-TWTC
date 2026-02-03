import express from "express"; 
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

// 1. إعدادات Passport Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://twtc-mining.vercel.app/api/auth/google/callback",
      proxy: true
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        return done(null, profile);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 2. إعدادات Express
app.set("trust proxy", 1);
app.use(cors({
  origin: "https://twtc-mining.vercel.app", // حدد رابط موقعك بدقة
  credentials: true
}));
app.use(express.json());

// 3. تعديل الـ Session للعمل في بيئة Serverless
app.use(session({
  secret: process.env.SESSION_SECRET || "twtc_dev_key",
  resave: true, // تغيير لضمان الحفظ
  saveUninitialized: true,
  store: new session.MemoryStore(), // تعريف الـ Store صراحة لتقليل التحذيرات
  cookie: { 
    secure: true, 
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- المسارات ---

app.get("/api/status", (req, res) => res.send("API is Online!"));

app.get("/api/auth/google", (req, res, next) => {
  // إضافة log بسيط للتأكد من وصول الطلب
  console.log("Redirecting to Google...");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // نجاح تسجيل الدخول
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

export default app;
