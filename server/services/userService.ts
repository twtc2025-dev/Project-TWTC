import { generateReferralCode } from "../services/referralBackendService.js";
import { User } from "../lib/mongodb.js";

/**
 * Middleware لإنشاء رمز إحالة تلقائياً للمستخدم الجديد
 */
export async function ensureReferralCode(userId: any) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    // إذا لم يكن لديه كود إحالة، أنشئ واحداً
    if (!user.referralCode) {
      let code = generateReferralCode(userId);

      // التأكد من أن الكود فريد
      let existingUser = await User.findOne({ referralCode: code });
      while (existingUser) {
        code = generateReferralCode(Date.now());
        existingUser = await User.findOne({ referralCode: code });
      }

      user.referralCode = code;
      await user.save();
    }

    return user;
  } catch (error) {
    console.error("Error ensuring referral code:", error);
    return null;
  }
}

/**
 * إنشاء مستخدم جديد مع رمز إحالة
 */
export async function createUserWithReferralCode(
  username: string,
  email: string,
  googleId?: string,
  referralCode?: string
) {
  try {
    // أنشئ رمز إحالة فريد
    let code = generateReferralCode(Date.now());
    let existingUser = await User.findOne({ referralCode: code });

    while (existingUser) {
      code = generateReferralCode(Date.now() + Math.random());
      existingUser = await User.findOne({ referralCode: code });
    }

    // أنشئ المستخدم الجديد
    const newUser = new User({
      username,
      email,
      googleId,
      referralCode: code,
      coins: 0,
    });

    await newUser.save();

    // إذا جاء من إحالة، حدّث referrals table
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer && referrer._id.toString() !== newUser._id.toString()) {
        // Update the new user's referredBy field
        newUser.referredBy = referrer._id;
        await newUser.save();
      }
    }

    return newUser;
  } catch (error) {
    console.error("Error creating user with referral code:", error);
    throw error;
  }
}

/**
 * Trouver ou créer un utilisateur via Google OAuth
 */
export async function findOrCreateUser(profile: {
  googleId: string;
  email: string;
  displayName: string;
  photo: string;
}) {
  try {
    // Chercher l'utilisateur par googleId
    let user = await User.findOne({ googleId: profile.googleId });

    if (user) {
      return user;
    }

    // L'utilisateur n'existe pas, créer un nouveau
    const referralCode = generateReferralCode(profile.googleId);
    const newUser = new User({
      googleId: profile.googleId,
      email: profile.email,
      username: profile.displayName,
      photo: profile.photo,
      referralCode,
      coins: 0,
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
}

/**
 * Obtenir un utilisateur par ID
 */
export async function getUserById(userId: string) {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}

export const userService = {
  findOrCreateUser,
  getUserById,
  createUserWithReferralCode,
  ensureReferralCode,
};
