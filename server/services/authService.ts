import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../lib/mongodb.js';

const SALT_ROUNDS = 10;
const PASSWORD_MIN_LENGTH = 8;
const EMAIL_VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Valider la force du mot de passe
 * Requis: min 8 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Hasher un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

/**
 * Comparer un mot de passe avec son hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const match = await bcrypt.compare(password, hash);
  return match;
}

/**
 * Générer un token de vérification d'email
 */
export function generateEmailVerificationToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY);
  return { token, expiresAt };
}

/**
 * Créer un utilisateur avec email/mot de passe (non OAuth)
 */
export async function createUserWithEmailPassword(
  username: string,
  email: string,
  password: string,
  referralCode?: string | null
) {
  try {
    // Valider le mot de passe
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.errors.join(' '));
    }

    // Vérifier que l'username n'existe pas
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('Ce nom d\'utilisateur est déjà utilisé.');
    }

    // Vérifier que l'email n'existe pas
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('Cet email est déjà utilisé.');
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(password);

    // Générer le token et la date d'expiration de vérification d'email
    const { token: verificationToken, expiresAt: verificationExpires } =
      generateEmailVerificationToken();

    // Importer la fonction de génération de code de parrainage
    const { generateReferralCode } = await import('./referralBackendService.js');

    // Créer l'utilisateur
    const user = new User({
      username,
      email,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      referralCode: generateReferralCode(Date.now()),
      coins: 0,
    });

    await user.save();

    // Si vient d'un parrainage, lier le referrer
    if (referralCode && typeof referralCode === 'string') {
      const referrer = await User.findOne({ referralCode });
      if (referrer && referrer._id.toString() !== user._id.toString()) {
        user.referredBy = referrer._id;
        await user.save();
      }
    }

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      verificationToken: verificationToken, // À envoyer par email
    };
  } catch (error) {
    console.error('Error creating user with email/password:', error);
    throw error;
  }
}

/**
 * Vérifier le token d'email et marquer l'utilisateur comme vérifié
 */
export async function verifyEmailToken(token: string) {
  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Token invalide ou expiré.');
    }

    // Marquer comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return {
      success: true,
      message: 'Email vérifié avec succès.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  } catch (error) {
    console.error('Error verifying email token:', error);
    throw error;
  }
}

/**
 * Authentifier un utilisateur par email/mot de passe
 */
export async function authenticateUser(email: string, password: string) {
  try {
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      throw new Error('Email ou mot de passe incorrect.');
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect.');
    }

    return {
      user,
      authenticated: true,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
}

export const authService = {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateEmailVerificationToken,
  createUserWithEmailPassword,
  verifyEmailToken,
  authenticateUser,
};
