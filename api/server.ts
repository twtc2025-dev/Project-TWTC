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
        // profile يحتوي على بيانات Google (الاسم، الإيميل، الصورة)
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
  origin: true, // يسمح بالطلبات من موقعك
  credentials: true // ضروري لإرسال الـ Cookies
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "twtc_dev_key",
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: true, 
    sameSite: "none", // تصحيح من "non" إلى "none" للسماح بالعمل على Vercel
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. المسارات (Routes)

// مسار فحص الحالة
app.get("/api/status", (req, res) => res.send("API is Online and Merged!"));

// مسار فحص بيانات المستخدم (استخدمه في الـ Frontend لمعرفة من سجل دخوله)
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

// مسار تسجيل الدخول
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// مسار العودة (Callback)
app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // التوجيه بعد النجاح (يمكنك تغييره إلى /dashboard إذا أردت)
    res.redirect("/"); 
  }
);

// مسار تسجيل الخروج
app.get("/api/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default app;
