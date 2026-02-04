import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "../config/env.js";
import { userService } from "../services/userService.js";

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
        // Créer ou trouver l'utilisateur
        const user = await userService.findOrCreateUser({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || "",
          displayName: profile.displayName || "",
          photo: profile.photos?.[0]?.value || "",
        });

        return done(null, { id: user._id, googleId: user.googleId });
      } catch (error) {
        return done(error as Error, null as any);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;

