export interface MiningSession {
  id: string;
  startTime: Date;
  endTime: Date;
  coinsMined: number;
  boostPercent: number; // 0-100
  isActive: boolean;
}

export interface TaskProgress {
  taskId: string;
  completed: boolean;
  rewardClaimed: boolean;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: "pending" | "confirmed" | "rewarded";
  rewardGiven: boolean;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  balance: number;
  miningSessions: MiningSession[];
  tasks: TaskProgress[];
  referrals: Referral[];
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  totalRewardsEarned: number;
  lastLeaderboardRewardDate?: Date;
  createdAt: Date;
}
