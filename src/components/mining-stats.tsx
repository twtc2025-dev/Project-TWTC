import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Coins, Zap, TrendingUp, Clock, Map } from 'lucide-react';

interface MiningStatsProps {
  coins: number;
  miningRate: number;
  totalMined: number;
  startTime: number;
}

export function MiningStats({ coins, miningRate, totalMined, startTime }: MiningStatsProps) {
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(1);
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mining Rate</CardTitle>
          <Zap className="h-3 w-3 text-cyan-400" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-lg font-bold text-cyan-400">{formatNumber(miningRate)}/s</div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Discovered</CardTitle>
          <Map className="h-3 w-3 text-purple-400" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-lg font-bold text-purple-400">{formatNumber(totalMined)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
