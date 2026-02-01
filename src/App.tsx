import { useState, useEffect, useCallback } from 'react';
import { MiningStats } from './components/mining-stats';
import { CoinClicker } from './components/coin-clicker';
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
  energy: number;
  maxEnergy: number;
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
        energy: parsed.energy ?? 1000,
        maxEnergy: parsed.maxEnergy ?? 1000,
        startTime: parsed.startTime || Date.now(),
        userGroup: parsed.userGroup || Math.floor(Math.random() * 10) + 1,
        kycStatus: parsed.kycStatus || 'Not Started',
        currentBoost: parsed.currentBoost || 1,
        lastDailyReset: parsed.lastDailyReset || Date.now(),
        dailyTasks: parsed.dailyTasks || initialDailyTasks,
        miningCycleActive: parsed.miningCycleActive || false,
        lastMiningTime: parsed.lastMiningTime || 0
      };
    }
    return {
      coins: 0,
      energy: 1000,
      maxEnergy: 1000,
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
  const [showBoostQuiz, setShowBoostQuiz] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);

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
    localStorage.setItem('tourism-mining-v1', JSON.stringify(gameState));
  }, [gameState]);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.energy < prev.maxEnergy) {
          return { ...prev, energy: Math.min(prev.energy + 1, prev.maxEnergy) };
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const miningRate = gameState.upgrades.reduce((total, upgrade) => {
    return total + (upgrade.baseProduction * upgrade.count);
  }, 0.5) * gameState.currentBoost;

  useEffect(() => {
    if (gameState.miningCycleActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now - gameState.lastMiningTime > MINING_CYCLE_MS) {
          setGameState(prev => ({ ...prev, miningCycleActive: false }));
          setRewardAmount(40); // Base reward for 4h cycle
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
    if (gameState.energy < 100) {
      toast.error('Not enough energy to start cycle!');
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: 'Loading mandatory 60s Tourism Ad...',
        success: () => {
          setGameState(prev => ({
            ...prev,
            energy: prev.energy - 100,
            miningCycleActive: true,
            lastMiningTime: Date.now(),
            currentBoost: 1
          }));
          return 'Mining cycle started! Active for 4 hours.';
        },
        error: 'Failed to load ad.'
      }
    );
  }, [gameState.energy]);

  const handleBoost = useCallback(() => {
    if (!gameState.miningCycleActive) {
      toast.error('Start a mining cycle first!');
      return;
    }
    
    const tourismVideos = [
      { id: 'v1', title: 'Nature of Switzerland', country: 'Switzerland', question: 'What is the highest mountain in Switzerland?', answer: 'Matterhorn', options: ['Matterhorn', 'Mont Blanc', 'Mount Everest', 'Fuji'] },
      { id: 'v2', title: 'Culture of Japan', country: 'Japan', question: 'What is the traditional Japanese dress called?', answer: 'Kimono', options: ['Hanbok', 'Sari', 'Kimono', 'Toga'] }
    ];
    
    const randomVideo = tourismVideos[Math.floor(Math.random() * tourismVideos.length)];
    setSelectedVideo(randomVideo);
    
    toast.info(`Watching video: ${randomVideo.title}...`);
    setTimeout(() => {
      setShowBoostQuiz(true);
    }, 2000);
  }, [gameState.miningCycleActive]);

  const submitQuiz = (selectedOption: string) => {
    if (selectedOption === selectedVideo.answer) {
      setGameState(prev => ({
        ...prev,
        currentBoost: prev.currentBoost + 0.5
      }));
      toast.success('Correct answer! +50% Boost active.');
    } else {
      toast.error('Incorrect answer. No boost granted.');
    }
    setShowBoostQuiz(false);
    setSelectedVideo(null);
  };

  const handleTaskComplete = useCallback((taskId: string) => {
    setGameState(prev => {
      const task = prev.dailyTasks.find(t => t.id === taskId);
      if (!task || task.completed) return prev;
      setRewardAmount(task.reward);
      return {
        ...prev,
        coins: prev.coins + task.reward,
        dailyTasks: prev.dailyTasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
      };
    });
  }, []);

  const handleClaimAchievement = useCallback((achievementId: string) => {
    setGameState(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (!achievement || !achievement.completed || achievement.claimed) return prev;
      setRewardAmount(achievement.reward);
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
    if (gameState.energy <= 0) {
      toast.error('Out of energy!');
      return;
    }

    setGameState(prev => ({
      ...prev,
      energy: prev.energy - 1,
      coins: prev.coins + prev.clickPower * prev.currentBoost,
      totalMined: prev.totalMined + prev.clickPower * prev.currentBoost,
      totalClicks: prev.totalClicks + 1
    }));
  }, [gameState.miningCycleActive, gameState.currentBoost, gameState.energy]);

  return (
    <div className="min-h-screen bg-cyber-gradient pb-24 overflow-hidden text-white">
      <div className="relative z-10 max-w-md mx-auto">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-wider flex items-center gap-2">
              TWTC 
              <AnimatedCounter 
                value={gameState.coins} 
                className="text-2xl"
                prefix="₿"
                type="mining"
              />
            </h1>
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
            energy={gameState.energy}
            maxEnergy={gameState.maxEnergy}
          />

          <RewardPopup 
            isOpen={rewardAmount !== null}
            reward={rewardAmount || 0}
            onClose={() => setRewardAmount(null)}
          />

          {showBoostQuiz && selectedVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
              <Card className="w-full bg-card border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-lg">Quiz: {selectedVideo.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-medium">{selectedVideo.question}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedVideo.options.map((opt: string) => (
                      <Button key={opt} variant="outline" className="justify-start text-left hover:border-cyan-500" onClick={() => submitQuiz(opt)}>
                        {opt}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4 mt-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               <Button variant={activeTab === 'mates' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('mates')}>Mates</Button>
               <Button variant={activeTab === 'tasks' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('tasks')}>Tasks</Button>
               <Button variant={activeTab === 'boost' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('boost')}>Boost</Button>
               <Button variant={activeTab === 'staking' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('staking')}>Equipment</Button>
            </div>

            {activeTab === 'mates' && (
              <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                <CardHeader><CardTitle className="text-lg">Community - Group {gameState.userGroup}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Collaborate with fellow Group {gameState.userGroup} miners.</p>
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 text-sm">
                    🌍 Explore destinations together and share rewards!
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4 h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
                  <CardHeader><CardTitle className="text-lg">Daily Tourism Tasks</CardTitle></CardHeader>
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

            {activeTab === 'staking' && (
              <UpgradeShop
                upgrades={gameState.upgrades}
                coins={gameState.coins}
                onPurchase={(id) => setGameState(prev => {
                  const up = prev.upgrades.find(u => u.id === id);
                  if (!up || prev.coins < up.baseCost) return prev;
                  return {
                    ...prev,
                    coins: prev.coins - up.baseCost,
                    upgrades: prev.upgrades.map(u => u.id === id ? { ...u, count: u.count + 1 } : u)
                  }
                })}
                getUpgradeIcon={(key) => upgradeIcons[key as keyof typeof upgradeIcons]}
              />
            )}

            {activeTab === 'boost' && (
              <div className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="text-cyan-400" /> Tourism Boost</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Watch a tourism video and answer a question to boost your mining rate by 50% for this cycle.</p>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-500" onClick={handleBoost}>
                      Watch Video Boost
                    </Button>
                    <div className="text-center">
                       <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Active Boost: {(gameState.currentBoost * 100).toFixed(0)}%</Badge>
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
