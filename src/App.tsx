import { useState, useEffect, useCallback } from 'react';
import { MiningStats } from './components/mining-stats';
import { CoinClicker } from './components/coin-clicker';
import { UpgradeShop, Upgrade } from './components/upgrade-shop';
import { Achievements, Achievement } from './components/achievements';
import { BottomNav } from './components/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { toast } from 'sonner';
import { Cpu, Monitor, Zap, Rocket, Target, Clock, Coins, Star, Settings, Menu, Bell, Shield, MapPin } from 'lucide-react';
import logoImage from './assets/a96ba8a5373f8da5de07788b57f28403a2c2cbee.png';

export interface GameState {
  coins: number;
  totalMined: number;
  clickPower: number;
  upgrades: Upgrade[];
  achievements: Achievement[];
  dailyTasks: DailyTask[];
  startTime: number;
  totalClicks: number;
  lastMiningTime: number;
  miningCycleActive: boolean;
  userGroup: number;
  kycStatus: 'Not Started' | 'Pending' | 'Verified';
  lastDailyReset: number;
  currentBoost: number;
}

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
  category: 'ad' | 'info' | 'interaction';
}

const MINING_CYCLE_MS = 4 * 60 * 60 * 1000; // 4 hours

const initialDailyTasks: DailyTask[] = Array.from({ length: 20 }, (_, i) => ({
  id: `task-${i + 1}`,
  name: `Tourism Task #${i + 1}`,
  description: i % 2 === 0 ? 'Watch a 30s tourism ad' : 'Learn about a famous landmark',
  reward: 10 + Math.floor(Math.random() * 15),
  completed: false,
  category: i % 2 === 0 ? 'ad' : 'info'
}));

const upgradeIcons = {
  'cpu-miner': Cpu,
  'gpu-miner': Monitor,
  'asic-miner': Zap,
  'quantum-miner': Rocket
};

const achievementIcons = {
  'first-click': Target,
  'click-master': Target,
  'first-hundred': Coins,
  'millionaire': Star,
  'time-keeper': Clock
};

const initialUpgrades: Upgrade[] = [
  { id: 'cpu-miner', name: 'Base Station', description: 'Small tourism kiosk', baseCost: 10, costMultiplier: 1.15, baseProduction: 0.1, count: 0, iconKey: 'cpu-miner', tier: 'basic' },
  { id: 'gpu-miner', name: 'Travel Agency', description: 'Local travel agency network', baseCost: 100, costMultiplier: 1.15, baseProduction: 1, count: 0, iconKey: 'gpu-miner', tier: 'advanced' },
  { id: 'asic-miner', name: 'Airline Partner', description: 'Global flight network', baseCost: 1000, costMultiplier: 1.15, baseProduction: 8, count: 0, iconKey: 'asic-miner', tier: 'elite' },
  { id: 'quantum-miner', name: 'Global Tourism AI', description: 'AI-driven tourism optimization', baseCost: 10000, costMultiplier: 1.15, baseProduction: 47, count: 0, iconKey: 'quantum-miner', tier: 'legendary' }
];

