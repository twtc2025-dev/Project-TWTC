import { Router, Request, Response } from "express";
import passport from "passport";
import { createUserWithReferralCode } from "../services/userService.js";

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

