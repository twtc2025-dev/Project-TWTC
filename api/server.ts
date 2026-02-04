import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import authRoutes from "../server/routes/auth.js";
import referralRoutes from "../server/routes/referral.js";
import { User } from "../server/lib/mongodb.js";
import { env, validateEnv } from "../server/config/env.js";
import "../server/auth/google.js"; // Charge la stratégie Google Passport

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

// --- 2. Initialiser Middleware Passport ---
// (Stratégie Google chargée depuis server/auth/google.ts)

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
