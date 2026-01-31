import { useState, useEffect, useCallback } from 'react';
import { MiningStats } from './components/mining-stats';
import { CoinClicker } from './components/coin-clicker';
import { UpgradeShop, Upgrade } from './components/upgrade-shop';
import { Achievements, Achievement } from './components/achievements';
import { BottomNav } from './components/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { toast } from 'sonner@2.0.3';
import { Cpu, Monitor, Zap, Rocket, Target, Clock, Coins, Star, Settings, Menu, Bell } from 'lucide-react';
import logoImage from 'figma:asset/a96ba8a5373f8da5de07788b57f28403a2c2cbee.png';

interface GameState {
  coins: number;
  totalMined: number;
  clickPower: number;
  upgrades: Upgrade[];
  achievements: Achievement[];
  startTime: number;
  totalClicks: number;
}

// Icon mapping to avoid serialization issues
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
  {
    id: 'cpu-miner',
    name: 'CPU Miner',
    description: 'Basic mining rig using your computer CPU',
    baseCost: 10,
    costMultiplier: 1.15,
    baseProduction: 0.1,
    count: 0,
    iconKey: 'cpu-miner',
    tier: 'basic'
  },
  {
    id: 'gpu-miner',
    name: 'GPU Miner',
    description: 'Graphics card mining setup with better efficiency',
    baseCost: 100,
    costMultiplier: 1.15,
    baseProduction: 1,
    count: 0,
    iconKey: 'gpu-miner',
    tier: 'advanced'
  },
  {
    id: 'asic-miner',
    name: 'ASIC Miner',
    description: 'Professional mining hardware for serious miners',
    baseCost: 1000,
    costMultiplier: 1.15,
    baseProduction: 8,
    count: 0,
    iconKey: 'asic-miner',
    tier: 'elite'
  },
  {
    id: 'quantum-miner',
    name: 'Quantum Miner',
    description: 'Next-gen quantum computing mining station',
    baseCost: 10000,
    costMultiplier: 1.15,
    baseProduction: 47,
    count: 0,
    iconKey: 'quantum-miner',
    tier: 'legendary'
  }
];

