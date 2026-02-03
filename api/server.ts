import express from "express"; 
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

// 1. إعدادات Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "https://twtc-mining.vercel.app/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 2. إعدادات السيرفر
app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 3. استخدام express-session مع إعدادات تجبر المتصفح على حفظها
app.use(session({
  secret: process.env.SESSION_SECRET || "twtc_dev_key",
  resave: true, // إجبار الجلسة على التحديث
  saveUninitialized: true, // إجبار إنشاء جلسة حتى لو لم يسجل دخول
  cookie: { 
    secure: true, 
    sameSite: "none", 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 4. المسارات
app.get("/api/status", (req, res) => res.send("API is back online!"));

app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // أهم سطر: حفظ الجلسة قبل التوجيه لضمان استقرارها في Vercel
    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
      res.redirect("/"); 
    });
  }
);

app.get("/api/user", (req, res) => {
  // فحص يدوي للجلسة لضمان أقصى دقة
  const user = req.user || (req.session && (req.session as any).passport?.user);
  if (user) {
    res.json({ authenticated: true, user });
  } else {
    res.json({ authenticated: false });
  }
});

export default app;
