import { useState, useEffect } from 'react';
import { MiningStats } from './components/mining-stats';
import { UpgradeShop, Upgrade } from './components/upgrade-shop';
import { Achievements, Achievement } from './components/achievements';
import { BottomNav } from './components/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { AnimatedCounter } from './components/ui/animated-counter';
import { toast } from 'sonner';
import { Cpu, Monitor, Zap, Rocket, Target, Clock, Coins, Star, Shield, MapPin } from 'lucide-react';
import { RewardPopup } from './components/reward-popup';

export interface GameState {
  coins: number;
  totalMined: number;
  upgrades: Upgrade[];
  achievements: Achievement[];
  dailyTasks: DailyTask[];
  miningStartTime: number; // The absolute start of mining journey
  userGroup: number;
  kycStatus: 'Not Started' | 'Pending' | 'Verified';
  lastDailyReset: number;
  bonusFromTasks: number; // Store rewards separately to add to time-based calculation
}

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
  category: 'ad' | 'info' | 'interaction';
}

const MINING_RATE_PER_SEC = 40 / (4 * 60 * 60); // 40 coins per 4 hours

const initialDailyTasks: DailyTask[] = Array.from({ length: 20 }, (_, i) => ({
  id: `task-${i + 1}`,
  name: `Tourism Task #${i + 1}`,
  description: i % 2 === 0 ? 'Watch a 30s tourism ad' : 'Learn about a famous landmark',
  reward: 10 + Math.floor(Math.random() * 15),
  completed: false,
  category: i % 2 === 0 ? 'ad' : 'info'
}));

const initialUpgrades: Upgrade[] = [
  { id: 'cpu-miner', name: 'Base Station', description: 'Small tourism kiosk', baseCost: 10, costMultiplier: 1.15, baseProduction: 0.1, count: 0, iconKey: 'cpu-miner', tier: 'basic' },
  { id: 'gpu-miner', name: 'Travel Agency', description: 'Local travel agency network', baseCost: 100, costMultiplier: 1.15, baseProduction: 1, count: 0, iconKey: 'gpu-miner', tier: 'advanced' },
  { id: 'asic-miner', name: 'Airline Partner', description: 'Global flight network', baseCost: 1000, costMultiplier: 1.15, baseProduction: 8, count: 0, iconKey: 'asic-miner', tier: 'elite' },
  { id: 'quantum-miner', name: 'Global Tourism AI', description: 'AI-driven tourism optimization', baseCost: 10000, costMultiplier: 1.15, baseProduction: 47, count: 0, iconKey: 'quantum-miner', tier: 'legendary' }
];

