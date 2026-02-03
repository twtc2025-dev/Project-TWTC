import express from "express"; 
import cookieSession from "cookie-session"; // تغيير المكتبة هنا
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

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

app.set("trust proxy", 1);
app.use(cors({ origin: "https://twtc-mining.vercel.app", credentials: true }));
app.use(express.json());

// التغيير الجذري هنا: استخدام cookie-session بدلاً من express-session
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || "twtc_dev_key"],
  maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
  secure: true,
  sameSite: 'none',
  httpOnly: true
}));

app.use(passport.initialize());
app.use(passport.session());

// المسارات
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/"); // الآن المتصفح سيحمل الجلسة معه ولن تضيع
  }
);

app.get("/api/user", (req, res) => {
  if (req.session && req.session.passport && req.session.passport.user) {
    res.json({ authenticated: true, user: req.session.passport.user });
  } else {
    res.json({ authenticated: false });
  }
});

export default app;
