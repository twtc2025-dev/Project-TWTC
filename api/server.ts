import express from "express"; 
import session from "express-session";
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
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// التعديل الأهم هنا لضمان عمل الجلسة في Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || "twtc_dev_key",
  resave: true, // مهم جداً
  saveUninitialized: true, // مهم جداً
  cookie: { 
    secure: true, 
    sameSite: "none",
    domain: ".vercel.app", // يسمح للجلسة بالعمل عبر الروابط الفرعية لـ Vercel
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // احفظ الجلسة يدوياً قبل التوجيه للتأكد من ثباتها
    req.session.save(() => {
      res.redirect("/"); 
    });
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
