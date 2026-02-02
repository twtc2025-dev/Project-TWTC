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
import { Cpu, Monitor, Zap, Rocket, Target, Clock, Coins, Star, Shield, MapPin, Play } from 'lucide-react';
import { RewardPopup } from './components/reward-popup';
import { cn } from './lib/utils';

import logo from './assets/logo.jpg';

import { UserProfile } from './components/user-profile';

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
  miningStartTime: number;
  bonusFromTasks: number;
}

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
  category: 'ad' | 'info' | 'interaction';
}

const MINING_CYCLE_MS = 4 * 60 * 60 * 1000;
const MINING_RATE_PER_SEC = 40 / (4 * 60 * 60);

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
        energy: parsed.energy ?? 1000,
        maxEnergy: parsed.maxEnergy ?? 1000,
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
      miningStartTime: Date.now(),
      bonusFromTasks: 0,
      currentBoost: 1
    };
  });

  const [activeTab, setActiveTab] = useState('mine');
  const [showBoostQuiz, setShowBoostQuiz] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);

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
      coins: displayBalance
    }));
  }, [gameState, displayBalance]);

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
        bonusFromTasks: prev.bonusFromTasks + task.reward,
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
        bonusFromTasks: prev.bonusFromTasks + achievement.reward,
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
      totalMined: prev.totalMined + prev.clickPower * prev.currentBoost,
      totalClicks: prev.totalClicks + 1
    }));
  }, [gameState.miningCycleActive, gameState.currentBoost, gameState.energy]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <UserProfile
            gameState={gameState}
            onEditProfile={() => toast.info("Profile editing coming soon!")}
            onViewTasks={() => setActiveTab('tasks')}
            onTransactionHistory={() => toast.info("Transaction history coming soon!")}
            onStartMining={startMiningCycle}
          />
        );
      case 'mates':
        return (
          <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
            <CardHeader><CardTitle className="text-lg">Community - Group {gameState.userGroup}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Collaborate with fellow Group {gameState.userGroup} miners.</p>
              <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 text-sm">
                🌍 Explore destinations together and share rewards!
              </div>
            </CardContent>
          </Card>
        );
      case 'tasks':
        return (
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
            <Achievements achievements={gameState.achievements} onClaim={handleClaimAchievement} getAchievementIcon={(key) => initialAchievements.find(a => a.iconKey === key)?.iconKey || Target} />
          </div>
        );
      case 'staking':
        return (
          <UpgradeShop
            upgrades={gameState.upgrades}
            coins={displayBalance}
            onPurchase={() => toast.info("Upgrades are managed by the network automatically.")}
            getUpgradeIcon={(key) => initialUpgrades.find(u => u.iconKey === key)?.iconKey || Cpu}
          />
        );
      case 'boost':
        return (
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
            <MiningStats coins={displayBalance} miningRate={MINING_RATE_PER_SEC * 3600} totalMined={gameState.totalMined} startTime={gameState.startTime} />
          </div>
        );
      default:
        return (
          <CoinClicker
            onMine={handleMine}
            clickPower={gameState.clickPower}
            isAutoMining={gameState.miningCycleActive}
            balance={displayBalance}
            lastMiningTime={gameState.lastMiningTime}
            miningActive={gameState.miningCycleActive}
            onStartCycle={startMiningCycle}
            energy={gameState.energy}
            maxEnergy={gameState.maxEnergy}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-cyber-gradient overflow-hidden text-white flex justify-center">
      <div className="relative z-10 w-full max-w-md h-screen flex flex-col pt-2">
        {/* Header - Styled as Mobile App Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-white/90 uppercase">TWTC</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-purple-500/10 border-purple-500/50 text-purple-400 text-[10px] px-3 h-7 rounded-full"
              onClick={() => window.location.href = '/api/login'}
            >
              Login
            </Button>
            <Badge variant="outline" className="bg-purple-500/10 border-purple-500/50 text-purple-400 text-[10px] px-2 py-0">
              Group {gameState.userGroup}
            </Badge>
            <Shield className={`h-5 w-5 ${gameState.kycStatus === 'Verified' ? 'text-green-500' : 'text-white/20'}`} />
          </div>
        </div>

        <div className="flex-1 px-4 overflow-hidden flex flex-col">
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

          <div className="space-y-4 mt-2 flex-1 flex flex-col overflow-hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
               <Button variant={activeTab === 'mine' ? 'default' : 'ghost'} size="sm" className={cn("rounded-full px-4 text-xs h-8 whitespace-nowrap", activeTab === 'mine' && "bg-indigo-600")} onClick={() => setActiveTab('mine')}>Mine</Button>
               <Button variant={activeTab === 'mates' ? 'default' : 'ghost'} size="sm" className={cn("rounded-full px-4 text-xs h-8 whitespace-nowrap", activeTab === 'mates' && "bg-indigo-600")} onClick={() => setActiveTab('mates')}>Mates</Button>
               <Button variant={activeTab === 'tasks' ? 'default' : 'ghost'} size="sm" className={cn("rounded-full px-4 text-xs h-8 whitespace-nowrap", activeTab === 'tasks' && "bg-indigo-600")} onClick={() => setActiveTab('tasks')}>Tasks</Button>
               <Button variant={activeTab === 'boost' ? 'default' : 'ghost'} size="sm" className={cn("rounded-full px-4 text-xs h-8 whitespace-nowrap", activeTab === 'boost' && "bg-indigo-600")} onClick={() => setActiveTab('boost')}>Boost</Button>
               <Button variant={activeTab === 'staking' ? 'default' : 'ghost'} size="sm" className={cn("rounded-full px-4 text-xs h-8 whitespace-nowrap", activeTab === 'staking' && "bg-indigo-600")} onClick={() => setActiveTab('staking')}>Tools</Button>
               <Button variant={activeTab === 'profile' ? 'default' : 'ghost'} size="sm" className={cn("rounded-full px-4 text-xs h-8 whitespace-nowrap", activeTab === 'profile' && "bg-indigo-600")} onClick={() => setActiveTab('profile')}>Profile</Button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto">
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} unclaimedAchievements={gameState.achievements.filter(a => a.completed && !a.claimed).length} />
        </div>
      </div>
    </div>
  );
}
