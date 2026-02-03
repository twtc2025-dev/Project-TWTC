import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import pkg from 'passport-google-oauth20'; // استيراد الحزمة كاملة
const { Strategy: GoogleStrategy } = pkg; // استخراج الاستراتيجية لتجنب خطأ exports
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

const app = express();

// --- 1. الاتصال بقاعدة البيانات ---
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.error("MongoDB Connection Error:", err));
}

// تعريف موديل المستخدم
const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

// --- 2. إعدادات Passport ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "https://twtc-mining.vercel.app/api/auth/google/callback",
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails?.[0]?.value,
                image: profile.photos?.[0]?.value
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// --- 3. Middleware ---
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

// --- 4. المسارات ---
app.get("/api/user", (req, res) => {
    res.json(req.isAuthenticated() ? { authenticated: true, user: req.user } : { authenticated: false });
});

app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        req.session.save(() => res.redirect("/"));
    }
);

app.get("/api/logout", (req: any, res) => {
    req.logout(() => res.json({ success: true }));
});

// --- 5. التصدير النهائي ---
export default app;
