import express from "express"; 
import session from "express-session";
import passport from "passport";
import cors from "cors";

// الاستيراد بدون امتدادات ملفات
import "./auth/google"; 
import authRoutes from "./routes/auth";

const app = express();

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

app.get("/api/status", (req, res) => res.send("API is Online!"));
app.use("/api/auth", authRoutes);

export default app;
