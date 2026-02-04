/**
 * مثال عملي لدمج نظام الإحالات في عملية التسجيل
 * يمكن إضافة هذا في صفحة التسجيل أو في الـ Auth flow
 */

import { getReferralCodeFromURL, trackReferral } from '../services/referralService';

/**
 * معالج التسجيل مع دعم الإحالات
 */
export async function handleSignUpWithReferral(newUserId: string, userEmail: string) {
  try {
    // 1. الحصول على كود الإحالة من URL
    const referralCode = getReferralCodeFromURL();

    // 2. إذا وجد كود إحالة، تتبع الإحالة
    if (referralCode) {
      console.log('Tracking referral:', referralCode);
      const trackResult = await trackReferral(referralCode, newUserId);

      if (trackResult?.success) {
        console.log('✅ Referral tracked successfully');
        
        // 3. يمكن إرسال إشعار للمُحيل
        notifyReferrer(referralCode, userEmail);
      } else {
        console.warn('⚠️ Failed to track referral:', trackResult?.error);
      }
    } else {
      console.log('No referral code provided');
    }

    return {
      success: true,
      message: 'User registered successfully',
      referralTracked: !!referralCode,
    };
  } catch (error) {
    console.error('Error during sign-up with referral:', error);
    return {
      success: false,
      error: 'Failed to process sign-up',
    };
  }
}

/**
 * إرسال إشعار للمُحيل (اختياري)
 */
async function notifyReferrer(referralCode: string, newUserEmail: string) {
  try {
    // يمكن إرسال إشعار عبر البريد أو push notification
    console.log(`Notifying referrer: A new user (${newUserEmail}) has joined via your link!`);
    // await sendNotification(referralCode, newUserEmail);
  } catch (error) {
    console.error('Error notifying referrer:', error);
  }
}

/**
 * مثال على استخدام في صفحة التسجيل
 */
export function handleAuthSuccess(user: { id: string; email: string }) {
  // عند نجاح التسجيل
  handleSignUpWithReferral(user.id, user.email);
}

/**
 * مثال على معالجة الإحالة في Auth Callback
 */
export function processReferralInCallback(req: any, res: any) {
  const referralCode = req.query.ref as string | undefined;
  
  // حفظ في session
  if (referralCode && req.session) {
    req.session.referralCode = referralCode;
  }

  // توجيه مع الكود
  if (referralCode) {
    res.redirect(`/?ref=${encodeURIComponent(referralCode)}`);
  } else {
    res.redirect('/');
  }
}

/**
 * مثال على شاشة الترحيب بعد التسجيل
 */
export function WelcomeScreen({ isNewUser, referralCode }: { isNewUser: boolean; referralCode?: string }) {
  return (
    <div className="welcome-screen">
      <h2>🎉 Welcome to TWTC Mining!</h2>
      
      {isNewUser && referralCode && (
        <div className="referral-welcome">
          <p>You joined via a referral link!</p>
          <p>Start mining now and earn rewards.</p>
        </div>
      )}

      {isNewUser && !referralCode && (
        <div className="no-referral">
          <p>Invite friends and earn rewards!</p>
        </div>
      )}
    </div>
  );
}

/**
 * مثال على استدعاء في Signup Form
 */
/*
import { useState } from 'react';

export function SignupForm() {
  const [loading, setLoading] = useState(false);

  const handleSignup = async (formData: any) => {
    try {
      setLoading(true);
      
      // تسجيل المستخدم
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const newUser = await signupResponse.json();

      // معالجة الإحالة
      await handleSignUpWithReferral(newUser.id, newUser.email);

      // التوجيه للصفحة الرئيسية
      window.location.href = '/';
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSignup({
        email: 'user@example.com',
        password: 'password123',
      });
    }}>
      {/* form fields */}
    </form>
  );
}
*/
