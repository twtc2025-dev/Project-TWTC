import express from "express"; 
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

// 1. إعدادات Passport Strategy (مباشرة هنا لمنع مشاكل الاستيراد)
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
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "twtc_dev_key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, 
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. المسارات (Routes)
app.get("/api/status", (req, res) => res.send("API is Online and Merged!"));

// مسار تسجيل الدخول
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// مسار العودة (Callback)
app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/"); 
  }
);

export default app;
