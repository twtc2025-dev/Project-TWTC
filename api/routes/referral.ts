import { Router, Request, Response } from "express";
import { User, Referral } from "../lib/mongodb";
import { generateReferralCode, validateReferralCode } from "../services/referralBackendService";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// GET /api/referral/me - الحصول على بيانات الإحالات للمستخدم الحالي
router.get("/me", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?._id || (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Get referral stats
    const totalReferrals = await Referral.countDocuments({ referrerId: userId });
    const activeReferrals = await Referral.countDocuments({
      referrerId: userId,
      status: { $in: ["confirmed", "rewarded"] },
    });
    const rewardedReferrals = await Referral.countDocuments({
      referrerId: userId,
      status: "rewarded",
    });

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink: `https://twtc-mining.vercel.app/signup?ref=${user.referralCode}`,
      totalReferrals,
      activeReferrals,
      rewardedReferrals,
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    res.status(500).json({ success: false, error: "Failed to fetch referral data" });
  }
});

// POST /api/referral/track - تتبع الإحالات عند التسجيل
router.post("/track", async (req: Request, res: Response) => {
  try {
    const { referralCode, newUserId } = req.body;

    if (!referralCode || !newUserId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Find referrer by code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({ success: false, error: "Invalid referral code" });
    }

    // Check if already referred
    const existingReferral = await Referral.findOne({
      referrerId: referrer._id,
      referredUserId: newUserId,
    });

    if (existingReferral) {
      return res.status(400).json({ success: false, error: "User already referred" });
    }

    // Prevent self-referral
    if (referrer._id.toString() === newUserId) {
      return res.status(400).json({ success: false, error: "Cannot refer yourself" });
    }

    // Create referral record
    const referral = new Referral({
      referrerId: referrer._id,
      referredUserId: newUserId,
      status: "pending",
    });

    await referral.save();

    // Update user's referredBy field
    await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

    res.json({ success: true, message: "Referral tracked successfully" });
  } catch (error) {
    console.error("Error tracking referral:", error);
    res.status(500).json({ success: false, error: "Failed to track referral" });
  }
});

// POST /api/referral/reward - منح المكافأة
router.post("/reward", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { referralId } = req.body;
    const userId = (req.user as any)?._id || (req.user as any)?.id;

    if (!referralId) {
      return res.status(400).json({ success: false, error: "Missing referral ID" });
    }

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({ success: false, error: "Referral not found" });
    }

    // Check if already rewarded
    if (referral.rewardGiven) {
      return res.status(400).json({ success: false, error: "Reward already given" });
    }

    // Update referral status
    referral.status = "rewarded";
    referral.rewardGiven = true;
    referral.confirmedAt = new Date();
    await referral.save();

    // Add coins to referrer
    const referrer = await User.findByIdAndUpdate(
      referral.referrerId,
      { $inc: { coins: 50 } },
      { new: true }
    );

    res.json({
      success: true,
      reward: 50,
      message: "Reward granted successfully",
      newBalance: referrer?.coins || 0,
    });
  } catch (error) {
    console.error("Error processing reward:", error);
    res.status(500).json({ success: false, error: "Failed to process reward" });
  }
});

// GET /api/referral/stats - الإحصائيات الكاملة للإحالات
router.get("/stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?._id || (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const referrals = await Referral.find({ referrerId: userId })
      .populate("referredUserId", "username email")
      .sort({ createdAt: -1 });

    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter((r) => r.status === "pending").length;
    const confirmedReferrals = referrals.filter((r) => r.status === "confirmed").length;
    const rewardedReferrals = referrals.filter((r) => r.status === "rewarded").length;

    const stats = {
      totalReferrals,
      pendingReferrals,
      confirmedReferrals,
      rewardedReferrals,
      totalRewardsEarned: rewardedReferrals * 50,
      referralsList: referrals.map((r) => ({
        id: r._id,
        username: (r.referredUserId as any)?.username || "Unknown",
        email: (r.referredUserId as any)?.email || "Unknown",
        status: r.status,
        createdAt: r.createdAt,
      })),
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});

export default router;