const initialAchievements: Achievement[] = [
  { id: 'first-click', name: 'First Discovery', description: 'Start your tourism journey', target: 1, current: 0, completed: false, claimed: false, reward: 5, iconKey: 'first-click', category: 'mining' },
  { id: 'click-master', name: 'Global Traveler', description: 'Active for 1 day', target: 1, current: 0, completed: false, claimed: false, reward: 50, iconKey: 'click-master', category: 'mining' }
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('twtc-v3-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        miningStartTime: parsed.miningStartTime || Date.now(),
        bonusFromTasks: parsed.bonusFromTasks || 0,
        userGroup: parsed.userGroup || Math.floor(Math.random() * 10) + 1,
        kycStatus: parsed.kycStatus || 'Not Started',
        lastDailyReset: parsed.lastDailyReset || Date.now(),
        dailyTasks: parsed.dailyTasks || initialDailyTasks,
      };
    }
    return {
      coins: 0,
      totalMined: 0,
      upgrades: initialUpgrades,
      achievements: initialAchievements,
      dailyTasks: initialDailyTasks,
      miningStartTime: Date.now(),
      userGroup: Math.floor(Math.random() * 10) + 1,
      kycStatus: 'Not Started',
      lastDailyReset: Date.now(),
      bonusFromTasks: 0
    };
  });

  const [activeTab, setActiveTab] = useState('balance');
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);

  // Live calculation of coins based on time elapsed + bonuses
  const calculateCurrentBalance = (state: GameState) => {
    const elapsedSecs = (Date.now() - state.miningStartTime) / 1000;
    const timeBasedCoins = elapsedSecs * MINING_RATE_PER_SEC;
    return timeBasedCoins + state.bonusFromTasks;
  };

  const [displayBalance, setDisplayBalance] = useState(() => calculateCurrentBalance(gameState));

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayBalance(calculateCurrentBalance(gameState));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - gameState.lastDailyReset > oneDay) {
      setGameState(prev => ({
        ...prev,
        dailyTasks: initialDailyTasks,
        lastDailyReset: now
      }));
      toast.info('Daily tasks have been reset!');
    }
  }, [gameState.lastDailyReset]);

  useEffect(() => {
    localStorage.setItem('twtc-v3-state', JSON.stringify({
      ...gameState,
      coins: displayBalance // Sync display balance for persistence
    }));
  }, [gameState, displayBalance]);

  const handleTaskComplete = (taskId: string) => {
    setGameState(prev => {
      const task = prev.dailyTasks.find(t => t.id === taskId);
      if (!task || task.completed) return prev;
      setRewardAmount(task.reward);
      return {
        ...prev,
        bonusFromTasks: prev.bonusFromTasks + task.reward,
        dailyTasks: prev.dailyTasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
      };
    });
  };

  const handleClaimAchievement = (achievementId: string) => {
    setGameState(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (!achievement || !achievement.completed || achievement.claimed) return prev;
      setRewardAmount(achievement.reward);
      return {
        ...prev,
        bonusFromTasks: prev.bonusFromTasks + achievement.reward,
        achievements: prev.achievements.map(a => a.id === achievementId ? { ...a, claimed: true } : a)
      };
    });
  };

  const currentCycleProgress = ((Date.now() - gameState.miningStartTime) % (4 * 60 * 60 * 1000)) / (4 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-[#020617] pb-24 overflow-hidden text-white font-sans">
      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white/90">TWTC Network</h1>
            <Badge variant="outline" className="mt-1 border-cyan-500/30 text-cyan-400 bg-cyan-500/5 w-fit">
              Group {gameState.userGroup}
            </Badge>
          </div>
          <Shield className={`h-6 w-6 ${gameState.kycStatus === 'Verified' ? 'text-green-500' : 'text-white/20'}`} />
        </div>

        {/* Main Balance Display */}
        <div className="px-6 py-12 flex flex-col items-center justify-center space-y-4">
          <p className="text-sm font-medium text-white/40 uppercase tracking-[0.2em]">Total Balance</p>
          <div className="flex items-center gap-3">
             <span className="text-6xl font-pixel text-twtc-cyan">₿</span>
             <AnimatedCounter 
               value={displayBalance} 
               className="text-6xl"
               type="mining"
             />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-bold text-green-500/80 uppercase tracking-widest">Mining in Progress</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-black">
              <span>Current Cycle Progress</span>
              <span>{(currentCycleProgress * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-1000"
                style={{ width: `${currentCycleProgress * 100}%` }}
              />
            </div>
          </div>

          <RewardPopup 
            isOpen={rewardAmount !== null}
            reward={rewardAmount || 0}
            onClose={() => setRewardAmount(null)}
          />

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
             <button onClick={() => setActiveTab('balance')} className={`py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'balance' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>Home</button>
             <button onClick={() => setActiveTab('tasks')} className={`py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'tasks' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>Tasks</button>
             <button onClick={() => setActiveTab('boost')} className={`py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'boost' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>Boost</button>
             <button onClick={() => setActiveTab('staking')} className={`py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'staking' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>Gear</button>
          </div>

          {/* Content Area */}
          <div className="mt-4">
            {activeTab === 'balance' && (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                  <CardContent className="p-6">
                    <p className="text-sm text-white/60 leading-relaxed">
                      Your balance increases automatically every second based on global tourism activity. No manual clicking required.
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Rate</span>
                      <span className="text-sm font-pixel text-twtc-cyan">10.00 TWTC / HR</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4 h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                {gameState.dailyTasks.map(task => (
                  <Card key={task.id} className={`border-white/10 transition-all ${task.completed ? 'opacity-50' : 'hover:border-cyan-500/30'}`}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">{task.name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{task.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant={task.completed ? "outline" : "default"}
                        disabled={task.completed}
                        onClick={() => handleTaskComplete(task.id)}
                        className={task.completed ? "" : "bg-cyan-600 hover:bg-cyan-500 text-xs font-black"}
                      >
                        {task.completed ? 'DONE' : `+${task.reward}`}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'boost' && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h3 className="font-bold text-white/90">Video Boost</h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed uppercase tracking-wider">
                    Watch tourism documentaries to temporarily increase your mining rate by 50%.
                  </p>
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-black tracking-widest">
                    WATCH NOW
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'staking' && (
              <UpgradeShop
                upgrades={gameState.upgrades}
                coins={displayBalance}
                onPurchase={() => toast.info("Upgrades are managed by the network automatically.")}
                getUpgradeIcon={(key) => initialUpgrades.find(u => u.iconKey === key)?.iconKey || Cpu}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
