import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "../config/env.js";
import { User } from "../lib/mongodb.js";

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
        // Chercher l'utilisateur par googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Créer un nouvel utilisateur
          user = new User({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || "",
            username: profile.displayName || profile.emails?.[0]?.value?.split("@")[0] || "user",
            photo: profile.photos?.[0]?.value || "",
            coins: 0,
            totalMined: 0,
            energy: 1000,
            maxEnergy: 1000,
            clickPower: 1,
            referralCode: `ref_${profile.id.slice(0, 8)}`,
            kycStatus: 'Not Started',
            userGroup: Math.floor(Math.random() * 10) + 1,
            lastLogin: new Date(),
          });

          await user.save();
          console.log("✅ New user created:", user.username);
        } else {
          // Mettre à jour la date de dernière connexion
          user.lastLogin = new Date();
          await user.save();
          console.log("✅ User logged in:", user.username);
        }

        // Retourner le document MongoDB complet
        return done(null, user);
      } catch (error) {
        console.error("❌ Google Auth error:", error);
        return done(error as Error, null as any);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  // Sérialiser UNIQUEMENT l'ID ObjectId MongoDB (pas l'objet complet)
  const userId = user && user._id ? user._id.toString() : null;
  console.log("📝 Serialize user ID:", userId);
  done(null, userId);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    // Valider que id est une string ObjectId valide (24 caractères hex)
    if (!id || typeof id !== 'string' || id.length !== 24) {
      console.warn("⚠️  Invalid user ID format. Received:", typeof id, id);
      return done(null, null);
    }
    const user = await User.findById(id);
    console.log("👤 Deserialize user:", user?.username);
    done(null, user);
  } catch (error) {
    console.error("❌ Deserialize error:", error);
    done(null, null);
  }
});

export default passport;

