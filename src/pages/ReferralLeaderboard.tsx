import React from 'react';
import { User } from '../models/User';

interface Props {
  currentUser: User;
  leaderboard: User[];
}

export default function ReferralLeaderboard({ currentUser, leaderboard }: Props) {
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 100);

  return (
    <div>
      <section>
        <h2>إحالاتك</h2>
        <div>
          <span>كود الإحالة: {currentUser.referralCode}</span>
          <span>عدد الإحالات: {currentUser.referralCount}</span>
        </div>
      </section>
      <section>
        <h2>لوحة الصدارة</h2>
        <div className="podium">
          {podium.map((user, idx) => (
            <div key={user.id} className={`podium-place place-${idx + 1}`}>
              <div className="avatar-placeholder" />
              <div>{user.username}</div>
              <div>{user.referralCount} إحالة</div>
              <div className={`medal medal-${idx + 1}`} />
            </div>
          ))}
        </div>
        <ol className="leaderboard-list">
          {rest.map((user, idx) => (
            <li key={user.id}>
              <span>{idx + 4}.</span>
              <span>{user.username}</span>
              <span>{user.referralCount} إحالة</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
