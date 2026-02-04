import { Router, Request, Response } from "express";
import passport from "passport";

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

export default router;
