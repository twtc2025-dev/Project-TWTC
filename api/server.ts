import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import authRoutes from "../server/routes/auth.js";
import referralRoutes from "../server/routes/referral.js";
import { User } from "../server/lib/mongodb.js";
import { createUserWithReferralCode, ensureReferralCode } from "../server/services/userService.js";
import { env, validateEnv } from "../server/config/env.js";

const app = express();

// --- 0. التحقق من المتغيرات ---
validateEnv();

// --- 1. الاتصال بـ MongoDB ---
if (env.MONGODB_URI) {
  mongoose
    .connect(env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
} else {
  console.warn("⚠️  MONGODB_URI not set - check Vercel environment variables");
}

// --- 2. إعدادات Passport (إجبارية لكي تعمل المسارات) ---
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ابحث عن المستخدم بـ Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // أنشئ مستخدم جديد
          user = await createUserWithReferralCode(
            profile.displayName || profile.emails?.[0]?.value?.split("@")[0] || "user",
            profile.emails?.[0]?.value || "",
            profile.id
          );

          console.log("✅ New user created:", user.username);
        } else {
          // حدّث آخر دخول
          user.lastLogin = new Date();
          await user.save();

          console.log("✅ User logged in:", user.username);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Google Auth error:", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// --- 3. Middleware ---
app.set("trust proxy", 1);
// Allow origin from configured frontend URL (VITE_API_URL) - fallback to localhost for dev
const allowedOrigin = env.VITE_API_URL || (env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://twtc-mining.vercel.app');
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.MONGODB_URI,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --- 4. المسارات (الروابط) ---

// مسارات المصادقة
app.use("/api/auth", authRoutes);

// مسارات الإحالات
app.use("/api/referral", referralRoutes);

// رابط جلب بيانات المستخدم
app.get("/api/user", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: req.user,
    });
  }
  res.json({ authenticated: false });
});

// رابط تسجيل الخروج
app.get("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

export default app;
