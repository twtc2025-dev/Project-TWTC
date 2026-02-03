import express from "express"; 
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo";
import mongoose from "mongoose"; // أضفنا mongoose

const app = express();

// --- 1. الاتصال بقاعدة البيانات (لضمان حفظ المستخدمين) ---
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.error("MongoDB Connection Error:", err));
}

// تعريف موديل المستخدم (Schema)
const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

// --- 2. إعدادات Passport مع الحفظ في القاعدة ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "https://twtc-mining.vercel.app/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// --- 3. الـ Middleware ---
app.set("trust proxy", 1);
app.use(cors({ origin: "https://twtc-mining.vercel.app", credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "twtc_dev_key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: { 
    secure: true, 
    sameSite: "none", 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- 4. المسارات (Routes) ---
app.get("/api/status", (req, res) => res.send("API Online"));
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    req.session.save(() => res.redirect("/")); 
  }
);

app.get("/api/user", (req, res) => {
  res.json(req.isAuthenticated() ? { authenticated: true, user: req.user } : { authenticated: false });
});

app.get("/api/logout", (req, res) => {
  req.logout(() => res.json({ success: true }));
});

// --- 5. التصدير النهائي المتوافق مع Vercel ---
export default app;
