import { User, Referral } from '../models/User';

const REFERRAL_REWARD = 50;

export function confirmReferral(referrer: User, referredUserId: string) {
  const referral = referrer.referrals.find(r => r.referredUserId === referredUserId);
  if (!referral || referral.confirmed) return false;

  referral.confirmed = true;
  referrer.balance += REFERRAL_REWARD;
  referrer.referralCount += 1;
  return true;
}
