import { User, MiningSession } from '../models/User';

const SESSION_DURATION = 4 * 60 * 60; // 4 ساعات بالثواني
const COINS_PER_SESSION = 20;
const BASE_RATE_PER_SECOND = COINS_PER_SESSION / SESSION_DURATION;

export function startMiningSession(user: User): MiningSession | null {
  // تحقق من انتهاء الجلسة السابقة
  const lastSession = user.miningSessions[user.miningSessions.length - 1];
  if (lastSession && lastSession.isActive) return null;

  const now = new Date();
  const session: MiningSession = {
    id: generateId(),
    startTime: now,
    endTime: new Date(now.getTime() + SESSION_DURATION * 1000),
    coinsMined: 0,
    boostPercent: 0,
    isActive: true,
  };
  user.miningSessions.push(session);
  return session;
}

export function updateMiningProgress(user: User, sessionId: string, elapsedSeconds: number) {
  const session = user.miningSessions.find(s => s.id === sessionId && s.isActive);
  if (!session) return;

  const boostMultiplier = 1 + (session.boostPercent / 100);
  const coinsToAdd = Math.min(
    (BASE_RATE_PER_SECOND * boostMultiplier * elapsedSeconds),
    COINS_PER_SESSION - session.coinsMined
  );
  session.coinsMined += coinsToAdd;
  user.balance += coinsToAdd;

  // إنهاء الجلسة إذا اكتملت
  if (session.coinsMined >= COINS_PER_SESSION) {
    session.isActive = false;
  }
}

export function applyBoost(user: User, sessionId: string, boostPercent: number) {
  const session = user.miningSessions.find(s => s.id === sessionId && s.isActive);
  if (!session) return false;
  session.boostPercent = Math.min(session.boostPercent + boostPercent, 100);
  return true;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}
