import { motion } from 'framer-motion';
import { User, Shield, Coins, Timer, CheckCircle2, Play, History, Edit2, ChevronRight, Zap } from 'lucide-react';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ReferralSection } from './referral-section';
import { DailyTask, GameState } from '../App';
import { useState, useEffect } from 'react';

interface UserProfileProps {
  gameState: GameState;
  onEditProfile: () => void;
  onViewTasks: () => void;
  onTransactionHistory: () => void;
  onStartMining: () => void;
}

export function UserProfile({ 
  gameState, 
  onEditProfile, 
  onViewTasks, 
  onTransactionHistory,
  onStartMining 
}: UserProfileProps) {
  const [referralStats, setReferralStats] = useState(null);
  const [referralLoading, setReferralLoading] = useState(true);

  useEffect(() => {
    // Fetch referral data
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setReferralLoading(true);
      const response = await fetch('/api/referral/me');
      if (response.ok) {
        const data = await response.json();
        setReferralStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setReferralLoading(false);
    }
  };

  const kycColors = {
    'Not Started': 'bg-slate-500',
    'Pending': 'bg-yellow-500',
    'Verified': 'bg-green-500'
  };

  const miningProgress = gameState.miningCycleActive ? 
    Math.min(((Date.now() - gameState.lastMiningTime) / (4 * 60 * 60 * 1000)) * 100, 100) : 0;

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-4">
      {/* 1. Basic Info & Header */}
      <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {gameState.userGroup || 'U'}
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-lg border border-slate-800"
            >
              <Shield className={`h-4 w-4 ${gameState.kycStatus === 'Verified' ? 'text-green-500' : 'text-slate-400'}`} />
            </motion.div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">Web3 Explorer</h2>
            <p className="text-slate-400 text-sm font-mono">ID: #{gameState.startTime ? gameState.startTime.toString().slice(-6) : '000000'}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className={`${kycColors[gameState.kycStatus]} text-white border-0`}>
                KYC: {gameState.kycStatus}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onEditProfile} className="text-slate-400">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Balance</p>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-black text-white">{gameState.coins.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Mined</p>
            <span className="text-xl font-bold text-slate-300">{gameState.totalMined.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* 2. Mining Activity */}
      <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-white">Mining Activity</h3>
          </div>
          {!gameState.miningCycleActive && (
            <Button size="sm" onClick={onStartMining} className="bg-indigo-600 hover:bg-indigo-500">
              Start Cycle
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Current Cycle Progress</span>
              <span className="text-indigo-400 font-medium">{Math.floor(miningProgress)}%</span>
            </div>
            <Progress value={miningProgress} className="h-2 bg-slate-800" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase mb-1">4h Cycles</p>
              <p className="text-lg font-bold text-white">{(gameState.totalClicks / 100).toFixed(0)}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Active Boost</p>
              <p className="text-lg font-bold text-indigo-400">x{gameState.currentBoost}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Referral Section */}
      <ReferralSection stats={referralStats} isLoading={referralLoading} />

      {/* 4. Daily Tasks Summary */}
      <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-white">Daily Quests</h3>
          <Button variant="link" onClick={onViewTasks} className="text-indigo-400 h-auto p-0">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {gameState.dailyTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${task.completed ? 'bg-green-500/20 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white line-clamp-1">{task.name}</p>
                  <p className="text-xs text-yellow-500">+{task.reward} Coins</p>
                </div>
              </div>
              {task.completed ? (
                <Badge variant="outline" className="text-green-500 border-green-500/30">Done</Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500 border-slate-700">Pending</Badge>
              )}
            </div>
          ))}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 italic">
              {gameState.dailyTasks.filter(t => t.completed).length} / {gameState.dailyTasks.length} tasks completed
            </p>
          </div>
        </div>
      </Card>

      {/* 5. Boost & Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={onTransactionHistory}
          variant="outline" 
          className="h-24 flex-col gap-2 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300"
        >
          <History className="h-6 w-6 text-blue-400" />
          <span>History</span>
        </Button>
        <Button 
          className="h-24 flex-col gap-2 bg-gradient-to-br from-yellow-500 to-orange-600 border-0 hover:opacity-90 shadow-lg shadow-orange-500/20"
        >
          <Zap className="h-6 w-6 text-white" />
          <span>Boost Now</span>
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Play className="h-4 w-4 text-white fill-current" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Daily Ad Boost</p>
            <p className="text-xs text-indigo-300">Watch & earn x2 multiplier</p>
          </div>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500">Watch</Button>
      </div>
    </div>
  );
}
