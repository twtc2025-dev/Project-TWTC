import { User } from '../models/User';

export function exportLeaderboardCSV(users: User[]): string {
  const header = 'Rank,Username,Referrals\n';
  const rows = users.map((u, i) => `${i + 1},${u.username},${u.referralCount}`).join('\n');
  return header + rows;
}
