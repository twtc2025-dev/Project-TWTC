import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "../config/env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: env.GOOGLE_CALLBACK_URL,
      proxy: true,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        return done(null, profile);
      } catch (error) {
        return done(error as Error, null as any);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default function handler(req: any, res: any) {
  // Passport strategy is registered as a side effect when this module is imported.
  res.status(200).json({ ok: true, message: 'Passport strategy registered' });
}