const initialAchievements: Achievement[] = [
  {
    id: 'first-click',
    name: 'First Click',
    description: 'Click the mining button for the first time',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    reward: 5,
    iconKey: 'first-click',
    category: 'mining'
  },
  {
    id: 'click-master',
    name: 'Click Master',
    description: 'Click the mining button 100 times',
    target: 100,
    current: 0,
    completed: false,
    claimed: false,
    reward: 50,
    iconKey: 'click-master',
    category: 'mining'
  },
  {
    id: 'first-hundred',
    name: 'First Hundred',
    description: 'Earn your first 100 coins',
    target: 100,
    current: 0,
    completed: false,
    claimed: false,
    reward: 25,
    iconKey: 'first-hundred',
    category: 'earning'
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Accumulate 1,000,000 total coins',
    target: 1000000,
    current: 0,
    completed: false,
    claimed: false,
    reward: 5000,
    iconKey: 'millionaire',
    category: 'earning'
  },
  {
    id: 'time-keeper',
    name: 'Time Keeper',
    description: 'Play for 30 minutes straight',
    target: 1800000, // 30 minutes in milliseconds
    current: 0,
    completed: false,
    claimed: false,
    reward: 100,
    iconKey: 'time-keeper',
    category: 'time'
  }
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('crypto-mining-game');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Restore upgrades with fresh initial data to ensure proper structure
      const restoredUpgrades = initialUpgrades.map(initialUpgrade => {
        const savedUpgrade = parsed.upgrades?.find((u: any) => u.id === initialUpgrade.id);
        return {
          ...initialUpgrade,
          count: savedUpgrade?.count || 0
        };
      });

      // Restore achievements with fresh initial data to ensure proper structure  
      const restoredAchievements = initialAchievements.map(initialAchievement => {
        const savedAchievement = parsed.achievements?.find((a: any) => a.id === initialAchievement.id);
        return {
          ...initialAchievement,
          current: savedAchievement?.current || 0,
          completed: savedAchievement?.completed || false,
          claimed: savedAchievement?.claimed || false
        };
      });
      
      return {
        ...parsed,
        upgrades: restoredUpgrades,
        achievements: restoredAchievements,
        startTime: parsed.startTime || Date.now()
      };
    }
    return {
      coins: 0,
      totalMined: 0,
      clickPower: 1,
      upgrades: initialUpgrades,
      achievements: initialAchievements,
      startTime: Date.now(),
      totalClicks: 0
    };
  });

  const [activeTab, setActiveTab] = useState('mates');

  // Helper functions to get icons
  const getUpgradeIcon = (iconKey: string): React.ComponentType<{ className?: string }> | null => {
    return upgradeIcons[iconKey as keyof typeof upgradeIcons] || null;
  };

  const getAchievementIcon = (iconKey: string): React.ComponentType<{ className?: string }> | null => {
    return achievementIcons[iconKey as keyof typeof achievementIcons] || null;
  };

  // Auto-save to localStorage (exclude icon functions)
  useEffect(() => {
    const saveState = {
      ...gameState,
      // Only save serializable data, icons will be restored from mapping
      upgrades: gameState.upgrades.map(u => ({
        id: u.id,
        count: u.count
      })),
      achievements: gameState.achievements.map(a => ({
        id: a.id,
        current: a.current,
        completed: a.completed,
        claimed: a.claimed
      }))
    };
    localStorage.setItem('crypto-mining-game', JSON.stringify(saveState));
  }, [gameState]);

  // Calculate mining rate from upgrades
  const miningRate = gameState.upgrades.reduce((total, upgrade) => {
    return total + (upgrade.baseProduction * upgrade.count);
  }, 0);

  const isAutoMining = miningRate > 0;

  // Auto-mining effect
  useEffect(() => {
    if (miningRate > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + miningRate / 10, // Update 10 times per second for smooth animation
          totalMined: prev.totalMined + miningRate / 10
        }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [miningRate]);

  // Update achievements
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement => {
        let current = achievement.current;
        
        switch (achievement.id) {
          case 'first-click':
          case 'click-master':
            current = prev.totalClicks;
            break;
          case 'first-hundred':
          case 'millionaire':
            current = prev.totalMined;
            break;
          case 'time-keeper':
            current = Date.now() - prev.startTime;
            break;
        }

        const completed = current >= achievement.target;
        if (completed && !achievement.completed) {
          toast.success(`Achievement unlocked: ${achievement.name}!`);
        }

        return {
          ...achievement,
          current,
          completed
        };
      })
    }));
  }, [gameState.totalClicks, gameState.totalMined, gameState.startTime]);

  const handleMine = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + prev.clickPower,
      totalMined: prev.totalMined + prev.clickPower,
      totalClicks: prev.totalClicks + 1
    }));
  }, []);

  const handlePurchaseUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return prev;

      const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
      if (prev.coins < cost) return prev;

      toast.success(`Purchased ${upgrade.name}!`);

      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: prev.upgrades.map(u =>
          u.id === upgradeId
            ? { ...u, count: u.count + 1 }
            : u
        )
      };
    });
  }, []);

  const handleClaimAchievement = useCallback((achievementId: string) => {
    setGameState(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (!achievement || !achievement.completed) return prev;

      toast.success(`Claimed ${achievement.reward} coins from ${achievement.name}!`);

      return {
        ...prev,
        coins: prev.coins + achievement.reward,
        achievements: prev.achievements.map(a =>
          a.id === achievementId
            ? { ...a, claimed: true }
            : a
        )
      };
    });
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      const newState: GameState = {
        coins: 0,
        totalMined: 0,
        clickPower: 1,
        upgrades: initialUpgrades,
        achievements: initialAchievements,
        startTime: Date.now(),
        totalClicks: 0
      };
      setGameState(newState);
      localStorage.setItem('crypto-mining-game', JSON.stringify(newState));
      toast.success('Game reset successfully!');
    }
  };

  // Calculate energy/progress (mock value based on clicks)
  const energyProgress = ((gameState.totalClicks % 4500) / 4500) * 100;
  const currentEnergy = gameState.totalClicks % 4500;
  const maxEnergy = 4500;

  const unclaimedCount = gameState.achievements.filter(a => a.completed && !a.claimed).length;

  return (
    <div className="min-h-screen bg-cyber-gradient pb-24 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 bg-neon-glow pointer-events-none" />
      
      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="TWTC Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold tracking-wider">TWTC</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Menu className="h-6 w-6" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell className="h-6 w-6" />
            </button>
            <button 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={handleReset}
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Coin Area */}
        <div className="px-4">
          <CoinClicker
            onMine={handleMine}
            clickPower={gameState.clickPower}
            isAutoMining={isAutoMining}
            balance={gameState.coins}
          />

          {/* Progress Bar */}
          <div className="mb-8 space-y-2">
            <div className="relative">
              <Progress value={energyProgress} className="h-3 bg-gray-800/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-1 text-xs font-bold text-white drop-shadow-lg">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  {currentEnergy.toLocaleString()}/{maxEnergy.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area based on Active Tab */}
          <div className="space-y-4">
            {activeTab === 'mates' && (
              <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-lg">Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Connect with fellow travelers and miners around the world.
                  </p>
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm">🌍 Coming soon: Invite friends and explore destinations together!</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Achievements
                      achievements={gameState.achievements}
                      onClaim={handleClaimAchievement}
                      getAchievementIcon={getAchievementIcon}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'staking' && (
              <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mining Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <UpgradeShop
                    upgrades={gameState.upgrades}
                    coins={gameState.coins}
                    onPurchase={handlePurchaseUpgrade}
                    getUpgradeIcon={getUpgradeIcon}
                  />
                </CardContent>
              </Card>
            )}

            {activeTab === 'boost' && (
              <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-lg">Boost & Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <MiningStats
                    coins={gameState.coins}
                    miningRate={miningRate}
                    totalMined={gameState.totalMined}
                    startTime={gameState.startTime}
                  />
                  <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-sm mb-2">🚀 Boost your mining rate!</p>
                    <p className="text-xs text-muted-foreground">
                      Purchase upgrades in the Equipment tab to increase your passive income.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unclaimedAchievements={unclaimedCount}
      />
    </div>
  );
}