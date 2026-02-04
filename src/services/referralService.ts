import { User, Referral } from '../models/User';

const REFERRAL_REWARD = 50;

/**
 * Get referral data for the current user
 */
export async function getReferralData() {
  try {
    const response = await fetch('/api/referral/me');
    if (!response.ok) throw new Error('Failed to fetch referral data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return null;
  }
}

/**
 * Get referral statistics
 */
export async function getReferralStats() {
  try {
    const response = await fetch('/api/referral/stats');
    if (!response.ok) throw new Error('Failed to fetch referral stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return null;
  }
}

/**
 * Track a referral when a new user signs up
 */
export async function trackReferral(referralCode: string, newUserId: string) {
  try {
    const response = await fetch('/api/referral/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode,
        newUserId,
      }),
    });

    if (!response.ok) throw new Error('Failed to track referral');
    return await response.json();
  } catch (error) {
    console.error('Error tracking referral:', error);
    return null;
  }
}

/**
 * Process reward for a referral
 */
export async function processReferralReward(referralId: string) {
  try {
    const response = await fetch('/api/referral/reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralId,
      }),
    });

    if (!response.ok) throw new Error('Failed to process reward');
    return await response.json();
  } catch (error) {
    console.error('Error processing reward:', error);
    return null;
  }
}

/**
 * Confirm a referral (local function)
 */
export function confirmReferral(referrer: User, referredUserId: string) {
  const referral = referrer.referrals.find(r => r.referredUserId === referredUserId);
  if (!referral || referral.status === 'confirmed' || referral.status === 'rewarded') return false;

  referral.status = 'confirmed';
  referrer.balance += REFERRAL_REWARD;
  referrer.totalRewardsEarned += REFERRAL_REWARD;
  referrer.referralCount += 1;
  return true;
}

/**
 * Get referral code from URL
 */
export function getReferralCodeFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}

/**
 * Copy referral link to clipboard
 */
export async function copyReferralLink(referralLink: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(referralLink);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Share referral link (using native Share API if available)
 */
export async function shareReferralLink(title: string, text: string, referralLink: string): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url: referralLink,
      });
      return true;
    } else {
      // Fallback to copy
      return await copyReferralLink(referralLink);
    }
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}
