import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth/google";
import authRoutes from "./routes/auth";

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);

export default app;