const initialAchievements: Achievement[] = [
  { id: 'first-click', name: 'First Discovery', description: 'Start your tourism journey', target: 1, current: 0, completed: false, claimed: false, reward: 5, iconKey: 'first-click', category: 'mining' },
  { id: 'click-master', name: 'Global Traveler', description: 'Click 100 times', target: 100, current: 0, completed: false, claimed: false, reward: 50, iconKey: 'click-master', category: 'mining' }
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('tourism-mining-v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        startTime: parsed.startTime || Date.now(),
        userGroup: parsed.userGroup || Math.floor(Math.random() * 10) + 1,
        kycStatus: parsed.kycStatus || 'Not Started',
        currentBoost: parsed.currentBoost || 1,
        lastDailyReset: parsed.lastDailyReset || Date.now(),
        dailyTasks: parsed.dailyTasks || initialDailyTasks
      };
    }
    return {
      coins: 0,
      totalMined: 0,
      clickPower: 1,
      upgrades: initialUpgrades,
      achievements: initialAchievements,
      dailyTasks: initialDailyTasks,
      startTime: Date.now(),
      totalClicks: 0,
      lastMiningTime: 0,
      miningCycleActive: false,
      userGroup: Math.floor(Math.random() * 10) + 1,
      kycStatus: 'Not Started',
      lastDailyReset: Date.now(),
      currentBoost: 1
    };
  });

  const [activeTab, setActiveTab] = useState('mates');

  // Daily reset check
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

  // Persistence
  useEffect(() => {
    localStorage.setItem('tourism-mining-v1', JSON.stringify(gameState));
  }, [gameState]);

  const miningRate = gameState.upgrades.reduce((total, upgrade) => {
    return total + (upgrade.baseProduction * upgrade.count);
  }, 0.5) * gameState.currentBoost;

  // Auto-mining (only if cycle is active)
  useEffect(() => {
    if (gameState.miningCycleActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now - gameState.lastMiningTime > MINING_CYCLE_MS) {
          setGameState(prev => ({ ...prev, miningCycleActive: false }));
          toast.info('Mining cycle finished. Start a new one!');
          return;
        }
        
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + miningRate / 10,
          totalMined: prev.totalMined + miningRate / 10
        }));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameState.miningCycleActive, miningRate, gameState.lastMiningTime]);

  const startMiningCycle = useCallback(() => {
    // Simulate mandatory ad (60s simulation in UI usually, but here we just start)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Loading mandatory 60s Tourism Ad...',
        success: () => {
          setGameState(prev => ({
            ...prev,
            miningCycleActive: true,
            lastMiningTime: Date.now(),
            currentBoost: 1 // Reset boost on new cycle
          }));
          return 'Mining cycle started! Active for 4 hours.';
        },
        error: 'Failed to load ad.'
      }
    );
  }, []);

  const handleBoost = useCallback((boostAmount: number) => {
    setGameState(prev => ({
      ...prev,
      currentBoost: prev.currentBoost + boostAmount
    }));
    toast.success(`Boost active! Mining rate increased by ${(boostAmount * 100).toFixed(0)}%`);
  }, []);

  const handleTaskComplete = useCallback((taskId: string) => {
    setGameState(prev => {
      const task = prev.dailyTasks.find(t => t.id === taskId);
      if (!task || task.completed) return prev;
      return {
        ...prev,
        coins: prev.coins + task.reward,
        dailyTasks: prev.dailyTasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
      };
    });
    toast.success('Task completed! Reward added.');
  }, []);

  const handleClaimAchievement = useCallback((achievementId: string) => {
    setGameState(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (!achievement || !achievement.completed || achievement.claimed) return prev;
      return {
        ...prev,
        coins: prev.coins + achievement.reward,
        achievements: prev.achievements.map(a => a.id === achievementId ? { ...a, claimed: true } : a)
      };
    });
  }, []);

  const handleMine = useCallback(() => {
    if (!gameState.miningCycleActive) {
      toast.error('Start a mining cycle first!');
      return;
    }
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + prev.clickPower * prev.currentBoost,
      totalMined: prev.totalMined + prev.clickPower * prev.currentBoost,
      totalClicks: prev.totalClicks + 1
    }));
  }, [gameState.miningCycleActive, gameState.currentBoost]);

  return (
    <div className="min-h-screen bg-cyber-gradient pb-24 overflow-hidden text-white">
      <div className="fixed inset-0 bg-neon-glow pointer-events-none" />
      <div className="relative z-10 max-w-md mx-auto">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold tracking-wider">TourismCoin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              Group {gameState.userGroup}
            </Badge>
            <Shield className={`h-5 w-5 ${gameState.kycStatus === 'Verified' ? 'text-green-500' : 'text-gray-500'}`} />
          </div>
        </div>

        <div className="px-4">
          <CoinClicker
            onMine={handleMine}
            clickPower={gameState.clickPower}
            isAutoMining={gameState.miningCycleActive}
            balance={gameState.coins}
            lastMiningTime={gameState.lastMiningTime}
            miningActive={gameState.miningCycleActive}
            onStartCycle={startMiningCycle}
          />

          <div className="space-y-4 mt-6">
            {activeTab === 'mates' && (
              <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                <CardHeader><CardTitle className="text-lg">Travel Community</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Join Group {gameState.userGroup} members in exploring the world.</p>
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 text-sm">
                    🌍 Explore global landmarks and earn together!
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4 h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                  <CardHeader><CardTitle className="text-lg">Daily Tasks (20 Left)</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {gameState.dailyTasks.map(task => (
                      <div key={task.id} className={`p-3 rounded-lg border flex justify-between items-center ${task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                        <div>
                          <p className="font-medium text-sm">{task.name}</p>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={task.completed ? "outline" : "default"}
                          disabled={task.completed}
                          onClick={() => handleTaskComplete(task.id)}
                        >
                          {task.completed ? 'Done' : `+${task.reward}`}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Achievements achievements={gameState.achievements} onClaim={handleClaimAchievement} getAchievementIcon={(key) => achievementIcons[key as keyof typeof achievementIcons]} />
              </div>
            )}

            {activeTab === 'boost' && (
              <div className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="text-cyan-400" /> Tourism Boost</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Watch a tourism video and answer a question to boost your mining rate for this cycle.</p>
                    <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <p className="font-bold text-cyan-400 mb-1">Featured Destination: Dubai</p>
                      <p className="text-xs mb-3">Watch the 3-minute exploration video.</p>
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-500" onClick={() => handleBoost(0.5)}>
                        Watch & Verify (+50% Boost)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <MiningStats coins={gameState.coins} miningRate={miningRate} totalMined={gameState.totalMined} startTime={gameState.startTime} />
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} unclaimedAchievements={gameState.achievements.filter(a => a.completed && !a.claimed).length} />
    </div>
  );
}
