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
  referredUserId: string;
  confirmed: boolean;
  createdAt: Date;
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
  referralCount: number;
  lastLeaderboardRewardDate?: Date;
}
