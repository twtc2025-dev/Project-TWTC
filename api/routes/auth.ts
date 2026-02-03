import { Router } from "express";
import passport from "passport";

const router = Router();

// مسار تسجيل الدخول: /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// مسار العودة بعد موافقة Google: /api/auth/google/callback
router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (_, res) => {
    // عند النجاح، وجه المستخدم للرئيسية أو للوحة التحكم
    res.redirect("/"); 
  }
);

export default router;
