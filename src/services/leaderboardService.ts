import { User } from '../models/User';

const LEADERBOARD_REWARD = [100, 50, 25]; // مثال: مكافآت المراكز الثلاثة الأولى

export function getReferralLeaderboard(users: User[]) {
  // ترتيب حسب عدد الإحالات ثم أقدمية أول إحالة
  return users
    .filter(u => u.referralCount > 0)
    .sort((a, b) => {
      if (b.referralCount !== a.referralCount) return b.referralCount - a.referralCount;
      const aFirst = a.referrals.find(r => r.confirmed)?.createdAt?.getTime() || 0;
      const bFirst = b.referrals.find(r => r.confirmed)?.createdAt?.getTime() || 0;
      return aFirst - bFirst;
    })
    .slice(0, 100);
}

export function distributeLeaderboardRewards(users: User[]) {
  const leaderboard = getReferralLeaderboard(users);
  for (let i = 0; i < 3; i++) {
    const user = leaderboard[i];
    if (user && (!user.lastLeaderboardRewardDate || isNewDay(user.lastLeaderboardRewardDate))) {
      user.balance += LEADERBOARD_REWARD[i];
      user.lastLeaderboardRewardDate = new Date();
    }
  }
}

function isNewDay(date: Date) {
  const now = new Date();
  return now.toDateString() !== date.toDateString();
}
