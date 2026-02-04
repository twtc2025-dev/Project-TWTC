import { Router, Request, Response } from "express";
import passport from "passport";
import { createUserWithReferralCode } from "../services/userService.js";
import { 
  createUserWithEmailPassword, 
  verifyEmailToken, 
  authenticateUser,
  validatePasswordStrength 
} from "../services/authService.js";
import { sendVerificationEmail } from "../services/emailService.js";

// Helper to promisify req.login
function loginAsync(req: Request, user: any) {
  return new Promise<void>((resolve, reject) => {
    req.login(user, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

const router = Router();

// مسار تسجيل الدخول: /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// مسار العودة بعد موافقة Google: /api/auth/google/callback
router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req: Request, res: Response) => {
    // الحصول على كود الإحالة إذا وجد
    const referralCode = req.query.ref as string | undefined;
    
    // حفظ كود الإحالة في session إذا وجد
    if (referralCode && req.user) {
      (req.session as any).referralCode = referralCode;
    }

    // إعادة التوجيه مع كود الإحالة إن وجد
    if (referralCode) {
      res.redirect(`/?ref=${encodeURIComponent(referralCode)}`);
    } else {
      res.redirect("/");
    }
  }
);

// POST /api/auth/register-email: التسجيل مع email وكلمة مرور
router.post("/register-email", async (req: Request, res: Response) => {
  try {
    const { username, email, password, referralCode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "username, email et mot de passe requis" 
      });
    }

    // Créer l'utilisateur avec email/mot de passe
    const { user, verificationToken } = await createUserWithEmailPassword(
      username,
      email,
      password,
      referralCode
    );

    // Envoyer email de vérification
    await sendVerificationEmail(email, username, verificationToken);

    // Connecter l'utilisateur (même avant vérification d'email)
    const { User } = await import('../lib/mongodb.js');
    const fullUser = await User.findById(user.id);
    await loginAsync(req, fullUser);

    res.json({ 
      success: true, 
      message: "Inscription réussie. Un email de vérification a été envoyé.",
      user 
    });
  } catch (err: any) {
    console.error("Register email error:", err);
    res.status(400).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// GET /api/auth/verify-email/:token: Vérifier le token d'email
router.get("/verify-email/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const tokenStr = Array.isArray(token) ? token[0] : token;

    const result = await verifyEmailToken(tokenStr);

    res.json({ 
      success: true, 
      message: "Email vérifié avec succès!",
      user: result.user
    });
  } catch (err: any) {
    console.error("Verify email error:", err);
    res.status(400).json({ success: false, error: err.message || 'Verification failed' });
  }
});

// POST /api/auth/login: Authentifier avec email/mot de passe
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Email et mot de passe requis" 
      });
    }

    const { user } = await authenticateUser(email, password);

    // Connecter l'utilisateur à la session
    await loginAsync(req, user);

    res.json({ 
      success: true, 
      message: "Connexion réussie",
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        isEmailVerified: user.isEmailVerified
      } 
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(401).json({ success: false, error: err.message || 'Authentication failed' });
  }
});

// POST /api/auth/validate-password: Valider la force du mot de passe
router.post("/validate-password", (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        error: "Le mot de passe est requis" 
      });
    }

    const validation = validatePasswordStrength(password);

    res.json({ 
      success: validation.valid,
      valid: validation.valid,
      errors: validation.errors 
    });
  } catch (err: any) {
    console.error("Validate password error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// إنشاء مستخدم عن طريق نموذج التسجيل (بدون كلمة مرور في هذه النسخة)
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, referralCode } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, error: "username and email required" });
    }

    const user = await createUserWithReferralCode(username, email, undefined, referralCode);

    // تسجيل الجلسة للمستخدم الجديد
    await loginAsync(req, user);

    res.json({ success: true, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

export default router;

