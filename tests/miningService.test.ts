import { startMiningSession, updateMiningProgress, applyBoost } from '../src/services/miningService';
import { User } from '../src/models/User';

describe('Mining Service', () => {
  let user: User;

  beforeEach(() => {
    user = {
      id: 'u1',
      username: 'testuser',
      balance: 0,
      miningSessions: [],
      tasks: [],
      referrals: [],
      referralCode: 'ABC123',
      referralCount: 0,
    };
  });

  it('should start a mining session', () => {
    const session = startMiningSession(user);
    expect(session).toBeDefined();
    expect(user.miningSessions.length).toBe(1);
    expect(session?.isActive).toBe(true);
  });

  it('should update mining progress and add coins', () => {
    const session = startMiningSession(user);
    updateMiningProgress(user, session!.id, 3600); // ساعة واحدة
    expect(user.balance).toBeGreaterThan(0);
    expect(session!.coinsMined).toBeGreaterThan(0);
  });

  it('should apply boost and increase mining rate', () => {
    const session = startMiningSession(user);
    applyBoost(user, session!.id, 50);
    updateMiningProgress(user, session!.id, 3600);
    expect(session!.boostPercent).toBe(50);
    expect(user.balance).toBeGreaterThan(0);
  });
});
