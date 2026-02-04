import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

const app = express();

// --- 1. الاتصال بـ MongoDB ---
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));
}

// --- 2. إعدادات Passport (إجبارية لكي تعمل المسارات) ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "https://twtc-mining.vercel.app/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    // هنا يمكنك إضافة منطق حفظ المستخدم في MongoDB لاحقاً
    return done(null, profile);
  }
));

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

// --- 3. Middleware ---
app.set("trust proxy", 1);
app.use(cors({ origin: "https://twtc-mining.vercel.app", credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "twtc_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { 
    secure: true, 
    sameSite: "none", 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- 4. المسارات (الروابط التي كانت مفقودة) ---

// رابط تسجيل الدخول
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// رابط العودة من جوجل
app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/"); // العودة للرئيسية بعد النجاح
  }
);

// رابط جلب بيانات المستخدم
app.get("/api/user", (req: Request, res: Response) => {
  res.json(req.isAuthenticated() ? { authenticated: true, user: req.user } : { authenticated: false });
});

// رابط تسجيل الخروج
app.get("/api/logout", (req, res) => {
  req.logout(() => res.json({ success: true }));
});

export default app;
