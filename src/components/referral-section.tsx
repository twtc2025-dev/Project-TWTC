import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Users, TrendingUp, CheckCircle2, Clock, Gift } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  rewardedReferrals: number;
  totalRewardsEarned: number;
  referralsList?: {
    id: string;
    username: string;
    status: "pending" | "confirmed" | "rewarded";
    createdAt: string;
  }[];
}

interface ReferralSectionProps {
  stats?: ReferralStats;
  isLoading?: boolean;
}

export function ReferralSection({ stats, isLoading = false }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!stats?.referralLink) return;

    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (!stats?.referralLink) return;

    const shareData = {
      title: "Join TWTC Mining",
      text: "Start mining crypto with my referral link!",
      url: stats.referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Share successful!");
      } else {
        // Fallback to copy
        handleCopyLink();
      }
    } catch (error) {
      if ((error as any).name !== "AbortError") {
        toast.error("Failed to share");
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-indigo-400" />
          <h3 className="font-bold text-white">Referral Program</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-700 rounded-lg" />
          <div className="h-8 bg-slate-700 rounded-lg" />
        </div>
      </Card>
    );
  }

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    rewarded: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    confirmed: <CheckCircle2 className="h-4 w-4" />,
    rewarded: <Gift className="h-4 w-4" />,
  };

  return (
    <div className="space-y-4">
      {/* Referral Code & Link Section */}
      <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users className="h-16 w-16 text-indigo-500" />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-indigo-400" />
          <h3 className="font-bold text-white">Referral Program</h3>
        </div>

        {stats && (
          <div className="space-y-4">
            {/* Referral Code */}
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Your Referral Code</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={stats.referralCode}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-center cursor-not-allowed"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className={`${
                    copied
                      ? "bg-green-600 hover:bg-green-600"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Referral Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono text-sm truncate">
                  {stats.referralLink}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className={`${
                    copied
                      ? "bg-green-600 hover:bg-green-600"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Share Button */}
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral Link
            </Button>
          </div>
        )}
      </Card>

      {/* Referral Stats */}
      <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <h3 className="font-bold text-white">Referral Statistics</h3>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Total Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
            >
              <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Total Referrals
              </p>
              <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
            </motion.div>

            {/* Active Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
            >
              <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Active
              </p>
              <p className="text-2xl font-bold text-blue-400">{stats.activeReferrals}</p>
            </motion.div>

            {/* Rewarded Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
            >
              <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Rewarded
              </p>
              <p className="text-2xl font-bold text-green-400">{stats.rewardedReferrals}</p>
            </motion.div>

            {/* Total Rewards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
            >
              <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Rewards Earned
              </p>
              <p className="text-2xl font-bold text-yellow-400">{stats.totalRewardsEarned}</p>
            </motion.div>
          </div>
        )}
      </Card>

      {/* Referrals List */}
      {stats?.referralsList && stats.referralsList.length > 0 && (
        <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <div className="mb-6">
            <h3 className="font-bold text-white mb-2">Recent Referrals</h3>
            <p className="text-xs text-slate-400">
              {stats.referralsList.length} referral{stats.referralsList.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-3">
            {stats.referralsList.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{referral.username}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 ${statusColors[referral.status]}`}
                >
                  {statusIcons[referral.status]}
                  <span className="capitalize text-xs">{referral.status}</span>
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {(!stats?.referralsList || stats.referralsList.length === 0) && (
        <Card className="p-8 bg-slate-900/50 border-slate-800 backdrop-blur-xl text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No referrals yet</p>
          <p className="text-xs text-slate-500">
            Share your referral link to start earning rewards!
          </p>
        </Card>
      )}
    </div>
  );
}
